import { Injectable } from '@nestjs/common';
import { EngagementMetricsService } from './services/engagement-metrics.service';
import { TurnEconomicsService } from './services/turn-economics.service';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../database/database.service';
import { ApiError } from '../../common/errors/api-error';
import { present, pageSize } from '../../common/utils/presentation';
import type { PageInput } from '../../common/utils/presentation';
import { decodeCursor, encodeCursor } from '../../common/utils/pagination';
import type { GameSettings } from '../../database/schemas/game-settings.schema';
import type { GameSettingsRequestView, GameSettingsResponseView, MetricsResponseView, OwnerActionTypeView, OwnerJournalContext, OwnerJournalListResponseView } from './analytics.types';
@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService, private readonly engagement: EngagementMetricsService, private readonly economics: TurnEconomicsService) { }
  async settings(): Promise<GameSettings> {
    return (await this.db.model('GameSettings').findOneAndUpdate({ _id: 'game' }, {
      $setOnInsert: {
        battleCoefficients: {
          base: 1,
          damage: 1.4,
          weakSpot: 3,
          crit: 1.5,
        },
        aiDailyLimit: 50,
        otherNames: [],
        banditParams: {
          trialShows: 50,
          disableAvg: 0.4,
          disableVotes: 100,
        },
      },
    }, {
      upsert: true,
      new: true,
    }).lean())!;
  }

  async getSettings(): Promise<GameSettingsResponseView> {
    return present(await this.settings(), ['battleCoefficients', 'aiDailyLimit', 'otherNames', 'banditParams']);
  }

  async replaceSettings(input: GameSettingsRequestView): Promise<GameSettingsResponseView> {
    return this.db.transaction(async (session) => {
      await this.db.model('GameSettings').updateOne({ _id: 'game' }, { $set: input }, {
        upsert: true,
        session,
      });
      await this.journal('settings_edit', undefined, 'game', {}, session);
      return input;
    });
  }

  async event(type: string, userId?: string, props?: Record<string, number | boolean | string>, session?: ClientSession, at = new Date()): Promise<void> {
    await this.db.model('AnalyticsEvent').create([{
      type,
      userId,
      props,
      at,
    }], { session });
  }

  async journal(action: OwnerActionTypeView, targetUserId?: string, targetId?: string, details?: Record<string, unknown>, session?: ClientSession, context: OwnerJournalContext = {}): Promise<void> {
    const user = targetUserId && context.targetTelegramId === undefined ? await this.db.model('User').findById(targetUserId).session(session ?? null).lean() : null;
    await this.db.model('OwnerAction').create([{
      action,
      targetUserId,
      targetTelegramId: context.targetTelegramId ?? user?.telegramId,
      targetId,
      details,
      at: context.at ?? new Date(),
    }], { session });
  }

  async listJournal(query: PageInput & {
    action?: OwnerActionTypeView;
    from?: string;
    to?: string;
  }): Promise<OwnerJournalListResponseView> {
    const cursor = decodeCursor(query.cursor), limit = pageSize(query);
    const rows = await this.db.model('OwnerAction').find({
      ...(cursor ? { _id: { $lt: cursor } } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.from || query.to
        ? {
            at: {
              ...(query.from ? { $gte: new Date(query.from) } : {}),
              ...(query.to ? { $lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    }).sort({ _id: -1 }).limit(limit + 1).lean();
    return {
      items: rows.slice(0, limit).map(row => present(row, ['action', 'targetTelegramId', 'targetId', 'details', 'at'])),
      nextCursor: rows.length > limit ? encodeCursor(rows[limit - 1]._id) : null,
    };
  }

  async metrics(from: string, to: string): Promise<MetricsResponseView> {
    const start = new Date(from), end = new Date(to);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) {
      throw ApiError.invalidRequest();
    }
    const counts = await this.db.model('AnalyticsEvent').aggregate<{
      _id: string;
      count: number;
    }>([{
      $match: {
        at: {
          $gte: start,
          $lte: end,
        },
      },
    }, {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
      },
    }]);
    const c = Object.fromEntries(counts.map(v => [v._id, v.count]));
    const ratio = (a: number, b: number): number | null => b ? a / b : null;
    const scoreRows = await this.db.model('PhraseVote').aggregate<{
      _id: null;
      avg: number;
    }>([{
      $match: {
        at: {
          $gte: start,
          $lte: end,
        },
      },
    }, {
      $group: {
        _id: null,
        avg: { $avg: '$score' },
      },
    }]);
    const engagement = await this.engagement.calculate(start, end);
    const active = engagement.active;
    const blocked = await this.db.model('AnalyticsEvent').distinct('userId', {
      type: 'bot_blocked',
      at: {
        $gte: start,
        $lte: end,
      },
      userId: { $in: active },
    });
    const cohort = await this.db.model('AnalyticsEvent').distinct('userId', {
      type: 'onboarding_done',
      at: {
        $gte: start,
        $lte: end,
      },
      userId: { $exists: true },
    });
    const firstBuyers = await this.db.model('StarsPayment').aggregate<{
      _id: string;
      firstAt: Date;
    }>([{ $match: { status: { $in: ['credited', 'refunded'] } } }, {
      $group: {
        _id: '$userId',
        firstAt: { $min: '$paidAt' },
      },
    }, {
      $match: {
        _id: { $in: cohort },
        firstAt: {
          $gte: start,
          $lte: end,
        },
      },
    }]);
    return {
      from: start.toISOString(),
      to: end.toISOString(),
      closedShare: ratio(c.period_done ?? 0, (c.period_done ?? 0) + (c.period_failed ?? 0)),
      checkInAnswerRate: engagement.checkInAnswerRate,
      day7Retention: engagement.retention,
      firstPurchaseConversion: ratio(firstBuyers.length, cohort.length),
      turnCostToStrikeRevenue: await this.economics.ratio(start, end),
      botBlockedShare: ratio(blocked.length, active.length),
      avgPhraseScore: scoreRows[0]?.avg ?? null,
      sharesPer100Active: active.length ? (c.share ?? 0) * 100 / active.length : null,
      // The public contract exposes integer seconds; round only after finding
      // the usual median, preserving sub-second precision in the stored dates.
      medianStartToFirstTaskSeconds: engagement.median === null ? null : Math.round(engagement.median),
    };
  }
}
