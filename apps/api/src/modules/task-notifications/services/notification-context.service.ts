import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../../database/database.service';
import type { User } from '../../../database/schemas/user.schema';
import type { Task } from '../../../database/schemas/task.schema';
import type { Period } from '../../../database/schemas/period.schema';
import type { OutboxMessage } from '../../../database/schemas/outbox-message.schema';
import type { TaskNotificationState } from '../../../database/schemas/task-notification-state.schema';
import { notificationPolicy as p } from '../task-notifications.policy';

export interface NotificationCandidate { task: Task;
  period: Period;
  score: number;
  lastPrimaryAt: number;
  kind: OutboxMessage['kind'];
  negative: boolean;
  extended: boolean;
  reason: string;
  reasonAt?: Date;
  sourceFeedId?: string; }
export interface NotificationContext { user: User;
  candidates: NotificationCandidate[];
  history: OutboxMessage[];
  defeat: number; }

@Injectable()
export class NotificationContextService {
  constructor(private readonly db: DatabaseService) { }

  async load(userId: string, state: TaskNotificationState, session?: ClientSession): Promise<NotificationContext | null> {
    const user = await this.db.model('User').findById(userId).session(session ?? null).lean();
    if (!user || user.deleting || user.botBlocked || user.onboarding !== 'done' || !user.role) {
      return null;
    }
    const tasks = await this.db.model('Task').find({
      userId,
      status: { $in: ['active', 'closed'] },
      deletedAt: { $exists: false },
    }).session(session ?? null).lean();
    const periods = await this.db.model('Period').find({
      _id: { $in: tasks.flatMap(t => t.currentPeriodId ? [t.currentPeriodId] : []) },
      userId,
    }).session(session ?? null).lean();
    // Never truncate the sliding-hour attempts behind older confirmed sends.
    // Confirmed failures need only their reason window; rotation is read separately.
    const history = await this.db.model('OutboxMessage').find({
      userId,
      planRevision: { $exists: true },
      $or: [{ sentAt: { $gte: new Date(Date.now() - Math.max(p.failWindow, p.hour)) } }, {
        sentAt: { $exists: false },
        sendStartedAt: { $gte: new Date(Date.now() - p.hour) },
      }],
    }).session(session ?? null).lean();
    history.sort((a, b) => (b.sentAt ?? b.sendStartedAt)!.getTime() - (a.sentAt ?? a.sendStartedAt)!.getTime());
    // One latest primary mention per active candidate, across the entire history.
    // Secondary mentions must not reset the opportunity for a primary check-in.
    const mentions = await this.db.model('OutboxMessage').aggregate<{ _id: string;
      sentAt: Date; }>([
      {
        $match: {
          userId,
          primaryTaskId: { $in: tasks.map(task => task._id) },
          sentAt: { $exists: true },
        },
      },
      {
        $group: {
          _id: '$primaryTaskId',
          sentAt: { $max: '$sentAt' },
        },
      },
    ]).session(session ?? null);
    const lastPrimary = new Map(mentions.map(row => [row._id, row.sentAt.getTime()]));
    const answers = await this.db.model('FeedMessage').find({
      'userId': userId,
      'category': 'on_check_in',
      'draft': { $ne: true },
      'telegramMessageId': { $exists: true },
      'checkIn.answer': { $exists: true },
      'periodId': { $in: periods.map(row => row._id) },
    }).sort({ 'checkIn.answeredAt': -1 }).session(session ?? null).lean();
    const dialog = await this.db.model('BattleDialog').findOne({
      userId,
      role: user.role,
    }).session(session ?? null).lean();
    const defeat = dialog ? Math.max(0, dialog.defeat - (Date.now() - dialog.defeatAt.getTime()) / p.day * p.defeatDecayPerDay) : 0;
    const candidates: NotificationCandidate[] = [];
    for (const task of tasks) {
      const period = periods.find(row => row._id === task.currentPeriodId && row.taskId === task._id);
      if (!period) {
        continue;
      }
      const failed = period.status === 'failed' && period.closedBy === 'deadline' && period.closedAt && Date.now() - period.closedAt.getTime() <= p.failWindow;
      if (period.status !== 'active' && !failed) {
        continue;
      }
      if (period.status === 'active' && (task.status !== 'active' || period.deadline <= new Date())) {
        continue;
      }
      if (failed && history.some(row => row.sentAt && row.periodId === period._id && row.reason === 'fail' && row.reasonAt?.getTime() === period.closedAt?.getTime())) {
        continue;
      }
      const last = answers.find(row => row.periodId === period._id);
      const negative = Boolean(last && last.checkIn?.answer !== 'done' && Date.now() - last.checkIn!.answeredAt!.getTime() < p.negativeWindow);
      const lastPrimaryAt = lastPrimary.get(task._id) ?? task.createdAt.getTime();
      const age = Math.max(0, Date.now() - lastPrimaryAt);
      const urgent = (period.anchorAt ?? period.deadline).getTime() - Date.now() < p.urgent;
      const extended = Boolean(period.lastExtendedAt && Date.now() - period.lastExtendedAt.getTime() < p.extensionWindow);
      // Each full rotation window outweighs the combined reason bonuses, so
      // repeatedly urgent tasks cannot starve candidates indefinitely.
      const rotation = Math.floor(age / p.rotationWindow) * (p.score.urgent + p.score.negative + p.score.extended + p.score.failed + 1);
      const score = rotation + Math.min(p.score.ageCap, age / p.hour * p.score.ageHour) + (urgent ? p.score.urgent : 0) + (negative ? p.score.negative : 0) + (extended ? p.score.extended : 0) + (failed ? p.score.failed : 0);
      const kind = failed ? 'fail' : state.series && state.series.remaining > 0 && state.series.endsAt > new Date() ? 'series_check_in' : urgent ? 'reminder' : Date.now() - user.lastActivityAt.getTime() >= p.absence ? 'absent' : 'check_in';
      const reason = kind === 'series_check_in' ? state.series?.penalized ? 'missed_check_in' : 'negative_answer' : kind !== 'check_in' ? kind : negative ? last!.checkIn!.answer! : extended ? 'extension' : 'active_task';
      const reasonAt = failed ? period.closedAt : negative ? last?.checkIn?.answeredAt : extended ? period.lastExtendedAt : undefined;
      const sourceFeedId = kind === 'series_check_in' ? state.series?.originFeedId : negative ? last?._id : undefined;
      candidates.push({
        task,
        period,
        negative,
        extended,
        score,
        lastPrimaryAt,
        kind,
        reason,
        reasonAt,
        sourceFeedId,
      });
    }
    candidates.sort((a, b) => b.score - a.score || a.lastPrimaryAt - b.lastPrimaryAt || a.task._id.localeCompare(b.task._id));
    return {
      user,
      candidates,
      history,
      defeat,
    };
  }
}
