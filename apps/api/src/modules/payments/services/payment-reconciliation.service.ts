import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import type { StarsPayment } from '../../../database/schemas/stars-payment.schema';
import { TelegramClient } from '../../bot/services/telegram-client.service';
import type { StarHistoryTransaction } from '../../bot/services/telegram-client.service';
import { PaymentsService } from '../payments.service';

interface HistoryScan {
  candidates: StarsPayment[];
  phase: 'payments' | 'refunds' | 'confirm';
  offset: number;
  incoming: Map<string, StarHistoryTransaction>;
  refunded: Set<string>;
}

@Injectable()
export class PaymentReconciliationService {
  private scan?: HistoryScan;
  private running?: Promise<void>;
  private stopping = false;

  constructor(private readonly db: DatabaseService, private readonly telegram: TelegramClient, private readonly payments: PaymentsService) { }

  reconcile(): Promise<void> {
    if (this.stopping) {
      return Promise.resolve();
    }
    if (!this.running) {
      this.running = this.step().finally(() => {
        this.running = undefined;
      });
    }
    return this.running;
  }

  async stop(): Promise<void> {
    this.stopping = true;
    // The worker logs this rejection; shutdown must still await its other jobs.
    await this.running?.catch(() => undefined);
  }

  private async step(): Promise<void> {
    if (!this.scan) {
      // No historical clock exists for some legacy rows. Inspect those immediately
      // without inventing a creation date for the financial record.
      const before = new Date(Date.now() - 300000);
      const candidates = await this.db.model('StarsPayment').find({
        status: 'invoiced',
        $or: [{ awaitingSince: { $lte: before } }, {
          awaitingSince: { $exists: false },
          $or: [{ createdAt: { $lte: before } }, { createdAt: { $exists: false } }],
        }],
      }).sort({
        historyCheckedAt: 1,
        _id: 1,
      }).limit(100).lean();
      if (!candidates.length) {
        return;
      }
      this.scan = {
        candidates,
        phase: 'payments',
        offset: 0,
        incoming: new Map(),
        refunded: new Set(),
      };
    }
    const scan = this.scan;
    const payloads = new Set(scan.candidates.map(row => row.invoicePayload));
    // Bounded work per minute, with continuation. Never infer a cutoff or page order.
    // A restart safely restarts the scan; history absence never changes payment state.
    for (let page = 0; page < 10 && !this.stopping && scan.phase !== 'confirm'; page++) {
      const rows = await this.telegram.getStarTransactions(scan.offset, 100);
      for (const row of rows) {
        if (scan.phase === 'payments' && row.incomingInvoice?.payload && payloads.has(row.incomingInvoice.payload) && !row.outgoing) {
          const key = JSON.stringify([row.id, row.incomingInvoice.payload, row.incomingInvoice.telegramId, row.amount, row.nanostarAmount]);
          scan.incoming.set(key, row);
        } else if (scan.phase === 'refunds' && row.outgoing) {
          if ([...scan.incoming.values()].some(incoming => incoming.id === row.id)) {
            scan.refunded.add(row.id);
          }
        }
      }
      scan.offset += rows.length;
      if (rows.length < 100) {
        scan.offset = 0;
        scan.phase = scan.phase === 'payments' ? 'refunds' : 'confirm';
      }
    }
    if (scan.phase !== 'confirm' || this.stopping) {
      return;
    }
    // The second full pass prevents crediting an old payment whose refund appears
    // on another page, including pages preceding the incoming transaction.
    for (const row of scan.incoming.values()) {
      if (this.stopping) {
        return;
      }
      const incoming = row.incomingInvoice!;
      const input = {
        telegramId: incoming.telegramId,
        payload: incoming.payload!,
        currency: 'XTR',
        total: row.amount,
        chargeId: row.id,
        paidAt: new Date(row.date * 1000),
      };
      if (scan.refunded.has(row.id) || row.nanostarAmount !== 0) {
        const payment = scan.candidates.find(candidate => candidate.invoicePayload === incoming.payload);
        await this.payments.recordIncident(input, scan.refunded.has(row.id) ? 'history_charge_refunded' : 'fractional_amount_mismatch', payment?._id);
      } else {
        await this.payments.confirm(input);
      }
    }
    await this.db.model('StarsPayment').updateMany({ _id: { $in: scan.candidates.map(row => row._id) } }, { $set: { historyCheckedAt: new Date() } });
    this.scan = undefined;
  }
}
