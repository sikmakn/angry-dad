import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
@Injectable()
export class TurnEconomicsService {
  constructor(private readonly db: DatabaseService) { }

  async ratio(start: Date, end: Date): Promise<number | null> {
    // Both sides use the reservation cohort, irrespective of billing/refund dates.
    // Costs of failed paid attempts remain a burden on consumed paid revenue.
    const spends = await this.db.model('StrikeOperation').find({
      type: 'spend',
      at: {
        $gte: start,
        $lte: end,
      },
    }).lean();
    const lots = await this.db.model('StrikeLot').find({ _id: { $in: spends.map(row => row.lotId) } }).lean();
    const lotsById = new Map(lots.map(row => [row._id, row]));
    const payments = await this.db.model('StarsPayment').find({ _id: { $in: lots.flatMap(row => row.paymentId ? [row.paymentId] : []) } }).lean();
    const paymentsById = new Map(payments.map(row => [row._id, row]));
    const turnIds = spends.flatMap(row => row.turnId ? [row.turnId] : []);
    const refunds = await this.db.model('StrikeOperation').find({
      type: 'turn_refund',
      turnId: { $in: turnIds },
    }).select('turnId').lean();
    const refundedTurns = new Set(refunds.map(row => row.turnId));
    const turns = await this.db.model('Turn').find({ _id: { $in: turnIds } }).select('status').lean();
    const turnsById = new Map(turns.map(row => [row._id, row]));
    const allCalls = await this.db.model('AiCall').find({ turnId: { $in: turnIds } }).lean();
    const callsByTurn = new Map<string, typeof allCalls>();
    for (const call of allCalls) {
      const rows = callsByTurn.get(call.turnId!) ?? [];
      rows.push(call);
      callsByTurn.set(call.turnId!, rows);
    }
    let revenue = 0, cost = 0;
    for (const spend of spends) {
      const lot = lotsById.get(spend.lotId);
      const paid = spend.paidStrike ?? (lot ? lot.source === 'purchase' : undefined);
      if (paid === undefined) {
        return null;
      }
      if (!paid) {
        continue;
      }
      if (!spend.turnId) {
        return null;
      }
      let unit = spend.paidUnitRevenueMicros;
      if (unit === undefined && spend.paidStrike === undefined && lot?.paymentId) {
        const payment = paymentsById.get(lot.paymentId);
        if (payment?.starsUsdPerStar !== undefined && payment.packageSnapshot.strikes > 0) {
          unit = payment.packageSnapshot.priceStars * payment.starsUsdPerStar * 1000000 / payment.packageSnapshot.strikes;
        }
      }
      if (unit === undefined || !Number.isFinite(unit) || unit < 0) {
        return null;
      }
      const refunded = refundedTurns.has(spend.turnId);
      let state = spend.economicState;
      if (!state) {
        const turn = turnsById.get(spend.turnId);
        state = refunded ? 'refunded' : turn?.status === 'done' ? 'consumed' : turn ? 'reserved' : undefined;
      }
      if (!state || state === 'reserved') {
        return null;
      }
      if (!refunded && state === 'consumed') {
        revenue += unit * spend.amount;
      }
      const calls = callsByTurn.get(spend.turnId) ?? [];
      if (!calls.length || (state === 'consumed' && (!calls.some(row => row.purpose === 'judge') || !calls.some(row => row.purpose === 'actor')))) {
        return null;
      }
      for (const call of calls) {
        if (!['provider', 'estimate'].includes(call.costSource ?? '') || call.outcome === 'pending' || call.costMicros === undefined || !Number.isFinite(call.costMicros) || call.costMicros < 0 || call.inputTokens === undefined || call.outputTokens === undefined) {
          return null;
        }
        cost += call.costMicros;
      }
    }
    return revenue > 0 && Number.isFinite(cost) && Number.isFinite(revenue) ? cost / revenue : null;
  }
}
