import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../../database/database.service';
@Injectable()
export class UserStatisticsService {
  constructor(private readonly db: DatabaseService) { }

  async activity(userId: string, starts: boolean, session?: ClientSession, at = new Date()): Promise<boolean> {
    if (!session) {
      return this.db.transaction(s => this.activity(userId, starts, s, at));
    }
    // A real write on User serializes instrumentation with the deletion fence.
    const user = await this.db.model('User').updateOne({
      _id: userId,
      deleting: { $ne: true },
    }, {
      $inc: { activityRevision: 1 },
    }, { session });
    if (!user.matchedCount) {
      return false;
    }
    if (starts) {
      await this.db.model('UserStatistics').updateOne({ userId }, { $min: { firstStartedAt: at } }, {
        upsert: true,
        session,
      });
    }
    const day = new Date(at);
    day.setUTCHours(0, 0, 0, 0);
    await this.db.model('UserActivityDay').updateOne({
      userId,
      day,
    }, {
      $min: { firstActivityAt: at },
      $max: { lastActivityAt: at },
    }, {
      upsert: true,
      session,
    });
    return true;
  }

  async firstTask(userId: string, at: Date, session?: ClientSession): Promise<boolean> {
    if (!session) {
      return this.db.transaction(s => this.firstTask(userId, at, s));
    }
    if (!await this.activity(userId, true, session, at)) {
      return false;
    }
    await this.db.model('UserStatistics').updateOne({ userId }, { $min: { firstTaskCreatedAt: at } }, {
      upsert: true,
      session,
    });
    return true;
  }
}
