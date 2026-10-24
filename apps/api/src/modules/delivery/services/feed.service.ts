import { DeliveryError } from '../delivery.errors';
import { Injectable } from '@nestjs/common';
import { NotificationStateService } from '../../task-notifications/services/notification-state.service';
import { DatabaseService } from './../../../database/database.service';
import type { User } from './../../../database/schemas/user.schema';
import type { FeedMessage } from './../../../database/schemas/feed-message.schema';
import { ApiError } from './../../../common/errors/api-error';
import { present, pageSize } from './../../../common/utils/presentation';
import type { PageInput } from './../../../common/utils/presentation';
import { decodeCursor, encodeCursor } from './../../../common/utils/pagination';
import { PhrasesService, rateableCategories } from './../../phrases/phrases.service';
import { TasksService } from './../../tasks/tasks.service';
import { PressureService } from './../../pressure/pressure.service';
import { AnalyticsService } from './../../analytics/analytics.service';
import type { FeedMessageResponseView, FeedListResponseView } from './../delivery.types';
import type { PeriodActionResponseView } from './../../tasks/tasks.types';
@Injectable()
export class FeedService {
  constructor(private readonly db: DatabaseService, private readonly phrases: PhrasesService, private readonly tasks: TasksService, private readonly pressure: PressureService, private readonly analytics: AnalyticsService, private readonly notifications: NotificationStateService) { }
  view(feed: FeedMessage): FeedMessageResponseView {
    return {
      ...present<FeedMessageResponseView>(feed, ['id', 'category', 'text', 'periodId', 'taskTitle', 'rating', 'sentAt']),
      rateable: rateableCategories.includes(feed.category),
      ...(feed.checkIn ? { checkIn: present(feed.checkIn, ['answer', 'answeredAt', 'missedAt']) } : {}),
    };
  }

  async get(userId: string, id: string): Promise<FeedMessageResponseView> {
    const feed = await this.db.model('FeedMessage').findOne({
      userId,
      _id: id,
      draft: { $ne: true },
      $or: [{ category: { $ne: 'on_check_in' } }, { telegramMessageId: { $exists: true } }],
    }).lean();
    if (!feed) {
      throw ApiError.notFound();
    }
    return this.view(feed);
  }

  async list(userId: string, input: PageInput & {
    periodId?: string;
    category?: string;
  }): Promise<FeedListResponseView> {
    const cursor = decodeCursor(input.cursor), limit = pageSize(input);
    const rows = await this.db.model('FeedMessage').find({
      userId,
      draft: { $ne: true },
      $or: [{ category: { $ne: 'on_check_in' } }, { telegramMessageId: { $exists: true } }],
      ...(input.periodId ? { periodId: input.periodId } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(cursor ? { _id: { $lt: cursor } } : {}),
    }).sort({ _id: -1 }).limit(limit + 1).lean();
    return {
      items: rows.slice(0, limit).map(row => this.view(row)),
      nextCursor: rows.length > limit ? encodeCursor(rows[limit - 1]._id) : null,
    };
  }

  async answer(user: User, id: string, answer: 'done' | 'partial' | 'not_started'): Promise<PeriodActionResponseView> {
    return this.db.transaction(async (session) => {
      const feed = await this.db.model('FeedMessage').findOne({
        _id: id,
        userId: user._id,
        category: 'on_check_in',
        draft: { $ne: true },
        telegramMessageId: { $exists: true },
      }).session(session).lean();
      if (!feed?.periodId) {
        throw ApiError.notFound();
      }
      const period = await this.db.model('Period').findById(feed.periodId).session(session).lean();
      const task = period ? await this.db.model('Task').findById(period.taskId).session(session).lean() : null;
      if (!period || !task) {
        throw ApiError.notFound();
      }
      if (task.deletedAt || task.status === 'stopped' || period.status !== 'active') {
        throw new DeliveryError(409, 'period_not_active', { periodStatus: task.deletedAt ? 'deleted' : task.status === 'stopped' ? 'stopped' : period.status });
      }
      if (period.deadline <= new Date()) {
        throw new DeliveryError(409, 'period_not_active', { periodStatus: 'failed' });
      }
      if (feed.checkIn?.answer) {
        throw new DeliveryError(409, 'period_not_active');
      }
      const updated = await this.db.model('FeedMessage').updateOne({
        '_id': id,
        'checkIn.answer': { $exists: false },
      }, {
        $set: {
          'checkIn.answer': answer,
          'checkIn.answeredAt': new Date(),
        },
      }, { session });
      if (!updated.modifiedCount) {
        throw new DeliveryError(409, 'period_not_active');
      }
      let result: PeriodActionResponseView;
      if (answer === 'done') {
        result = await this.tasks.action(user, period._id, 'done', 'check_in', session);
      } else {
        // Serialize against closure even when this answer does not change status.
        await this.db.model('Period').updateOne({
          _id: period._id,
          status: 'active',
        }, { $set: { status: 'active' } }, { session });
        const origin = await this.db.model('OutboxMessage').findOne({ feedMessageId: id }).session(session).lean();
        await this.notifications.signal(user._id, session);
        if (!origin?.seriesId && origin?.kind !== 'series_check_in' && !feed.checkIn?.missedAt) {
          await this.pressure.startSeries(period, session, false, feed._id);
        }
        const reply = (await this.phrases.pick(user, 'on_check_in_reply', answer === 'partial' ? 1 : 2, task.title, period.deadline, session)).text || null;
        const currentUser = await this.db.model('User').findById(user._id).session(session).lean();
        result = {
          task: await this.tasks.view(task, session),
          respect: currentUser?.respect ?? user.respect,
          respectDelta: 0,
          reply,
        };
      }
      await this.analytics.event('check_in_answered', user._id, { answer }, session);
      return result;
    });
  }
}
