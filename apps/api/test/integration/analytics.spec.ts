import { backend, eventually, uid, user } from '../helpers/backend';
import { UserStatisticsService } from '../../src/modules/analytics/services/user-statistics.service';
import { EngagementMetricsService } from '../../src/modules/analytics/services/engagement-metrics.service';
import { TurnEconomicsService } from '../../src/modules/analytics/services/turn-economics.service';
import { UsersService } from '../../src/modules/users/users.service';
import { AccountDeletionService } from '../../src/modules/users/services/account-deletion.service';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { PhrasesService } from '../../src/modules/phrases/phrases.service';
import { AnalyticsService } from '../../src/modules/analytics/analytics.service';
import { EventPublisher } from '../../src/common/events/event-publisher.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiService } from '../../src/modules/ai/ai.service';

describe('Statistics, economics and best-effort journal', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });
  afterEach(() => jest.restoreAllMocks());
  it('out-of-order activity keeps earliest start/task and UTC day min/max', async () => {
    const u = await user(h.db), stats = h.app.get(UserStatisticsService);
    const early = new Date('2025-01-01T23:59:00Z'), later = new Date('2025-01-02T00:01:00Z');
    await stats.activity(u._id, true, undefined, later);
    await stats.firstTask(u._id, later);
    await stats.activity(u._id, true, undefined, early);
    await stats.firstTask(u._id, new Date(+later + 60000));
    expect(await h.db.model('UserStatistics').findOne({ userId: u._id }).lean()).toMatchObject({
      firstStartedAt: early,
      firstTaskCreatedAt: later,
    });
    expect(await h.db.model('UserActivityDay').countDocuments({ userId: u._id })).toBe(2);
  });
  it('operational activity is synchronous and event statistics eventually registered once', async () => {
    const u = await user(h.db), at = new Date(Date.now() + 10);
    await h.app.get(UsersService).observeActivity(u._id, true, at);
    expect((await h.db.model('User').findById(u._id).lean())?.lastActivityAt).toEqual(at);
    await eventually(async () => {
      expect((await h.db.model('UserStatistics').findOne({ userId: u._id }).lean())?.firstStartedAt).toEqual(at);
    });
    expect(h.app.get(EventEmitter2).listenerCount('user.activity.observed')).toBe(1);
    expect(h.app.get(EventEmitter2).listenerCount('task.created')).toBe(1);
  });
  it('D7 uses completed calendar day seven and median averages middle two', async () => {
    const stats = h.app.get(UserStatisticsService);
    const start = new Date('2024-01-01T00:00:00Z'), end = new Date('2024-01-09T00:00:00Z');
    const a = await user(h.db), b = await user(h.db), immature = await user(h.db);
    await stats.activity(a._id, true, undefined, new Date('2024-01-01T12:00:00Z'));
    await stats.firstTask(a._id, new Date('2024-01-01T12:00:10Z'));
    await stats.activity(b._id, true, undefined, new Date('2024-01-01T23:00:00Z'));
    await stats.firstTask(b._id, new Date('2024-01-01T23:00:20Z'));
    await stats.activity(a._id, false, undefined, new Date('2024-01-08T23:59:59Z'));
    await stats.activity(immature._id, true, undefined, new Date('2024-01-02T12:00:00Z'));
    const result = await h.app.get(EngagementMetricsService).calculate(start, end);
    expect(result.retention).toBe(0.5);
    expect(result.median).toBe(15);
    expect(result.active).toEqual(expect.arrayContaining([a._id, b._id, immature._id]));
  });
  it('empty metrics are null rather than fabricated zeros', async () => {
    const result = await h.app.get(AnalyticsService).metrics('2001-01-01', '2001-01-02');
    expect(result).toMatchObject({
      day7Retention: null,
      medianStartToFirstTaskSeconds: null,
      turnCostToStrikeRevenue: null,
      checkInAnswerRate: null,
    });
    await expect(h.app.get(AnalyticsService).metrics('2026-01-02', '2026-01-01')).rejects.toMatchObject({ status: 400 });
  });
  it.each(['provider', 'estimate', 'mock', 'unknown'] as const)('paid consumption uses saved revenue and %s cost semantics', async (costSource) => {
    const u = await user(h.db), turnId = uid(), at = new Date(`2010-01-0${['provider', 'estimate', 'mock', 'unknown'].indexOf(costSource) + 1}T12:00:00Z`);
    const from = new Date(+at - 1), to = new Date(+at + 1);
    await h.db.model('StrikeOperation').create({
      userId: u._id,
      lotId: uid(),
      turnId,
      type: 'spend',
      amount: 1,
      paidStrike: true,
      paidUnitRevenueMicros: 100000,
      economicState: 'consumed',
      at,
    });
    await h.db.model('AiCall').insertMany(['judge', 'actor'].map(purpose => ({
      userId: u._id,
      turnId,
      purpose,
      provider: 'test',
      model: 'synthetic',
      inputTokens: 1,
      outputTokens: 1,
      costMicros: 5000,
      costSource,
      outcome: 'ok',
      latencyMs: 1,
      at,
    })));
    // Narrow cohort isolates this case without deleting fixtures or relying on lot/payment retention.
    const result = await h.app.get(TurnEconomicsService).ratio(from, to);
    expect(result).toBe(['provider', 'estimate'].includes(costSource) ? 0.1 : null);
  });
  it('ticket concurrent no-op transitions publish one event and preserve snapshot without user', async () => {
    const payments = h.app.get(PaymentsService), id = `telegram:123:${uid()}`;
    await h.db.model('SupportTicket').create({
      _id: id,
      telegramId: 123,
      text: 'private synthetic text',
      status: 'open',
      at: new Date(),
    });
    await Promise.all(Array.from({ length: 5 }, () => payments.updateTicket(id, 'resolved')));
    await eventually(async () => {
      expect(await h.db.model('OwnerAction').countDocuments({
        targetId: id,
        action: 'support_ticket_status_changed',
      })).toBe(1);
    });
    const row = (await h.db.model('OwnerAction').findOne({ targetId: id }).lean())!;
    expect(row).toMatchObject({
      targetTelegramId: 123,
      details: {
        from: 'open',
        to: 'resolved',
      },
    });
    expect(JSON.stringify(row)).not.toContain('private synthetic text');
    await payments.updateTicket(id, 'open');
    await eventually(async () => {
      expect(await h.db.model('OwnerAction').countDocuments({ targetId: id })).toBe(2);
    });
    await expect(payments.updateTicket(uid(), 'open')).rejects.toMatchObject({ status: 404 });
  });
  it('paraphrase success journals exact generated IDs; no event on AI failure', async () => {
    const phrases = h.app.get(PhrasesService);
    const source = await phrases.create({
      role: 'father',
      category: 'on_success',
      template: 'Синтетическая фраза',
      defeatLevel: 'any',
      combo: 'any',
      source: 'owner',
    });
    const result = await phrases.paraphrases(source.id);
    await eventually(async () => {
      expect(await h.db.model('OwnerAction').findOne({
        targetId: source.id,
        action: 'paraphrase_generate',
      }).lean()).toMatchObject({
        details: {
          count: result.items.length,
          generatedIds: result.items.map(row => row.id),
        },
      });
    });
    expect(result.items.every(row => row.status === 'pending_review')).toBe(true);
    jest.spyOn(h.app.get(AiService), 'paraphrase').mockRejectedValueOnce(new Error('synthetic AI failure'));
    await expect(phrases.paraphrases(source.id)).rejects.toThrow('synthetic AI failure');
    expect(await h.db.model('OwnerAction').countDocuments({
      targetId: source.id,
      action: 'paraphrase_generate',
    })).toBe(1);
  });
  it('throwing event dispatch cannot undo successful ticket transition', async () => {
    const id = uid();
    await h.db.model('SupportTicket').create({
      _id: id,
      telegramId: 123,
      text: 'Synthetic',
      status: 'open',
      at: new Date(),
    });
    jest.spyOn(h.app.get(EventEmitter2), 'emit').mockImplementation(() => {
      throw new Error('subscriber failed');
    });
    expect(await h.app.get(PaymentsService).updateTicket(id, 'resolved')).toMatchObject({ status: 'resolved' });
    expect((await h.db.model('SupportTicket').findById(id).lean())?.status).toBe('resolved');
  });
  it('empty paraphrase batch records count zero without inventing phrase IDs', async () => {
    const phrases = h.app.get(PhrasesService);
    const source = await phrases.create({
      role: 'father',
      category: 'on_success',
      template: 'Синтетическая фраза',
      defeatLevel: 'any',
      combo: 'any',
      source: 'owner',
    });
    jest.spyOn(h.app.get(AiService), 'paraphrase').mockResolvedValueOnce([]);
    expect(await phrases.paraphrases(source.id)).toEqual({ items: [] });
    await eventually(async () => {
      expect(await h.db.model('OwnerAction').findOne({
        targetId: source.id,
        action: 'paraphrase_generate',
      }).lean()).toMatchObject({
        details: {
          count: 0,
          generatedIds: [],
        },
      });
    });
  });
  it('deletion erases statistics; delayed events cannot recreate account data', async () => {
    const u = await user(h.db), stats = h.app.get(UserStatisticsService);
    await stats.activity(u._id, true);
    await h.app.get(AccountDeletionService).delete(u);
    expect(await stats.activity(u._id, true)).toBe(false);
    h.app.get(EventPublisher).publish('task.created', {
      taskId: uid(),
      userId: u._id,
      createdAt: new Date().toISOString(),
      size: 'medium',
    });
    // Await a concrete later event through the same listener, then check deleted user's state.
    const alive = await user(h.db);
    await h.app.get(UsersService).observeActivity(alive._id, true);
    await eventually(async () => {
      expect(await h.db.model('UserStatistics').exists({ userId: alive._id })).not.toBeNull();
    });
    expect(await h.db.model('UserStatistics').exists({ userId: u._id })).toBeNull();
    expect(await h.db.model('UserActivityDay').exists({ userId: u._id })).toBeNull();
    expect(await h.db.model('TaskNotificationState').exists({ userId: u._id })).toBeNull();
  });
});
