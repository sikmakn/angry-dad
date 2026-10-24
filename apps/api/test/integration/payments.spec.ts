import { backend, uid, user } from '../helpers/backend';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { StrikesService } from '../../src/modules/strikes/strikes.service';
import { TelegramClient } from '../../src/modules/bot/services/telegram-client.service';
import { PaymentReconciliationService } from '../../src/modules/payments/services/payment-reconciliation.service';
import type { StarHistoryTransaction } from '../../src/modules/bot/services/telegram-client.service';

describe('Stars money boundaries', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });
  afterEach(() => jest.restoreAllMocks());
  async function invoiced() {
    const u = await user(h.db), key = uid();
    const payments = h.app.get(PaymentsService);
    await payments.invoice(u, 'package-3', key);
    const row = (await h.db.model('StarsPayment').findOne({
      userId: u._id,
      clientKey: key,
    }).lean())!;
    return {
      u,
      row,
      payments,
      input: {
        telegramId: u.telegramId,
        payload: row.invoicePayload,
        currency: 'XTR',
        total: 39,
        chargeId: uid(),
      },
    };
  }
  it('link error preserves payload/snapshot and key mismatch is 409', async () => {
    const u = await user(h.db), key = uid(), p = h.app.get(PaymentsService);
    const telegram = h.app.get(TelegramClient);
    const invoice = jest.spyOn(telegram, 'invoice').mockRejectedValueOnce(new Error('synthetic failure'));
    await expect(p.invoice(u, 'package-1', key)).rejects.toMatchObject({ status: 503 });
    const old = (await h.db.model('StarsPayment').findOne({ userId: u._id }).lean())!;
    await expect(p.invoice(u, 'package-3', key)).rejects.toMatchObject({
      status: 409,
      code: 'idempotency_key_reused',
    });
    const result = await p.invoice(u, 'package-1', key);
    expect(result.packageSnapshot).toEqual({
      strikes: 1,
      priceStars: 15,
    });
    expect(invoice.mock.calls.map(c => c[0])).toEqual([old.invoicePayload, old.invoicePayload]);
    expect(await h.db.model('StarsPayment').countDocuments({ userId: u._id })).toBe(1);
  });
  it('concurrent invoice requests create one payment and one URL lease', async () => {
    const u = await user(h.db), key = uid();
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => h.app.get(PaymentsService).invoice(u, 'package-1', key)));
    expect(results.some(r => r.status === 'fulfilled')).toBe(true);
    for (const r of results) {
      if (r.status === 'rejected') {
        expect(r.reason).toMatchObject({ status: 503 });
      }
    }
    expect(await h.db.model('StarsPayment').countDocuments({ userId: u._id })).toBe(1);
  });
  it('precheckout pins query before external response and never credits', async () => {
    const { u, row, payments } = await invoiced();
    const answer = jest.spyOn(h.app.get(TelegramClient), 'preCheckout').mockRejectedValueOnce(new Error('lost reply')).mockResolvedValue(undefined);
    await expect(payments.preCheckout('query-one', u.telegramId, row.invoicePayload, 'XTR', 39)).rejects.toThrow('lost reply');
    await payments.preCheckout('query-one', u.telegramId, row.invoicePayload, 'XTR', 39);
    await payments.preCheckout('query-two', u.telegramId, row.invoicePayload, 'XTR', 39);
    expect(answer.mock.calls.map(c => c[1])).toEqual([true, true, false]);
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBe(0);
  });
  it('sixteen simultaneous confirmations credit exactly once', async () => {
    const { u, row, payments, input } = await invoiced();
    await Promise.all(Array.from({ length: 16 }, () => payments.confirm(input)));
    expect(await h.db.model('StarsPayment').findById(row._id).lean()).toMatchObject({
      status: 'credited',
      telegramChargeId: input.chargeId,
      starsUsdPerStar: 0.013,
    });
    expect(await h.db.model('StrikeLot').countDocuments({ paymentId: row._id })).toBe(1);
    expect(await h.db.model('StrikeOperation').countDocuments({
      userId: u._id,
      type: 'purchase',
    })).toBe(1);
    expect(await h.db.model('AnalyticsEvent').countDocuments({
      userId: u._id,
      type: 'purchase',
    })).toBe(1);
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBe(3);
  });
  it('failure after grant rolls back money and repeat succeeds once', async () => {
    const { u, row, payments, input } = await invoiced();
    const strikes = h.app.get(StrikesService), grant = strikes.grant.bind(strikes);
    jest.spyOn(strikes, 'grant').mockImplementationOnce(async (...args) => {
      await grant(...args);
      throw new Error('after grant');
    });
    await expect(payments.confirm(input)).rejects.toThrow('after grant');
    expect((await h.db.model('StarsPayment').findById(row._id).lean())?.status).toBe('invoiced');
    expect((await strikes.balance(u._id)).balance).toBe(0);
    await payments.confirm(input);
    expect((await strikes.balance(u._id)).balance).toBe(3);
  });
  it.each([
    ['currency_mismatch', { currency: 'USD' }], ['amount_mismatch', { total: 40 }], ['user_mismatch', { telegramId: 1 }],
  ])('unexpected confirmation %s records incident without grant', async (reason, overrides) => {
    const { u, payments, input } = await invoiced();
    await payments.confirm({
      ...input,
      ...overrides,
    });
    expect(await h.db.model('PaymentIncident').findOne({ chargeId: input.chargeId }).lean()).toMatchObject({ reason });
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBe(0);
  });
  it('a second charge on credited invoice is an incident, never another grant', async () => {
    const { u, payments, input } = await invoiced();
    await payments.confirm(input);
    const other = {
      ...input,
      chargeId: uid(),
    };
    await payments.confirm(other);
    expect(await h.db.model('PaymentIncident').findOne({ chargeId: other.chargeId }).lean()).toMatchObject({ reason: 'different_charge' });
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBe(3);
  });
  it('legacy paid recovery races safely with webhook', async () => {
    const { u, row, payments, input } = await invoiced();
    await h.db.model('StarsPayment').updateOne({ _id: row._id }, {
      $set: {
        status: 'paid',
        telegramChargeId: input.chargeId,
        paidAt: new Date(Date.now() - 30000),
      },
    });
    await Promise.all([payments.credit(row._id), payments.confirm(input), payments.credit(row._id)]);
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBe(3);
  });
  it('reconciliation plus webhook credit one lot; history absence leaves pending', async () => {
    const { u, row, payments, input } = await invoiced();
    await h.db.model('StarsPayment').updateOne({ _id: row._id }, { $set: { awaitingSince: new Date(Date.now() - 360000) } });
    const history: StarHistoryTransaction[] = [{
      id: input.chargeId,
      amount: 39,
      nanostarAmount: 0,
      date: Math.floor(Date.now() / 1000),
      outgoing: false,
      incomingInvoice: {
        telegramId: u.telegramId,
        payload: row.invoicePayload,
      },
    }];
    jest.spyOn(h.app.get(TelegramClient), 'getStarTransactions').mockResolvedValue(history);
    const reconciliation = h.app.get(PaymentReconciliationService);
    await Promise.all([reconciliation.reconcile(), reconciliation.reconcile(), payments.confirm(input)]);
    expect(await h.db.model('StrikeLot').countDocuments({ paymentId: row._id })).toBe(1);
    const pending = await invoiced();
    await reconciliation.reconcile();
    expect((await h.db.model('StarsPayment').findById(pending.row._id).lean())?.status).toBe('invoiced');
  });
  it('history refund before incoming payment prevents late webhook credit', async () => {
    const { u, row, payments, input } = await invoiced();
    await h.db.model('StarsPayment').updateOne({ _id: row._id }, { $set: { awaitingSince: new Date(Date.now() - 360000) } });
    jest.spyOn(h.app.get(TelegramClient), 'getStarTransactions').mockResolvedValue([
      {
        id: input.chargeId,
        amount: 39,
        nanostarAmount: 0,
        date: 1,
        outgoing: true,
      },
      {
        id: input.chargeId,
        amount: 39,
        nanostarAmount: 0,
        date: 1,
        outgoing: false,
        incomingInvoice: {
          telegramId: u.telegramId,
          payload: row.invoicePayload,
        },
      },
    ]);
    await h.app.get(PaymentReconciliationService).reconcile();
    await payments.confirm(input);
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBe(0);
    expect(await h.db.model('PaymentIncident').countDocuments({ paymentId: row._id })).toBe(2);
  });
  it('refund of untouched lot is idempotent; spent lot cannot refund', async () => {
    const { u, row, payments, input } = await invoiced();
    await payments.confirm(input);
    await Promise.all([payments.refund(row._id, 'Synthetic'), payments.refund(row._id, 'Synthetic')]);
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBe(0);
    expect(await h.db.model('StrikeOperation').countDocuments({
      userId: u._id,
      type: 'stars_refund',
    })).toBe(1);
    const spent = await invoiced();
    await spent.payments.confirm(spent.input);
    await h.db.transaction(s => h.app.get(StrikesService).reserve(spent.u._id, uid(), s));
    await expect(payments.refund(spent.row._id, 'Synthetic')).rejects.toMatchObject({ status: 409 });
  });
  it('expired key releases only key, retaining old financial history', async () => {
    const { u, row, payments, input } = await invoiced();
    await payments.confirm(input);
    await h.db.model('StarsPayment').updateOne({ _id: row._id }, { $set: { clientKeyExpiresAt: new Date(0) } });
    await payments.invoice(u, 'package-3', row.clientKey);
    expect(await h.db.model('StarsPayment').countDocuments({ userId: u._id })).toBe(2);
    expect((await h.db.model('StarsPayment').findById(row._id).lean())?.status).toBe('credited');
  });
  it('manual grants deduplicate, conflicts and excessive revoke are explicit', async () => {
    const u = await user(h.db), strikes = h.app.get(StrikesService), key = uid();
    await Promise.all(Array.from({ length: 4 }, () => strikes.manual(u._id, 'manual_grant', 3, 'Synthetic', key)));
    expect((await strikes.balance(u._id)).balance).toBe(3);
    await expect(strikes.manual(u._id, 'manual_grant', 4, 'Synthetic', key)).rejects.toMatchObject({ status: 409 });
    await expect(strikes.manual(u._id, 'manual_revoke', 4, 'Synthetic', uid())).rejects.toMatchObject({ status: 409 });
    await strikes.manual(u._id, 'manual_revoke', 3, 'Synthetic', uid());
    expect((await strikes.balance(u._id)).balance).toBe(0);
  });
});
