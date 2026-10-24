import { DeliveryError } from '../delivery.errors';
import { Injectable } from '@nestjs/common';
import { FeedStatusService } from './feed-status.service';
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
  constructor(private readonly db: DatabaseService, private readonly phrases: PhrasesService, private readonly tasks: TasksService, private readonly pressure: PressureService, private readonly analytics: AnalyticsService, private readonly notifications: NotificationStateService, private readonly status: FeedStatusService) { }
  view(feed: FeedMessage): FeedMessageResponseView {
    return {
      ...present<FeedMessageResponseView>(feed, ['id', 'category', 'text', 'periodId', 'taskTitle', 'rating', 'sentAt', 'readAt']),
      rateable: rateableCategories.includes(feed.category),
      ...(feed.category === 'on_check_in' || feed.checkIn ? { checkIn: present(feed.checkIn ?? {}, ['answer', 'answeredAt', 'missedAt', 'resolvedAt', 'respectDelta']) } : {}),
    };
  }

  private async withPenalties(userId: string, rows: FeedMessage[]): Promise<FeedMessage[]> {
    // Existing notifications predate the stored delta; recover their own penalty from the ledger.
    const legacy = rows.filter(row => row.checkIn?.missedAt && row.checkIn.respectDelta === undefined);
    if (!legacy.length) {
      return rows;
    }
    const penalties = await this.db.model('RespectChange').find({
      userId,
      reason: 'missed_check_in',
      eventKey: { $in: legacy.map(row => `${row._id}:missed`) },
    }).lean();
    const byKey = new Map(penalties.map(row => [row.eventKey, row.applied]));
    return rows.map(row => row.checkIn?.missedAt && row.checkIn.respectDelta === undefined
      ? {
          ...row,
          checkIn: {
            ...row.checkIn,
            respectDelta: byKey.get(`${row._id}:missed`) ?? 0,
          },
        }
      : row);
  }

  private async responses(userId: string, rows: FeedMessage[]): Promise<FeedMessageResponseView[]> {
    const periodIds = [...new Set(rows.flatMap(row => row.periodId ? [row.periodId] : []))];
    const periods = await this.db.model('Period').find({
      userId,
      _id: { $in: periodIds },
    }).lean();
    const pendingRows = await this.db.model('FeedMessage').find({
      userId,
      'periodId': { $in: periodIds },
      'category': 'on_check_in',
      'draft': { $ne: true },
      'telegramMessageId': { $exists: true },
      'checkIn.answer': { $exists: false },
      'checkIn.resolvedAt': { $exists: false },
    }).lean();
    const pending = await this.withPenalties(userId, pendingRows);
    const active = await this.status.activePeriods(userId, pending);
    const groups = new Map<string, { firstAt: number;
      topId: string;
      delta: number;
      expired: boolean; }>();
    for (const row of pending) {
      const group = groups.get(row.periodId!);
      const firstAt = Math.min(group?.firstAt ?? Infinity, row.sentAt.getTime());
      groups.set(row.periodId!, {
        firstAt,
        topId: group && group.topId > row._id ? group.topId : row._id,
        delta: (group?.delta ?? 0) + (row.checkIn?.respectDelta ?? 0),
        expired: !!group?.expired || !!row.checkIn?.missedAt || firstAt + 15 * 60000 <= Date.now(),
      });
    }
    const hydrated = await this.withPenalties(userId, rows);
    return hydrated.map((row) => {
      const period = periods.find(item => item._id === row.periodId);
      const outcome = period?.status === 'done' ? 'done' : period?.closedBy === 'give_up' ? 'give_up' : period?.status === 'failed' ? 'failed' : undefined;
      const group = row.periodId ? groups.get(row.periodId) : undefined;
      const open = !row.checkIn?.answer && !row.checkIn?.resolvedAt;
      const view = this.view(row);
      return {
        ...view,
        ...(outcome ? { taskOutcome: outcome } : {}),
        needsAnswer: this.status.needsAnswer(row, active),
        ...(view.checkIn
          ? {
              checkIn: {
                ...view.checkIn,
                expired: !outcome && open && !!group?.expired,
                ...(group && open ? { answerDueAt: new Date(group.firstAt + 15 * 60000).toISOString() } : {}),
                ...(group && open && row._id === group.topId && group.delta < 0 ? { groupRespectDelta: group.delta } : {}),
              },
            }
          : {}),
      };
    });
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
    return (await this.responses(userId, [feed]))[0];
  }

  async markRead(userId: string, id: string): Promise<FeedMessageResponseView> {
    await this.get(userId, id);
    await this.db.model('FeedMessage').updateOne({
      _id: id,
      userId,
      readAt: { $exists: false },
    }, { $set: { readAt: new Date() } });
    return this.get(userId, id);
  }

  async list(userId: string, input: PageInput & {
    periodId?: string;
    category?: string;
  }): Promise<FeedListResponseView> {
    const cursor = decodeCursor(input.cursor), limit = pageSize(input);
    const candidates = await this.db.model('FeedMessage').find({
      userId,
      'category': 'on_check_in',
      'draft': { $ne: true },
      'telegramMessageId': { $exists: true },
      'checkIn.answer': { $exists: false },
      'checkIn.resolvedAt': { $exists: false },
    }).lean();
    const periods = await this.status.activePeriods(userId, candidates);
    const pendingIds = candidates.filter(row => this.status.needsAnswer(row, periods)).map(row => row._id);
    const firstByPeriod = new Map<string, number>();
    for (const row of candidates.filter(row => this.status.needsAnswer(row, periods))) {
      firstByPeriod.set(row.periodId!, Math.min(firstByPeriod.get(row.periodId!) ?? Infinity, row.sentAt.getTime()));
    }
    const parts = cursor?.split(':') ?? [];
    const cursorPriority = parts.length > 1 ? Number(parts[0]) : 1;
    const cursorDue = parts.length === 3 ? Number(parts[1]) : 0;
    const cursorId = parts.length === 3 ? parts[2] : parts.length === 2 ? parts[1] : cursor;
    const dueBranches = [...firstByPeriod].map(([periodId, at]) => ({
      case: { $eq: ['$periodId', periodId] },
      then: at + 15 * 60000,
    }));
    const rows = await this.db.model('FeedMessage').aggregate<FeedMessage>([
      {
        $match: {
          userId,
          draft: { $ne: true },
          $or: [{ category: { $ne: 'on_check_in' } }, { telegramMessageId: { $exists: true } }],
          ...(input.periodId ? { periodId: input.periodId } : {}),
          ...(input.category ? { category: input.category } : {}),
        },
      },
      {
        $addFields: {
          answerPriority: { $cond: [{ $in: ['$_id', pendingIds] }, 0, 1] },
          answerDue: {
            $cond: [{ $in: ['$_id', pendingIds] }, dueBranches.length
              ? {
                  $switch: {
                    branches: dueBranches,
                    default: 0,
                  },
                }
              : 0, 0],
          },
        },
      },
      ...(cursorId
        ? [{
            $match: {
              $or: [
                { answerPriority: { $gt: cursorPriority } },
                {
                  answerPriority: cursorPriority,
                  answerDue: { $gt: cursorDue },
                },
                {
                  answerPriority: cursorPriority,
                  answerDue: cursorDue,
                  _id: { $lt: cursorId },
                },
              ],
            },
          }]
        : []),
      {
        $sort: {
          answerPriority: 1,
          answerDue: 1,
          _id: -1,
        },
      },
      { $limit: limit + 1 },
    ]);
    return {
      ...await this.status.counts(userId),
      items: await this.responses(userId, rows.slice(0, limit)),
      nextCursor: rows.length > limit ? encodeCursor(`${this.status.needsAnswer(rows[limit - 1], periods) ? 0 : 1}:${this.status.needsAnswer(rows[limit - 1], periods) ? firstByPeriod.get(rows[limit - 1].periodId!)! + 15 * 60000 : 0}:${rows[limit - 1]._id}`) : null,
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
      if (feed.checkIn?.answer || feed.checkIn?.resolvedAt) {
        throw new DeliveryError(409, 'period_not_active');
      }
      const updated = await this.db.model('FeedMessage').updateOne({
        '_id': id,
        'checkIn.answer': { $exists: false },
        'checkIn.resolvedAt': { $exists: false },
      }, {
        $set: {
          'checkIn.answer': answer,
          'checkIn.answeredAt': new Date(),
          'readAt': new Date(),
        },
      }, { session });
      if (!updated.modifiedCount) {
        throw new DeliveryError(409, 'period_not_active');
      }
      // Only checks already delivered for this period are covered by this answer.
      // Future checks still require their own reply; no synthetic answer or score is created.
      await this.db.model('FeedMessage').updateMany({
        'userId': user._id,
        'periodId': period._id,
        'category': 'on_check_in',
        '_id': { $ne: id },
        'draft': { $ne: true },
        'telegramMessageId': { $exists: true },
        'checkIn.answer': { $exists: false },
        'checkIn.resolvedAt': { $exists: false },
      }, {
        $set: {
          'checkIn.resolvedAt': new Date(),
          'readAt': new Date(),
        },
      }, { session });
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
