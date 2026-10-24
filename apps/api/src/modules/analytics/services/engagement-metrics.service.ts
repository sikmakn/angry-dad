import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
@Injectable()
export class EngagementMetricsService {
  constructor(private readonly db: DatabaseService) { }

  async calculate(start: Date, end: Date): Promise<{
    active: string[];
    retention: number | null;
    median: number | null;
    checkInAnswerRate: number | null;
  }> {
    const firstDay = new Date(start);
    firstDay.setUTCHours(0, 0, 0, 0);
    const active = await this.db.model('UserActivityDay').distinct('userId', {
      day: {
        $gte: firstDay,
        $lte: end,
      },
      // Activity is a UTC-day fact, not an event log. Count selected days in
      // full; their first/last timestamps cannot reconstruct interior visits.
    });
    const cohort = await this.db.model('UserStatistics').find({
      firstStartedAt: {
        $gte: start,
        $lte: end,
      },
    }).lean();
    const cutoff = Math.min(end.getTime(), Date.now());
    const mature = new Map<string, number>();
    const durations: number[] = [];
    for (const row of cohort) {
      const first = row.firstStartedAt!;
      const day7 = new Date(first);
      day7.setUTCHours(0, 0, 0, 0);
      day7.setUTCDate(day7.getUTCDate() + 7);
      if (day7.getTime() + 86400000 <= cutoff) {
        mature.set(row.userId, day7.getTime());
      }
      if (row.firstTaskCreatedAt && row.firstTaskCreatedAt <= end) {
        const seconds = (row.firstTaskCreatedAt.getTime() - first.getTime()) / 1000;
        if (seconds >= 0) {
          durations.push(seconds);
        }
      }
    }
    const returnDays = mature.size
      ? await this.db.model('UserActivityDay').find({
          userId: { $in: [...mature.keys()] },
          day: { $in: [...new Set([...mature.values()])].map(value => new Date(value)) },
        }).select('userId day').lean()
      : [];
    const returned = returnDays.filter(row => mature.get(row.userId) === row.day.getTime()).length;
    durations.sort((a, b) => a - b);
    const middle = Math.floor(durations.length / 2);
    const median = durations.length ? durations.length % 2 ? durations[middle] : (durations[middle - 1] + durations[middle]) / 2 : null;
    const messages = await this.db.model('FeedMessage').find({
      category: 'on_check_in',
      draft: { $ne: true },
      telegramMessageId: { $type: 'number' },
      sentAt: {
        $gte: start,
        $lte: end,
      },
    }).select('checkIn sentAt').lean();
    const answered = messages.filter(row => row.checkIn?.answer && ['done', 'partial', 'not_started'].includes(row.checkIn.answer) && row.checkIn.answeredAt && row.checkIn.answeredAt >= row.sentAt && row.checkIn.answeredAt <= end).length;
    return {
      active,
      retention: mature.size ? returned / mature.size : null,
      median,
      checkInAnswerRate: messages.length ? answered / messages.length : null,
    };
  }
}
