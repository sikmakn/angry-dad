import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import type { FeedMessage } from '../../../database/schemas/feed-message.schema';
import { rateableCategories } from '../../phrases/phrases.service';

@Injectable()
export class FeedStatusService {
  constructor(private readonly db: DatabaseService) { }

  async activePeriods(userId: string, messages: FeedMessage[]): Promise<Set<string>> {
    const ids = messages.filter(row => row.category === 'on_check_in' && !row.checkIn?.answer && !row.checkIn?.resolvedAt).flatMap(row => row.periodId ? [row.periodId] : []);
    if (!ids.length) {
      return new Set();
    }
    const tasks = await this.db.model('Task').find({
      userId,
      status: 'active',
      deletedAt: { $exists: false },
      currentPeriodId: { $in: ids },
    }).select('currentPeriodId').lean();
    const periods = await this.db.model('Period').find({
      userId,
      _id: { $in: tasks.map(row => row.currentPeriodId) },
      status: 'active',
      deadline: { $gt: new Date() },
    }).select('_id').lean();
    return new Set(periods.map(row => row._id));
  }

  needsAnswer(message: FeedMessage, periods: Set<string>): boolean {
    return message.category === 'on_check_in' && !message.checkIn?.answer && !message.checkIn?.resolvedAt && !!message.periodId && periods.has(message.periodId);
  }

  async counts(userId: string) {
    const checks = await this.db.model('FeedMessage').find({
      userId,
      'category': 'on_check_in',
      'draft': { $ne: true },
      'telegramMessageId': { $exists: true },
      'checkIn.answer': { $exists: false },
      'checkIn.resolvedAt': { $exists: false },
    }).lean();
    const periods = await this.activePeriods(userId, checks);
    const pending = checks.filter(row => this.needsAnswer(row, periods));
    const unreadOtherCount = await this.db.model('FeedMessage').countDocuments({
      userId,
      category: { $in: rateableCategories.filter(category => category !== 'on_check_in') },
      draft: { $ne: true },
      readAt: { $exists: false },
    });
    // An archived or already answered check is history, not an active notification.
    const unreadCount = unreadOtherCount + pending.filter(row => !row.readAt).length;
    const firstByPeriod = new Map<string, number>();
    for (const row of pending) {
      firstByPeriod.set(row.periodId!, Math.min(firstByPeriod.get(row.periodId!) ?? Infinity, row.sentAt.getTime()));
    }
    const earliest = Math.min(...firstByPeriod.values());
    return {
      ...(Number.isFinite(earliest) ? { nextAnswerDueAt: new Date(earliest + 15 * 60000).toISOString() } : {}),
      unreadCount,
      unansweredCount: pending.length,
      activeCount: unreadCount + pending.filter(row => !!row.readAt).length,
    };
  }
}
