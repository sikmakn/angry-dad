import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../../database/database.service';
import { isDuplicateKey } from '../../../common/utils/mongo-error';
import { BotError } from '../bot.errors';

const LEASE_MS = 60000;
const HEARTBEAT_MS = 15000;
const RETENTION_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class TelegramUpdateReceiver {
  constructor(private readonly db: DatabaseService) { }

  async receive(botId: number, updateId: number, handle: () => Promise<void>): Promise<void> {
    const receipts = this.db.model('TelegramUpdateReceipt');
    const id = `${botId}:${updateId}`;
    const ownerToken = randomUUID();
    // Initialize without claiming. Mongo forbids $expr in upsert predicates;
    // the separate compare-and-set below is the atomic ownership boundary.
    try {
      await receipts.updateOne({ _id: id }, {
        $setOnInsert: {
          botId,
          updateId,
          state: 'failed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }, { upsert: true });
    } catch (error) {
      if (!isDuplicateKey(error)) {
        throw error;
      }
      // Another instance initialized the same unique botId:updateId key.
    }
    // Lease comparisons and lease timestamps use Mongo's clock.
    const claim = await receipts.updateOne({
      _id: id,
      $or: [{ state: 'failed' }, {
        state: 'processing',
        $expr: { $lte: ['$leaseUntil', '$$NOW'] },
      }],
    }, [{
      $set: {
        state: 'processing',
        ownerToken,
        leaseUntil: { $add: ['$$NOW', LEASE_MS] },
        updatedAt: '$$NOW',
        expiresAt: '$$REMOVE',
        completedAt: '$$REMOVE',
      },
    }]);
    if (claim.matchedCount !== 1) {
      const receipt = await receipts.findById(id).lean();
      if (receipt?.state === 'done') {
        return;
      }
      throw new BotError(503, 'payment_gateway_unavailable');
    }

    const owned = {
      _id: id,
      state: 'processing',
      ownerToken,
      $expr: { $gt: ['$leaseUntil', '$$NOW'] },
    };
    let lost = false;
    let renewing: Promise<void> | undefined;
    const timer = setInterval(() => {
      if (lost || renewing) {
        return;
      }
      // Catch inside the timer task: no detached rejection and no overlapping renewals.
      renewing = receipts.updateOne(owned, [{
        $set: {
          leaseUntil: { $add: ['$$NOW', LEASE_MS] },
          updatedAt: '$$NOW',
        },
      }]).then((result) => {
        if (result.matchedCount !== 1) {
          lost = true;
        }
      }).catch(() => {
        lost = true;
      }).finally(() => {
        renewing = undefined;
      });
    }, HEARTBEAT_MS);
    timer.unref();

    try {
      await handle();
      clearInterval(timer);
      await renewing;
      if (lost) {
        throw new BotError(503, 'payment_gateway_unavailable');
      }
      const result = await receipts.updateOne(owned, [{
        $set: {
          state: 'done',
          updatedAt: '$$NOW',
          completedAt: '$$NOW',
          expiresAt: { $add: ['$$NOW', RETENTION_MS] },
          ownerToken: '$$REMOVE',
          leaseUntil: '$$REMOVE',
        },
      }]);
      if (result.matchedCount !== 1) {
        throw new BotError(503, 'payment_gateway_unavailable');
      }
    } catch (error) {
      clearInterval(timer);
      await renewing;
      // Token + live lease fence stale owners. If Mongo is unavailable, expiry
      // permits a retry instead; never substitute an in-memory receipt.
      await receipts.updateOne(owned, [{
        $set: {
          state: 'failed',
          updatedAt: '$$NOW',
          ownerToken: '$$REMOVE',
          leaseUntil: '$$REMOVE',
        },
      }]).catch(() => undefined);
      throw error;
    } finally {
      clearInterval(timer);
    }
  }
}
