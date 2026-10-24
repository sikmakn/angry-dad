import { repeatedResult } from '../../common/utils/idempotency-result';
import { isDuplicateKey } from '../../common/utils/mongo-error';
import { PaymentsError } from './payments.errors';
import { Injectable } from '@nestjs/common';
import { EventPublisher } from '../../common/events/event-publisher.service';
import { createHash, randomUUID } from 'node:crypto';
import type { ClientSession } from 'mongoose';
import { duplicatePaymentKey } from './helpers/payment-confirmation';
import type { PaymentConfirmation } from './helpers/payment-confirmation';
import { DatabaseService } from '../../database/database.service';
import { AppConfigService } from '../../config/app-config.service';
import type { User } from '../../database/schemas/user.schema';
import type { StarsPayment } from '../../database/schemas/stars-payment.schema';
import { ApiError } from '../../common/errors/api-error';
import { present, pageSize } from '../../common/utils/presentation';
import type { PageInput } from '../../common/utils/presentation';
import { decodeCursor, encodeCursor } from '../../common/utils/pagination';
import { StrikesService } from '../strikes/strikes.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { TelegramClient } from '../bot/services/telegram-client.service';
import type { PackageListResponseView, OwnerPackageListResponseView, OwnerPackageRequestView, OwnerPackageResponseView, InvoiceResponseView, PaymentResponseView, PaymentListResponseView, SupportTicketListResponseView, SupportTicketResponseView } from './payments.types';
@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabaseService, private readonly strikes: StrikesService, private readonly analytics: AnalyticsService, private readonly telegram: TelegramClient, private readonly config: AppConfigService, private readonly events: EventPublisher) { }
  async packages(): Promise<PackageListResponseView> {
    const rows = await this.db.model('Package').find({ active: true }).sort({ order: 1 }).lean();
    return { items: rows.map(row => present(row, ['id', 'strikes', 'priceStars'])) };
  }

  async ownerPackages(): Promise<OwnerPackageListResponseView> {
    const rows = await this.db.model('Package').find().sort({ order: 1 }).lean();
    return { items: rows.map(row => present(row, ['id', 'strikes', 'priceStars', 'active', 'order'])) };
  }

  async createPackage(input: OwnerPackageRequestView): Promise<OwnerPackageResponseView> {
    return this.db.transaction(async (session) => {
      const [row] = await this.db.model('Package').create([input], { session });
      await this.analytics.journal('package_edit', undefined, row._id, input, session);
      return present(row.toObject(), ['id', 'strikes', 'priceStars', 'active', 'order']);
    });
  }

  async replacePackage(id: string, input: OwnerPackageRequestView): Promise<OwnerPackageResponseView> {
    return this.db.transaction(async (session) => {
      const row = await this.db.model('Package').findByIdAndUpdate(id, { $set: input }, {
        session,
        new: true,
      }).lean();
      if (!row) {
        throw ApiError.notFound();
      }
      await this.analytics.journal('package_edit', undefined, id, input, session);
      return present(row, ['id', 'strikes', 'priceStars', 'active', 'order']);
    });
  }

  async invoice(user: User, packageId: string, key?: string): Promise<InvoiceResponseView> {
    const model = this.db.model('StarsPayment');
    await model.init();
    await this.releaseExpiredKeys();
    let row = key
      ? await model.findOne({
          userId: user._id,
          clientKey: key,
        }).lean()
      : null;
    let repeated = Boolean(row);
    if (!row) {
      const pack = await this.db.model('Package').findOne({
        _id: packageId,
        active: true,
      }).lean();
      if (!pack) {
        // A concurrent request may already have frozen a package that was just disabled.
        row = key
          ? await model.findOne({
              userId: user._id,
              clientKey: key,
            }).lean()
          : null;
        if (!row) {
          throw ApiError.notFound();
        }
        repeated = true;
      } else {
        try {
          row = (await model.create({
            userId: user._id,
            telegramId: user.telegramId,
            invoicePayload: randomUUID(),
            packageSnapshot: {
              strikes: pack.strikes,
              priceStars: pack.priceStars,
            },
            status: 'invoiced',
            starsUsdPerStar: this.config.starsUsdPerStar,
            clientKey: key,
            clientKeyExpiresAt: key ? new Date(Date.now() + 86400000) : undefined,
            packageId,
          })).toObject();
        } catch (error) {
          if (!key || !duplicatePaymentKey(error, 'clientKey')) {
            throw error;
          }
          row = await model.findOne({
            userId: user._id,
            clientKey: key,
          }).lean();
          if (!row) {
            throw error;
          }
          repeated = true;
        }
      }
    }
    if (row.packageId !== packageId) {
      throw new PaymentsError(409, 'idempotency_key_reused');
    }
    if (row.invoiceUrl) {
      return repeatedResult({
        invoiceUrl: row.invoiceUrl,
        packageSnapshot: row.packageSnapshot,
      });
    }
    const owner = randomUUID();
    const leased = await model.findOneAndUpdate({
      _id: row._id,
      invoiceUrl: { $exists: false },
      $or: [{ invoiceLeaseUntil: { $exists: false } }, { invoiceLeaseUntil: { $lte: new Date() } }],
    }, {
      $set: {
        invoiceLeaseOwner: owner,
        invoiceLeaseUntil: new Date(Date.now() + 30000),
      },
    }, { new: true }).lean();
    if (!leased) {
      const current = await model.findById(row._id).lean();
      if (current?.invoiceUrl) {
        return repeatedResult({
          invoiceUrl: current.invoiceUrl,
          packageSnapshot: current.packageSnapshot,
        });
      }
      throw new PaymentsError(503, 'payment_gateway_unavailable');
    }
    try {
      const invoiceUrl = await this.telegram.invoice(leased.invoicePayload, leased.packageSnapshot.strikes, leased.packageSnapshot.priceStars);
      const saved = await model.updateOne({
        _id: leased._id,
        invoiceLeaseOwner: owner,
        invoiceLeaseUntil: { $gt: new Date() },
        invoiceUrl: { $exists: false },
      }, {
        $set: { invoiceUrl },
        $unset: {
          invoiceLeaseOwner: 1,
          invoiceLeaseUntil: 1,
        },
      });
      if (saved.modifiedCount !== 1) {
        throw new PaymentsError(503, 'payment_gateway_unavailable');
      }
      const result = {
        invoiceUrl,
        packageSnapshot: leased.packageSnapshot,
      };
      return repeated ? repeatedResult(result) : result;
    } catch {
      await model.updateOne({
        _id: leased._id,
        invoiceLeaseOwner: owner,
      }, {
        $unset: {
          invoiceLeaseOwner: 1,
          invoiceLeaseUntil: 1,
        },
      });
      throw new PaymentsError(503, 'payment_gateway_unavailable');
    }
  }

  async preCheckout(id: string, telegramId: number, payload: string, currency: string, total: number): Promise<void> {
    const ok = await this.db.transaction(async (session) => {
      const payment = await this.db.model('StarsPayment').findOne({
        invoicePayload: payload,
        telegramId,
        status: 'invoiced',
      }).session(session).lean();
      if (!payment || currency !== 'XTR' || payment.packageSnapshot.priceStars !== total) {
        return false;
      }
      const user = await this.db.model('User').updateOne({
        _id: payment.userId,
        telegramId,
        deleting: { $ne: true },
      }, { $inc: { paymentRevision: 1 } }, { session });
      if (user.matchedCount !== 1) {
        return false;
      }
      const claimed = await this.db.model('StarsPayment').updateOne({
        _id: payment._id,
        status: 'invoiced',
        $or: [{ preCheckoutQueryId: { $exists: false } }, { preCheckoutQueryId: id }],
      }, {
        $set: { preCheckoutQueryId: id },
        $min: { awaitingSince: new Date() },
      }, { session });
      return claimed.matchedCount === 1;
    });
    // Persist before Telegram: a lost response must never allow another query.
    await this.telegram.preCheckout(id, ok);
  }

  async successful(telegramId: number, payload: string, currency: string, total: number, chargeId: string): Promise<void> {
    await this.confirm({
      telegramId,
      payload,
      currency,
      total,
      chargeId,
    });
  }

  async credit(id: string): Promise<void> {
    const payment = await this.db.model('StarsPayment').findOne({
      _id: id,
      status: 'paid',
      creditBlocked: { $ne: true },
    }).lean();
    if (payment?.telegramChargeId) {
      await this.confirm({
        telegramId: payment.telegramId,
        payload: payment.invoicePayload,
        currency: 'XTR',
        total: payment.packageSnapshot.priceStars,
        chargeId: payment.telegramChargeId,
        paidAt: payment.paidAt,
      });
    }
  }

  async confirm(input: PaymentConfirmation): Promise<void> {
    await this.db.model('StarsPayment').init();
    try {
      await this.db.transaction(async (session) => {
        const payment = await this.db.model('StarsPayment').findOne({ invoicePayload: input.payload }).session(session).lean();
        const reason = !payment
          ? 'unknown_invoice'
          : payment.telegramId !== input.telegramId
            ? 'user_mismatch'
            : input.currency !== 'XTR'
              ? 'currency_mismatch'
              : payment.packageSnapshot.priceStars !== input.total
                ? 'amount_mismatch'
                : payment.telegramChargeId && payment.telegramChargeId !== input.chargeId
                  ? 'different_charge'
                  : undefined;
        if (reason || !payment) {
          await this.recordIncident(input, reason ?? 'unknown_invoice', payment?._id, session);
          return;
        }
        if (payment.starsUsdPerStar === undefined) {
          await this.db.model('StarsPayment').updateOne({
            _id: payment._id,
            starsUsdPerStar: { $exists: false },
          }, { $set: { starsUsdPerStar: this.config.starsUsdPerStar } }, { session });
        }
        if (payment.status === 'credited' || payment.status === 'refunded') {
          return;
        }
        const returned = await this.db.model('PaymentIncident').exists({
          chargeId: input.chargeId,
          reason: 'history_charge_refunded',
        }).session(session);
        if (returned) {
          await this.recordIncident(input, 'confirmation_of_refunded_charge', payment._id, session);
          return;
        }
        const other = await this.db.model('StarsPayment').findOne({
          telegramChargeId: input.chargeId,
          _id: { $ne: payment._id },
        }).session(session).lean();
        if (other) {
          await this.recordIncident(input, 'charge_already_used', payment._id, session);
          return;
        }
        // A user write fences concurrent account deletion as well as payment commits.
        const user = await this.db.model('User').updateOne({
          _id: payment.userId,
          telegramId: input.telegramId,
          deleting: { $ne: true },
        }, { $inc: { paymentRevision: 1 } }, { session });
        const now = new Date();
        const changed = await this.db.model('StarsPayment').updateOne({
          _id: payment._id,
          status: { $in: ['invoiced', 'paid'] },
          $or: [{ telegramChargeId: { $exists: false } }, { telegramChargeId: input.chargeId }],
        }, {
          $set: {
            status: user.matchedCount === 1 ? 'credited' : 'paid',
            telegramChargeId: input.chargeId,
            paidAt: payment.paidAt ?? input.paidAt ?? now,
            ...(user.matchedCount === 1 ? { creditedAt: now } : { creditBlocked: true }),
          },
        }, { session });
        if (changed.matchedCount !== 1 || changed.modifiedCount !== 1) {
          return;
        }
        if (user.matchedCount !== 1) {
          await this.recordIncident(input, 'user_deleted_or_deleting', payment._id, session);
          return;
        }
        await this.strikes.grant(payment.userId, payment.packageSnapshot.strikes, 'purchase', undefined, session, payment._id);
        await this.analytics.event('purchase', payment.userId, {
          stars: payment.packageSnapshot.priceStars,
          strikes: payment.packageSnapshot.strikes,
        }, session);
      });
    } catch (error) {
      if (!duplicatePaymentKey(error, 'telegramChargeId')) {
        throw error;
      }
      const owner = await this.db.model('StarsPayment').findOne({ telegramChargeId: input.chargeId }).lean();
      if (!owner || owner.invoicePayload === input.payload) {
        throw error;
      }
      await this.recordIncident(input, 'charge_already_used');
    }
  }

  async recordIncident(input: PaymentConfirmation, reason: string, paymentId?: string, session?: ClientSession): Promise<void> {
    const payloadHash = createHash('sha256').update(input.payload).digest('hex');
    const id = createHash('sha256').update(JSON.stringify([payloadHash, input.telegramId, input.chargeId, input.currency, input.total, reason])).digest('hex');
    try {
      await this.db.model('PaymentIncident').updateOne({ _id: id }, {
        $setOnInsert: {
          paymentId,
          payloadHash,
          telegramId: input.telegramId,
          chargeId: input.chargeId,
          currency: input.currency,
          amount: input.total,
          reason,
          observedAt: new Date(),
        },
      }, {
        upsert: true,
        session,
      });
    } catch (error) {
      // Inside a transaction the driver must handle conflicts; an aborted callback cannot continue.
      if (session || !isDuplicateKey(error) || !await this.db.model('PaymentIncident').exists({ _id: id })) {
        throw error;
      }
    }
  }

  async releaseExpiredKeys(): Promise<void> {
    // Existing rows predate the key clock. Use their recorded creation/payment
    // time when available, otherwise begin a conservative 24h window now.
    await this.db.model('StarsPayment').updateMany({
      clientKey: { $type: 'string' },
      clientKeyExpiresAt: { $exists: false },
    }, [{ $set: { clientKeyExpiresAt: { $add: [{ $ifNull: ['$createdAt', { $ifNull: ['$paidAt', '$$NOW'] }] }, 86400000] } } }]);
    await this.db.model('StarsPayment').updateMany({ clientKeyExpiresAt: { $lte: new Date() } }, {
      $unset: {
        clientKey: 1,
        clientKeyExpiresAt: 1,
      },
    });
  }

  async recover(): Promise<void> {
    await this.releaseExpiredKeys();
    const payments = await this.db.model('StarsPayment').find({
      status: 'paid',
      creditBlocked: { $ne: true },
      telegramChargeId: { $type: 'string' },
      $or: [{ paidAt: { $lte: new Date(Date.now() - 20000) } }, { paidAt: { $exists: false } }],
    }).limit(100).lean();
    for (const payment of payments) {
      await this.credit(payment._id);
    }
    const refunds = await this.db.model('StarsPayment').find({ refundPending: true }).limit(100).lean();
    for (const payment of refunds) {
      await this.refund(payment._id, 'Повтор возврата');
    }
  }

  async listPayments(input: PageInput & {
    telegramId?: number;
    status?: string;
  }): Promise<PaymentListResponseView> {
    const cursor = decodeCursor(input.cursor), limit = pageSize(input);
    const rows = await this.db.model('StarsPayment').find({
      ...(input.telegramId ? { telegramId: input.telegramId } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(cursor ? { _id: { $lt: cursor } } : {}),
    }).sort({ _id: -1 }).limit(limit + 1).lean();
    return {
      items: await Promise.all(rows.slice(0, limit).map(row => this.paymentView(row))),
      nextCursor: rows.length > limit ? encodeCursor(rows[limit - 1]._id) : null,
    };
  }

  async refund(id: string, reason: string): Promise<PaymentResponseView> {
    if (!reason.trim()) {
      throw ApiError.invalidRequest();
    }
    const payment = await this.db.transaction(async (session) => {
      const row = await this.db.model('StarsPayment').findById(id).session(session).lean();
      if (!row) {
        throw ApiError.notFound();
      }
      if (row.status === 'refunded') {
        return row;
      }
      if (row.status !== 'credited' || !row.telegramChargeId) {
        throw new PaymentsError(409, 'refund_not_allowed');
      }
      const user = await this.db.model('User').findOne({
        _id: row.userId,
        deleting: { $ne: true },
      }).session(session).lean();
      const lot = await this.db.model('StrikeLot').findOneAndUpdate({
        paymentId: id,
        $expr: { $eq: ['$remaining', '$total'] },
        refundedAt: { $exists: false },
      }, { $set: { refundPending: true } }, { session }).lean();
      if (!user || !lot) {
        throw new PaymentsError(409, 'refund_not_allowed');
      }
      await this.db.model('StarsPayment').updateOne({ _id: id }, { $set: { refundPending: true } }, { session });
      return row;
    });
    if (payment.status === 'refunded') {
      return this.paymentView(payment);
    }
    try {
      await this.telegram.refund(payment.telegramId, payment.telegramChargeId!);
    } catch {
      throw new PaymentsError(503, 'payment_gateway_unavailable');
    }
    return this.db.transaction(async (session) => {
      const current = await this.db.model('StarsPayment').findById(id).session(session).lean();
      if (current?.status === 'refunded') {
        return this.paymentView(current);
      }
      const lot = await this.db.model('StrikeLot').findOneAndUpdate({
        paymentId: id,
        refundPending: true,
      }, {
        $set: {
          remaining: 0,
          refundedAt: new Date(),
          refundPending: false,
        },
      }, { session }).lean();
      if (!lot) {
        throw new PaymentsError(409, 'refund_not_allowed');
      }
      await this.db.model('StrikeOperation').create([{
        userId: payment.userId,
        lotId: lot._id,
        type: 'stars_refund',
        amount: lot.total,
        reason,
        at: new Date(),
      }], { session });
      await this.db.model('StarsPayment').updateOne({ _id: id }, {
        $set: {
          status: 'refunded',
          refundPending: false,
        },
      }, { session });
      await this.analytics.journal('stars_refund', payment.userId, id, { reason }, session);
      await this.analytics.event('refund', payment.userId, {}, session);
      return {
        ...present<PaymentResponseView>({
          ...payment,
          status: 'refunded',
        }, ['id', 'telegramId', 'packageSnapshot', 'status', 'telegramChargeId', 'paidAt', 'creditedAt']),
        refundable: false,
      };
    });
  }

  async support(user: User, text: string, source: { botId: number;
    updateId: number; }): Promise<void> {
    const sourceKey = `telegram:${source.botId}:${source.updateId}`;
    // A deterministic _id uses Mongo's built-in unique index, including before
    // optional indexes are built, and preserves a ticket after an outgoing failure.
    try {
      await this.db.model('SupportTicket').updateOne({ _id: sourceKey }, {
        $setOnInsert: {
          sourceKey,
          userId: user._id,
          telegramId: user.telegramId,
          text,
          status: 'open',
          at: new Date(),
        },
      }, { upsert: true });
    } catch (error) {
      if (!isDuplicateKey(error) || !await this.db.model('SupportTicket').exists({
        _id: sourceKey,
        sourceKey,
      })) {
        throw error;
      }
    }
  }

  async tickets(input: PageInput & {
    status?: string;
  }): Promise<SupportTicketListResponseView> {
    const cursor = decodeCursor(input.cursor), limit = pageSize(input);
    const rows = await this.db.model('SupportTicket').find({
      ...(input.status ? { status: input.status } : {}),
      ...(cursor ? { _id: { $lt: cursor } } : {}),
    }).sort({ _id: -1 }).limit(limit + 1).lean();
    return {
      items: rows.slice(0, limit).map(row => present(row, ['id', 'telegramId', 'text', 'status', 'at'])),
      nextCursor: rows.length > limit ? encodeCursor(rows[limit - 1]._id) : null,
    };
  }

  async updateTicket(id: string, status: 'open' | 'resolved'): Promise<SupportTicketResponseView> {
    const previous = await this.db.model('SupportTicket').findOneAndUpdate({
      _id: id,
      status: { $ne: status },
    }, { $set: { status } }, { new: false }).lean();
    if (previous) {
      this.events.publish('support.ticket.status.changed', {
        ticketId: previous._id,
        userId: previous.userId,
        telegramId: previous.telegramId,
        from: previous.status,
        to: status,
        at: new Date().toISOString(),
      });
      return present({
        ...previous,
        status,
      }, ['id', 'telegramId', 'text', 'status', 'at']);
    }
    const current = await this.db.model('SupportTicket').findById(id).lean();
    if (!current) {
      throw ApiError.notFound();
    }
    return present(current, ['id', 'telegramId', 'text', 'status', 'at']);
  }

  private async paymentView(row: StarsPayment): Promise<PaymentResponseView> {
    const lot = await this.db.model('StrikeLot').findOne({ paymentId: row._id }).lean();
    const user = await this.db.model('User').exists({
      _id: row.userId,
      deleting: { $ne: true },
    });
    return {
      ...present<PaymentResponseView>(row, ['id', 'telegramId', 'packageSnapshot', 'status', 'telegramChargeId', 'paidAt', 'creditedAt']),
      refundable: Boolean(user && row.status === 'credited' && lot && lot.remaining === lot.total && !lot.refundPending),
    };
  }
}
