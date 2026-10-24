import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import type { User } from '../../../database/schemas/user.schema';
import { UsersService } from '../users.service';
@Injectable()
export class AccountDeletionService {
  constructor(private readonly db: DatabaseService, private readonly users: UsersService) { }
  async delete(user: User): Promise<void> {
    await this.db.model('User').updateOne({ _id: user._id }, {
      $set: {
        deleting: true,
        inLeaderboard: false,
      },
    });
    await this.db.transaction(async (session) => {
      await this.db.model('DeletedUser').updateOne({ telegramIdHash: this.users.hash(user.telegramId) }, { $set: { deletedAt: new Date() } }, {
        upsert: true,
        session,
      });
      const names = ['UserStatistics', 'UserActivityDay', 'TaskNotificationState', 'Task', 'Period', 'FeedMessage', 'OutboxMessage', 'RespectChange', 'PhraseVote', 'PhraseShowState', 'BattleMessage', 'BattleDialog', 'Turn', 'DailyCounter'] as const;
      for (const name of names) {
        await this.db.model(name).deleteMany({ userId: user._id }, { session });
      }
      await this.db.model('StrikeLot').updateMany({ userId: user._id }, { $set: { remaining: 0 } }, { session });
      await this.db.model('AnalyticsEvent').updateMany({ userId: user._id }, { $unset: { userId: 1 } }, { session });
      await this.db.model('AiCall').updateMany({ userId: user._id }, { $unset: { userId: 1 } }, { session });
      await this.db.model('User').deleteOne({ _id: user._id }, { session });
    });
  }
}
