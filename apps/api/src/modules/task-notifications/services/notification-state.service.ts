import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../../database/database.service';
import { isDuplicateKey } from '../../../common/utils/mongo-error';

@Injectable()
export class NotificationStateService {
  constructor(private readonly db: DatabaseService) { }

  async signal(userId: string, session?: ClientSession): Promise<void> {
    await this.db.model('TaskNotificationState').updateOne({ _id: userId }, {
      $setOnInsert: { userId },
      $inc: { revision: 1 },
      $set: { dirty: true },
      $unset: {
        pendingOutboxId: 1,
        owner: 1,
        leaseUntil: 1,
      },
    }, {
      upsert: true,
      session,
    });
    // Retain the send token for recording an already in-flight successful request.
    await this.db.model('OutboxMessage').updateMany({
      userId,
      status: { $in: ['planned', 'leased'] },
    }, { $set: { status: 'cancelled' } }, { session });
  }

  async ensure(userId: string): Promise<void> {
    if (await this.db.model('TaskNotificationState').exists({ _id: userId })) {
      return;
    }
    try {
      await this.db.transaction(async (session) => {
        // Touch the user in the bootstrap transaction to serialize account removal.
        // This does not change activity or any persisted scheduling date.
        const user = await this.db.model('User').updateOne({
          _id: userId,
          onboarding: 'done',
          deleting: { $ne: true },
        }, { $set: { onboarding: 'done' } }, { session });
        if (!user.matchedCount) {
          return;
        }
        await this.db.model('TaskNotificationState').updateOne({ _id: userId }, {
          $setOnInsert: {
            userId,
            revision: 1,
            dirty: true,
          },
        }, {
          upsert: true,
          session,
        });
      });
    } catch (error) {
      if (!isDuplicateKey(error)) {
        throw error;
      }
    }
  }
}
