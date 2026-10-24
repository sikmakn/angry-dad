import { backend, checkIn, taskPeriod, uid, user } from '../helpers/backend';
import { TaskNotificationsService } from '../../src/modules/task-notifications/task-notifications.service';
import { NotificationStateService } from '../../src/modules/task-notifications/services/notification-state.service';
import { NotificationContextService } from '../../src/modules/task-notifications/services/notification-context.service';
import { DispatcherService } from '../../src/modules/delivery/services/dispatcher.service';
import { TelegramClient, TelegramFailure } from '../../src/modules/bot/services/telegram-client.service';
import { DeliveryService } from '../../src/modules/delivery/delivery.service';
import { PhrasesService } from '../../src/modules/phrases/phrases.service';
import { BattleService } from '../../src/modules/battle/battle.service';

describe('Adaptive notification scheduling and dispatch', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });
  afterEach(() => jest.restoreAllMocks());
  async function ready() {
    const u = await user(h.db), pair = await taskPeriod(h.db, u);
    await h.app.get(NotificationStateService).ensure(u._id);
    await h.app.get(TaskNotificationsService).plan();
    await h.db.model('TaskNotificationState').updateOne({ _id: u._id }, {
      $set: {
        dirty: false,
        nextAt: new Date(Date.now() - 1),
      },
      $unset: { leaseUntil: 1 },
    });
    await h.app.get(TaskNotificationsService).plan();
    const message = (await h.db.model('OutboxMessage').findOne({
      userId: u._id,
      status: 'planned',
    }).lean())!;
    expect(message).not.toBeNull();
    return {
      u,
      ...pair,
      message,
    };
  }
  it('one persisted next time and pending for multiple tasks and concurrent planners', async () => {
    const u = await user(h.db);
    await Promise.all(Array.from({ length: 3 }, () => taskPeriod(h.db, u)));
    await h.app.get(NotificationStateService).ensure(u._id);
    await Promise.all([h.app.get(TaskNotificationsService).plan(), h.app.get(TaskNotificationsService).plan()]);
    const before = (await h.db.model('TaskNotificationState').findById(u._id).lean())!;
    expect(before.nextAt!.getTime()).toBeGreaterThan(Date.now());
    await h.app.get(TaskNotificationsService).plan();
    expect((await h.db.model('TaskNotificationState').findById(u._id).lean())?.nextAt).toEqual(before.nextAt);
    await h.db.model('TaskNotificationState').updateOne({ _id: u._id }, { $set: { nextAt: new Date(0) } });
    await Promise.all([h.app.get(TaskNotificationsService).plan(), h.app.get(TaskNotificationsService).plan()]);
    expect(await h.db.model('OutboxMessage').countDocuments({
      userId: u._id,
      status: 'planned',
    })).toBe(1);
  });
  it('concurrent dispatchers send once, reveal draft only on success, preserve shared minimum', async () => {
    const { u, message } = await ready();
    const send = jest.spyOn(h.app.get(TelegramClient), 'send');
    await Promise.all([h.app.get(DispatcherService).dispatch(), h.app.get(DispatcherService).dispatch()]);
    const calls = send.mock.calls.filter(call => call[0] === u.telegramId);
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toContain('Про <b>«Написать три страницы»</b>\n\n');
    expect(calls[0][1]).toContain('<b>🟡 Проверка</b> <i>· Батя</i>');
    expect(calls[0][4]).toBe('HTML');
    const outbox = (await h.db.model('OutboxMessage').findById(message._id).lean())!;
    expect(outbox.status).toBe('sent');
    expect(calls[0][2]?.inline_keyboard).toEqual([
      [{
        text: 'Открыть приложение',
        web_app: { url: expect.stringContaining(`notification=${outbox.feedMessageId}`) },
      }],
      [
        {
          text: '😐',
          callback_data: `r:${outbox.feedMessageId}:0`,
        },
        {
          text: '😞',
          callback_data: `r:${outbox.feedMessageId}:1`,
        },
        {
          text: '😭',
          callback_data: `r:${outbox.feedMessageId}:2`,
        },
      ],
    ]);
    expect(await h.app.get(DeliveryService).get(u._id, outbox.feedMessageId!)).toMatchObject({ id: outbox.feedMessageId });
    const state = (await h.db.model('TaskNotificationState').findById(u._id).lean())!;
    expect(state.nextAt!.getTime() - outbox.sentAt!.getTime()).toBeGreaterThanOrEqual(180000);
    expect(state.pendingOutboxId).toBeUndefined();
  });
  it.each([403, 429, 503])('Telegram %i never creates false success or immediate retry', async (status) => {
    const { u, message } = await ready();
    jest.spyOn(h.app.get(TelegramClient), 'send').mockImplementation(async (_chat, _text, _keyboard, before) => {
      await before?.();
      throw new TelegramFailure(status, 600);
    });
    await h.app.get(DispatcherService).dispatch();
    const row = (await h.db.model('OutboxMessage').findById(message._id).lean())!;
    expect(row.status).toBe('cancelled');
    expect(row.sentAt).toBeUndefined();
    expect(Boolean(row.sendStartedAt)).toBe(status === 503);
    expect((await h.app.get(DeliveryService).list(u._id, {})).items).toEqual([]);
    expect((await h.db.model('User').findById(u._id).lean())?.lastSentAt).toBeUndefined();
    if (status === 403) {
      expect((await h.db.model('User').findById(u._id).lean())?.botBlocked).toBe(true);
    } else {
      expect((await h.db.model('TaskNotificationState').findById(u._id).lean())!.nextAt!.getTime()).toBeGreaterThan(Date.now() + 170000);
    }
  });
  it('draft inaccessible via feed/read/answer/rate/quote and not penalized by missed sweep', async () => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u);
    const draft = await checkIn(h.db, u, period._id, {
      draft: true,
      sentAt: new Date(Date.now() - 3600000),
    });
    const delivery = h.app.get(DeliveryService);
    await expect(delivery.get(u._id, draft._id)).rejects.toMatchObject({ status: 404 });
    await expect(delivery.answer(u, draft._id, 'partial')).rejects.toMatchObject({ status: 404 });
    await expect(h.app.get(PhrasesService).rate(u._id, draft._id, 2)).rejects.toMatchObject({ status: 404 });
    await expect(h.app.get(BattleService).quote(u, 'father', draft._id)).rejects.toMatchObject({ status: 404 });
    await h.app.get(TaskNotificationsService).missed();
    expect(await h.db.model('RespectChange').countDocuments({ userId: u._id })).toBe(0);
    expect((await delivery.list(u._id, {})).items).toEqual([]);
  });
  it('late success records delivery but cannot erase a newer revision/pending/date', async () => {
    const { u, message } = await ready();
    const token = uid(), sentAt = new Date();
    const feed = await checkIn(h.db, u, message.periodId!, { draft: true });
    await h.db.model('OutboxMessage').updateOne({ _id: message._id }, {
      $set: {
        leaseToken: token,
        status: 'leased',
        sendStartedAt: sentAt,
      },
    });
    await h.app.get(NotificationStateService).signal(u._id);
    const nextAt = new Date(Date.now() + 7200000), pending = uid();
    await h.db.model('TaskNotificationState').updateOne({ _id: u._id }, {
      $set: {
        pendingOutboxId: pending,
        nextAt,
      },
    });
    await h.app.get(TaskNotificationsService).recordSuccess({
      ...message,
      leaseToken: token,
    }, feed._id, 21, sentAt);
    expect(await h.db.model('TaskNotificationState').findById(u._id).lean()).toMatchObject({
      pendingOutboxId: pending,
      nextAt,
    });
    expect(await h.db.model('OutboxMessage').findById(message._id).lean()).toMatchObject({
      status: 'sent',
      sentAt,
    });
    expect(await h.db.model('FeedMessage').findById(feed._id).lean()).toMatchObject({
      draft: false,
      telegramMessageId: 21,
    });
  });
  it('unknown history survives 200 old confirmed sends; primary rotation ignores secondary mention', async () => {
    const u = await user(h.db), a = await taskPeriod(h.db, u), b = await taskPeriod(h.db, u);
    await h.app.get(NotificationStateService).ensure(u._id);
    const old = new Date(Date.now() - 7200000);
    await h.db.model('OutboxMessage').insertMany(Array.from({ length: 201 }, (_, i) => ({
      userId: u._id,
      kind: 'check_in',
      priority: 1,
      dueAt: old,
      originalDueAt: old,
      status: 'sent',
      dedupeKey: uid(),
      planRevision: i + 100,
      sentAt: old,
      primaryTaskId: a.task._id,
      secondaryTaskId: b.task._id,
    })));
    await h.db.model('OutboxMessage').create({
      userId: u._id,
      kind: 'check_in',
      priority: 1,
      dueAt: old,
      originalDueAt: old,
      status: 'cancelled',
      dedupeKey: uid(),
      planRevision: 9999,
      sendStartedAt: new Date(),
    });
    const state = (await h.db.model('TaskNotificationState').findById(u._id).lean())!;
    const context = (await h.app.get(NotificationContextService).load(u._id, state))!;
    expect(context.history[0].sendStartedAt).toBeDefined();
    expect(context.candidates.find(row => row.task._id === a.task._id)!.lastPrimaryAt).toBe(+old);
    expect(context.candidates.find(row => row.task._id === b.task._id)!.lastPrimaryAt).toBe(+b.task.createdAt);
  });
  it('series follow-ups share one penalty key even after series state disappears', async () => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u), old = new Date(Date.now() - 16 * 60000);
    const origin = await checkIn(h.db, u, period._id, { sentAt: old });
    const followup = await checkIn(h.db, u, period._id, { sentAt: old });
    await h.db.model('OutboxMessage').create({
      userId: u._id,
      periodId: period._id,
      kind: 'series_check_in',
      seriesId: uid(),
      seriesOriginFeedId: origin._id,
      feedMessageId: followup._id,
      status: 'sent',
      dueAt: old,
      originalDueAt: old,
      dedupeKey: uid(),
      priority: 1,
    });
    await h.app.get(TaskNotificationsService).missed();
    await h.app.get(TaskNotificationsService).missed();
    expect((await h.db.model('User').findById(u._id).lean())?.respect).toBe(11);
    const deltas = await Promise.all([origin, followup].map(feed => h.app.get(DeliveryService).get(u._id, feed._id)));
    expect(deltas.map(feed => feed.checkIn?.respectDelta).sort()).toEqual([-1, 0]);
    expect(await h.db.model('RespectChange').countDocuments({
      userId: u._id,
      reason: 'missed_check_in',
    })).toBe(1);
  });
  it('negative answers cannot indefinitely replenish an active series', async () => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u);
    const feeds = await Promise.all([checkIn(h.db, u, period._id), checkIn(h.db, u, period._id)]);
    await h.app.get(DeliveryService).answer(u, feeds[0]._id, 'partial');
    const first = (await h.db.model('TaskNotificationState').findById(u._id).lean())!;
    await expect(h.app.get(DeliveryService).answer(u, feeds[1]._id, 'not_started')).rejects.toMatchObject({ status: 409 });
    const future = await checkIn(h.db, u, period._id);
    await h.app.get(DeliveryService).answer(u, future._id, 'not_started');
    expect((await h.db.model('TaskNotificationState').findById(u._id).lean())?.series).toEqual(first.series);
  });
  it('expired unknown lease drops rather than blindly resending', async () => {
    const { u, message } = await ready();
    await h.db.model('OutboxMessage').updateOne({ _id: message._id }, {
      $set: {
        status: 'leased',
        leaseToken: uid(),
        leaseUntil: new Date(0),
        sendStartedAt: new Date(),
      },
    });
    const send = jest.spyOn(h.app.get(TelegramClient), 'send');
    await h.app.get(DispatcherService).dispatch();
    expect((await h.db.model('OutboxMessage').findById(message._id).lean())?.status).toBe('dropped');
    expect(send.mock.calls.filter(call => call[0] === u.telegramId)).toHaveLength(0);
  });
  it.each(['role', 'quietHours', 'blocked', 'closed'] as const)('dispatch revalidates %s after planning', async (change) => {
    const { u, task, message } = await ready();
    if (change === 'closed') {
      await h.db.model('Task').updateOne({ _id: task._id }, { $set: { status: 'done' } });
    } else {
      const update = change === 'role'
        ? { role: 'mother' }
        : change === 'quietHours'
          ? {
              quietHours: {
                start: 1,
                end: 2,
              },
            }
          : { botBlocked: true };
      await h.db.model('User').updateOne({ _id: u._id }, { $set: update });
    }
    const send = jest.spyOn(h.app.get(TelegramClient), 'send');
    await h.app.get(DispatcherService).dispatch();
    expect(send.mock.calls.filter(call => call[0] === u.telegramId)).toHaveLength(0);
    expect((await h.db.model('OutboxMessage').findById(message._id).lean())?.status).toBe('cancelled');
    expect((await h.app.get(DeliveryService).list(u._id, {})).items).toEqual([]);
  });
  it('six confirmed sends defer due work without exposing a draft or sending a catch-up batch', async () => {
    const { u, message } = await ready();
    const now = Date.now();
    await h.db.model('OutboxMessage').insertMany(Array.from({ length: 6 }, (_, i) => ({
      userId: u._id,
      kind: 'check_in',
      priority: 1,
      dueAt: new Date(now - (i + 1) * 240000),
      originalDueAt: new Date(now - (i + 1) * 240000),
      sentAt: new Date(now - (i + 1) * 240000),
      status: 'sent',
      dedupeKey: uid(),
      planRevision: 10000 + i,
    })));
    const send = jest.spyOn(h.app.get(TelegramClient), 'send');
    await h.app.get(DispatcherService).dispatch();
    await h.app.get(TaskNotificationsService).plan();
    expect(send.mock.calls.filter(call => call[0] === u.telegramId)).toHaveLength(0);
    expect((await h.db.model('OutboxMessage').findById(message._id).lean())?.sentAt).toBeUndefined();
    expect((await h.db.model('TaskNotificationState').findById(u._id).lean())!.nextAt!.getTime()).toBeGreaterThan(now + 35 * 60000);
    expect((await h.app.get(DeliveryService).list(u._id, {})).items).toEqual([]);
  });
  it('expired series pauses and clears without catch-up sends', async () => {
    const u = await user(h.db);
    await taskPeriod(h.db, u);
    await h.app.get(NotificationStateService).ensure(u._id);
    await h.db.model('TaskNotificationState').updateOne({ _id: u._id }, {
      $set: {
        series: {
          id: uid(),
          originFeedId: uid(),
          remaining: 2,
          penalized: false,
          endsAt: new Date(0),
        },
      },
    });
    await h.app.get(TaskNotificationsService).plan();
    const state = (await h.db.model('TaskNotificationState').findById(u._id).lean())!;
    expect(state.series).toBeUndefined();
    expect(state.pauseUntil!.getTime()).toBeGreaterThan(Date.now() + 29 * 60000);
    expect(await h.db.model('OutboxMessage').countDocuments({ userId: u._id })).toBe(0);
  });
});
