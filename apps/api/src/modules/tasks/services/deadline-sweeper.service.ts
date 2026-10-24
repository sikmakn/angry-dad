import { Injectable } from '@nestjs/common';
import { NotificationStateService } from '../../task-notifications/services/notification-state.service';
import { DatabaseService } from './../../../database/database.service';
import { ApiError } from './../../../common/errors/api-error';
import { RecurrenceService } from './recurrence.service';
import { PeriodsService } from './periods.service';
@Injectable()
export class DeadlineSweeperService {
  private periodCursor?: string;
  constructor(private readonly db: DatabaseService, private readonly recurrence: RecurrenceService, private readonly periods: PeriodsService, private readonly notifications: NotificationStateService) { }
  async sweep(): Promise<void> {
    const overdue = await this.db.model('Period').find({
      status: 'active',
      deadline: { $lte: new Date() },
      ...(this.periodCursor === undefined ? {} : { _id: { $gt: this.periodCursor } }),
    }).sort({ _id: 1 }).limit(200).lean();
    if (!overdue.length) {
      this.periodCursor = undefined;
    }
    for (const period of overdue) {
      // Advance even when an orphaned or inactive task makes this period ineligible.
      this.periodCursor = period._id;
      const user = await this.db.model('User').findById(period.userId).lean();
      const task = await this.db.model('Task').findById(period.taskId).lean();
      if (!user || user.deleting || !task || task.deletedAt || task.status !== 'active') {
        continue;
      }
      try {
        await this.periods.action(user, period._id, 'deadline');
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 409)) {
          throw error;
        }
      }
    }
    const recurring = await this.db.model('Task').find({
      kind: 'recurring',
      status: 'active',
      deletedAt: { $exists: false },
    }).lean();
    for (const task of recurring) {
      const user = await this.db.model('User').findById(task.userId).lean();
      if (!user || user.deleting) {
        continue;
      }
      await this.db.transaction(async (session) => {
        const last = task.currentPeriodId ? await this.db.model('Period').findById(task.currentPeriodId).session(session).lean() : null;
        if (last?.status === 'active') {
          return;
        }
        const from = last ? this.recurrence.nextStart(task, user, last.startsAt) : new Date();
        const window = this.recurrence.window(task, user, from, !last);
        if (window.startsAt > new Date()) {
          return;
        }
        const [period] = await this.db.model('Period').create([{
          ...window,
          userId: user._id,
          taskId: task._id,
          status: 'active',
          retryUsed: false,
        }], { session });
        await this.db.model('Task').updateOne({ _id: task._id }, { $set: { currentPeriodId: period._id } }, { session });
        await this.notifications.signal(user._id, session);
      });
    }
  }
}
