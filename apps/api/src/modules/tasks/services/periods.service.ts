import { TasksError } from '../tasks.errors';
import { NotificationStateService } from '../../task-notifications/services/notification-state.service';
import type { ClientSession } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './../../../database/database.service';
import type { User } from './../../../database/schemas/user.schema';
import { ApiError } from './../../../common/errors/api-error';
import { localDate } from './../../../common/utils/time';
import { RespectService } from './../../respect/respect.service';
import { PhrasesService } from './../../phrases/phrases.service';
import { AnalyticsService } from './../../analytics/analytics.service';
import { RecurrenceService } from './recurrence.service';
import type { PeriodActionResponseView } from './../tasks.types';
import { TaskReaderService } from './task-reader.service';
@Injectable()
export class PeriodsService {
  constructor(private readonly db: DatabaseService, private readonly respect: RespectService, private readonly phrases: PhrasesService, private readonly analytics: AnalyticsService, private readonly recurrence: RecurrenceService, private readonly reader: TaskReaderService, private readonly notifications: NotificationStateService) { }
  async action(user: User, id: string, action: 'done' | 'extend' | 'surrender' | 'retry' | 'deadline', closedBy: 'done_button' | 'check_in' = 'done_button', existingSession?: ClientSession, extensionDeadline?: string): Promise<PeriodActionResponseView> {
    const transition = async (session: ClientSession): Promise<PeriodActionResponseView> => {
      const period = await this.db.model('Period').findOne({
        _id: id,
        userId: user._id,
      }).session(session).lean();
      if (!period) {
        throw ApiError.notFound();
      }
      const task = await this.db.model('Task').findOne({
        _id: period.taskId,
        userId: user._id,
      }).session(session).lean();
      if (!task) {
        throw ApiError.notFound();
      }
      if (task.deletedAt || task.status === 'stopped') {
        throw new TasksError(409, 'period_not_active', { periodStatus: task.deletedAt ? 'deleted' : 'stopped' });
      }
      if (action !== 'retry' && period.status !== 'active') {
        throw new TasksError(409, 'period_not_active', { periodStatus: period.status });
      }
      const now = new Date();
      if (action === 'deadline' && period.deadline > now) {
        throw new TasksError(409, 'period_not_active', { periodStatus: period.status });
      }
      if (period.status === 'active' && period.deadline <= now && ['done', 'extend', 'surrender'].includes(action)) {
        // The sweeper persists the failure and penalty; rejected actions have no side effects.
        throw new TasksError(409, 'period_not_active', { periodStatus: 'failed' });
      }
      const at = action === 'deadline' ? period.deadline : now;
      const nextStart = task.kind === 'recurring' ? this.recurrence.nextStart(task, user, period.startsAt) : undefined;
      let category: string, delta = 0;
      let phraseLevel: number | undefined;
      if (action === 'retry') {
        if (period.status !== 'failed' || period.retryUsed || (nextStart && (nextStart <= at || nextStart.getTime() < at.getTime() + 3600000))) {
          throw new TasksError(409, 'retry_unavailable');
        }
        period.status = 'active';
        period.retryUsed = true;
        period.deadline = new Date(at.getTime() + 3600000);
        task.status = 'active';
        category = 'on_retry';
      } else if (action === 'extend') {
        const day = localDate(at, user.timeZone);
        const newDeadline = extensionDeadline === undefined ? new Date(period.deadline.getTime() + 3600000) : new Date(extensionDeadline);
        const extraTime = newDeadline.getTime() - period.deadline.getTime();
        if (!Number.isFinite(newDeadline.getTime()) || extraTime <= 0 || newDeadline.getTime() > now.getTime() + 365 * 86400000) {
          throw new TasksError(400, 'deadline_out_of_range', { reply: 'Выбери срок позже текущего, не дальше чем через 365 дней.' });
        }
        if (nextStart && newDeadline > nextStart) {
          throw new TasksError(409, 'extension_denied', { reply: 'Этот период нельзя продлить дальше начала следующего. Выбери более ранний срок.' });
        }
        phraseLevel = extraTime <= 3600000 ? 1 : extraTime <= 86400000 ? 2 : 3;
        period.deadline = newDeadline;
        period.lastExtendedOn = day;
        period.lastExtendedAt = at;
        category = 'on_excuse';
      } else {
        period.status = action === 'done' ? 'done' : 'failed';
        period.closedAt = at;
        period.closedBy = action === 'done' ? closedBy : action === 'deadline' ? 'deadline' : 'give_up';
        delta = action === 'done'
          ? ({
              micro: 1,
              medium: 3,
              large: 5,
            })[task.size]
          : action === 'deadline' ? -2 : -1;
        category = action === 'done' ? 'on_success' : 'on_fail';
        if (task.kind === 'one_time') {
          task.status = 'closed';
        }
      }
      const result = await this.respect.apply(user._id, action === 'done' ? 'done' : action === 'deadline' ? 'fail' : action === 'surrender' ? 'give_up' : 'done', `${id}:${action}:${period.retryUsed}`, delta, session, at);
      if (period.status !== 'active') {
        period.respectDelta = result.applied;
      }
      const reply = await this.phrases.pick(user, category, phraseLevel, task.title, period.deadline, session);
      if (reply.text) {
        const [feed] = await this.db.model('FeedMessage').create([{
          userId: user._id,
          periodId: id,
          taskTitle: task.title,
          category,
          ...reply,
          sentAt: at,
          // Ответ на действие самого человека он уже видел в ответе; непрочитанным остаётся только то, что пришло само (срок вышел).
          ...(action === 'deadline' ? {} : { readAt: at }),
        }], { session });
        if (period.status === 'failed') {
          period.failMessageId = feed._id;
        }
      }
      if (action === 'done') {
        await this.db.model('User').updateOne({ _id: user._id }, {
          $inc: { closedCount: 1 },
          $set: { closedCountAt: at },
        }, { session });
      }
      if (['done', 'deadline', 'surrender'].includes(action)) {
        await this.analytics.event(action === 'done' ? 'period_done' : 'period_failed', user._id, {}, session);
      }
      if (action === 'retry') {
        delete period.closedAt;
        delete period.closedBy;
        delete period.respectDelta;
        delete period.failMessageId;
      }
      await this.db.model('Period').updateOne({ _id: id }, {
        $set: period,
        ...(action === 'retry'
          ? {
              $unset: {
                closedAt: 1,
                closedBy: 1,
                respectDelta: 1,
                failMessageId: 1,
              },
            }
          : {}),
      }, { session });
      await this.db.model('Task').updateOne({ _id: task._id }, { $set: { status: task.status } }, { session });
      await this.db.model('OutboxMessage').updateMany({
        periodId: id,
        status: { $in: ['planned', 'leased'] },
      }, { $set: { status: 'cancelled' } }, { session });
      await this.notifications.signal(user._id, session);
      return {
        task: await this.reader.view(task, session),
        respect: result.respect,
        respectDelta: result.applied,
        reply: reply.text || null,
      };
    };
    return existingSession ? transition(existingSession) : this.db.transaction(transition);
  }
}
