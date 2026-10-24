import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { User } from '../../database/schemas/user.schema';
import { present } from '../../common/utils/presentation';
import type { LeaderboardResponseView, LeaderboardParticipationResponseView } from './leaderboard.types';
@Injectable()
export class LeaderboardService {
  constructor(private readonly db: DatabaseService) { }
  async get(user: User): Promise<LeaderboardResponseView> {
    const rows = await this.db.model('User').find({
      inLeaderboard: true,
      closedCount: { $gt: 0 },
      deleting: { $ne: true },
      onboarding: 'done',
    }).sort({
      closedCount: -1,
      closedCountAt: 1,
      _id: 1,
    }).limit(100).lean();
    const rank = user.inLeaderboard && user.closedCount > 0
      ? 1 + await this.db.model('User').countDocuments({
        inLeaderboard: true,
        deleting: { $ne: true },
        onboarding: 'done',
        $or: [{ closedCount: { $gt: user.closedCount } }, {
          closedCount: user.closedCount,
          closedCountAt: { $lt: user.closedCountAt },
        }, {
          closedCount: user.closedCount,
          closedCountAt: user.closedCountAt,
          _id: { $lt: user._id },
        }],
      })
      : null;
    return {
      items: rows.map((row, index) => ({
        ...present<LeaderboardResponseView['items'][number]>(row, ['username', 'firstName', 'closedCount']),
        rank: index + 1,
      })),
      me: {
        rank,
        closedCount: user.closedCount,
        inLeaderboard: user.inLeaderboard,
      },
    };
  }

  async participate(userId: string, inLeaderboard: boolean): Promise<LeaderboardParticipationResponseView> {
    await this.db.model('User').updateOne({
      _id: userId,
      deleting: { $ne: true },
    }, { $set: { inLeaderboard } });
    return { inLeaderboard };
  }
}
