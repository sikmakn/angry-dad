import { isDuplicateKey } from '../../common/utils/mongo-error';
import { repeatedResult } from '../../common/utils/idempotency-result';
import { StrikesError } from './strikes.errors';
import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../database/database.service';
import { ApiError } from '../../common/errors/api-error';
import { present, pageSize } from '../../common/utils/presentation';
import type { PageInput } from '../../common/utils/presentation';
import { decodeCursor, encodeCursor } from '../../common/utils/pagination';
import type { StrikeOperation } from '../../database/schemas/strike-operation.schema';
import { AnalyticsService } from '../analytics/analytics.service';
import type { StrikeBalanceResponseView, OwnerStrikeBalanceResponseView, StrikeOperationListResponseView, StrikeOperationResponseView } from './strikes.types';
@Injectable()
export class StrikesService {
  constructor(private readonly db: DatabaseService, private readonly analytics: AnalyticsService) { }
  async balance(userId: string, session?: ClientSession): Promise<StrikeBalanceResponseView> {
    const lots = await this.db.model('StrikeLot').find({
      userId,
      refundedAt: { $exists: false },
    }).sort({
      createdAt: 1,
      _id: 1,
    }).session(session ?? null).lean();
    return {
      balance: lots.reduce((sum, row) => sum + row.remaining, 0),
      lots: lots.map(row => present(row, ['source', 'total', 'remaining', 'createdAt'])),
    };
  }

  async ownerBalance(userId: string): Promise<OwnerStrikeBalanceResponseView> {
    const lots = await this.db.model('StrikeLot').find({ userId }).sort({
      createdAt: 1,
      _id: 1,
    }).lean();
    return {
      balance: lots.reduce((sum, row) => sum + row.remaining, 0),
      lots: lots.map(row => present(row, ['source', 'total', 'remaining', 'createdAt', 'refundedAt'])),
    };
  }

  async operations(userId: string, input: PageInput): Promise<StrikeOperationListResponseView> {
    const limit = pageSize(input), cursor = decodeCursor(input.cursor);
    const rows = await this.db.model('StrikeOperation').find({
      userId,
      ...(cursor ? { _id: { $lt: cursor } } : {}),
    }).sort({ _id: -1 }).limit(limit + 1).lean();
    return {
      items: rows.slice(0, limit).map(row => present(row, ['type', 'amount', 'reason', 'at'])),
      nextCursor: rows.length > limit ? encodeCursor(rows[limit - 1]._id) : null,
    };
  }

  async grant(userId: string, amount: number, source: 'manual' | 'purchase', reason: string | undefined, session: ClientSession, paymentId?: string): Promise<StrikeOperation> {
    const [lot] = await this.db.model('StrikeLot').create([{
      userId,
      total: amount,
      remaining: amount,
      source,
      paymentId,
      createdAt: new Date(),
    }], { session });
    const [operation] = await this.db.model('StrikeOperation').create([{
      userId,
      lotId: lot._id,
      type: source === 'manual' ? 'manual_grant' : 'purchase',
      amount,
      reason,
      at: new Date(),
    }], { session });
    return operation.toObject();
  }

  async reserve(userId: string, turnId: string, session: ClientSession): Promise<void> {
    const lot = await this.db.model('StrikeLot').findOneAndUpdate({
      userId,
      remaining: { $gt: 0 },
      refundedAt: { $exists: false },
      refundPending: { $ne: true },
    }, { $inc: { remaining: -1 } }, {
      sort: {
        createdAt: 1,
        _id: 1,
      },
      session,
      new: true,
    }).lean();
    if (!lot) {
      throw new StrikesError(409, 'insufficient_strikes');
    }
    const payment = lot.paymentId ? await this.db.model('StarsPayment').findById(lot.paymentId).session(session).lean() : null;
    const unit = payment?.starsUsdPerStar !== undefined && payment.packageSnapshot.strikes > 0
      ? payment.packageSnapshot.priceStars * payment.starsUsdPerStar * 1000000 / payment.packageSnapshot.strikes
      : undefined;
    await this.db.model('StrikeOperation').create([{
      userId,
      lotId: lot._id,
      turnId,
      type: 'spend',
      paidStrike: lot.source === 'purchase',
      paidUnitRevenueMicros: lot.source === 'purchase' && unit !== undefined && Number.isFinite(unit) && unit >= 0 ? unit : undefined,
      economicState: 'reserved',
      amount: 1,
      at: new Date(),
    }], { session });
  }

  async refundTurn(userId: string, turnId: string, session: ClientSession): Promise<void> {
    if (await this.db.model('StrikeOperation').exists({
      turnId,
      type: 'turn_refund',
    }).session(session)) {
      return;
    }
    const spend = await this.db.model('StrikeOperation').findOne({
      turnId,
      type: 'spend',
      userId,
    }).session(session).lean();
    if (!spend) {
      return;
    }
    await this.db.model('StrikeLot').updateOne({ _id: spend.lotId }, { $inc: { remaining: 1 } }, { session });
    await this.db.model('StrikeOperation').updateOne({ _id: spend._id }, { $set: { economicState: 'refunded' } }, { session });
    await this.db.model('StrikeOperation').create([{
      userId,
      lotId: spend.lotId,
      turnId,
      type: 'turn_refund',
      amount: 1,
      reason: 'Возврат: ошибка хода',
      at: new Date(),
    }], { session });
  }

  async manual(userId: string, type: 'manual_grant' | 'manual_revoke', amount: number, reason: string, key?: string): Promise<StrikeOperationResponseView> {
    if (!reason.trim()) {
      throw ApiError.invalidRequest();
    }
    if (key) {
      await this.db.model('StrikeOperation').updateMany({
        userId,
        clientKey: key,
        at: { $lte: new Date(Date.now() - 86400000) },
      }, { $unset: { clientKey: 1 } });
    }
    return this.db.transaction(async (session) => {
      if (key) {
        const old = await this.db.model('StrikeOperation').findOne({
          userId,
          clientKey: key,
        }).session(session).lean();
        if (old) {
          if (old.requestHash !== JSON.stringify([type, amount, reason])) {
            throw new StrikesError(409, 'idempotency_key_reused');
          }
          return repeatedResult(present<StrikeOperationResponseView>(old, ['type', 'amount', 'reason', 'at']));
        }
      }
      let operation: StrikeOperation;
      if (type === 'manual_grant') {
        operation = await this.grant(userId, amount, 'manual', reason, session);
      } else {
        const lots = await this.db.model('StrikeLot').find({
          userId,
          remaining: { $gt: 0 },
          refundPending: { $ne: true },
        }).sort({
          createdAt: 1,
          _id: 1,
        }).session(session).lean();
        if (lots.reduce((sum, lot) => sum + lot.remaining, 0) < amount) {
          throw new StrikesError(409, 'revoke_exceeds_balance');
        }
        let left = amount;
        for (const lot of lots) {
          const debit = Math.min(left, lot.remaining);
          await this.db.model('StrikeLot').updateOne({ _id: lot._id }, { $inc: { remaining: -debit } }, { session });
          left -= debit;
          if (left === 0) {
            break;
          }
        }
        const [row] = await this.db.model('StrikeOperation').create([{
          userId,
          lotId: lots[0]._id,
          type,
          amount,
          reason,
          at: new Date(),
        }], { session });
        operation = row.toObject();
      }
      await this.db.model('StrikeOperation').updateOne({ _id: operation._id }, {
        $set: {
          clientKey: key,
          requestHash: JSON.stringify([type, amount, reason]),
        },
      }, { session });
      await this.analytics.journal(type === 'manual_grant' ? 'strikes_grant' : 'strikes_revoke', userId, operation._id, {
        amount,
        reason,
      }, session);
      return present<StrikeOperationResponseView>(operation, ['type', 'amount', 'reason', 'at']);
    }).catch(async (error: unknown) => {
      if (key && isDuplicateKey(error)) {
        const old = await this.db.model('StrikeOperation').findOne({
          userId,
          clientKey: key,
        }).lean();
        if (old?.requestHash === JSON.stringify([type, amount, reason])) {
          return repeatedResult(present<StrikeOperationResponseView>(old, ['type', 'amount', 'reason', 'at']));
        }
        if (old) {
          throw new StrikesError(409, 'idempotency_key_reused');
        }
      }
      throw error;
    });
  }
}
