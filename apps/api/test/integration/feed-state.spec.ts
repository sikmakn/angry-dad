import { backend, checkIn, taskPeriod, user } from '../helpers/backend';
import { rolePhrases } from '../../src/database/role-phrases';
import { DeliveryService } from '../../src/modules/delivery/delivery.service';
import { TaskNotificationsService } from '../../src/modules/task-notifications/task-notifications.service';
import { TasksService } from '../../src/modules/tasks/tasks.service';

describe('Notification read state and active counters', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });

  it('includes the countdown on fresh delivered checks with no stored checkIn object', async () => {
    const owner = await user(h.db), { period } = await taskPeriod(h.db, owner);
    const firstAt = new Date(Date.now() - 60000);
    const first = await checkIn(h.db, owner, period._id, { sentAt: firstAt });
    const second = await checkIn(h.db, owner, period._id);
    await h.db.model('FeedMessage').updateMany({ _id: { $in: [first._id, second._id] } }, { $unset: { checkIn: 1 } });
    const due = new Date(firstAt.getTime() + 15 * 60000).toISOString();
    const delivery = h.app.get(DeliveryService);
    const page = await delivery.list(owner._id, {});
    expect(page.nextAnswerDueAt).toBe(due);
    expect(page.items).toHaveLength(2);
    for (const row of page.items) {
      expect(row).toMatchObject({
        needsAnswer: true,
        checkIn: {
          answerDueAt: due,
          expired: false,
        },
      });
    }
    expect(await delivery.get(owner._id, second._id)).toMatchObject({ checkIn: { answerDueAt: due } });
    expect(await delivery.markRead(owner._id, first._id)).toMatchObject({ checkIn: { answerDueAt: due } });
  });

  it('puts pending checks before answered records across page boundaries', async () => {
    const owner = await user(h.db), { period } = await taskPeriod(h.db, owner);
    const pending = await checkIn(h.db, owner, period._id, {
      _id: 'a-pending',
      readAt: new Date(),
    });
    const unread = await checkIn(h.db, owner, period._id, { _id: 'b-pending' });
    const answered = await checkIn(h.db, owner, period._id, {
      _id: 'z-answered',
      checkIn: {
        answer: 'partial',
        answeredAt: new Date(),
      },
    });
    const delivery = h.app.get(DeliveryService);
    const first = await delivery.list(owner._id, { limit: 1 });
    expect(first.items.map(row => row.id)).toEqual([unread._id]);
    const second = await delivery.list(owner._id, {
      limit: 1,
      cursor: first.nextCursor ?? undefined,
    });
    expect(second.items.map(row => row.id)).toEqual([pending._id]);
    const third = await delivery.list(owner._id, {
      limit: 1,
      cursor: second.nextCursor ?? undefined,
    });
    expect(third.items.map(row => row.id)).toEqual([answered._id]);
    expect(third.nextCursor).toBeNull();
  });

  it('keeps read and answered separate, counts beyond pagination, and drops closed checks', async () => {
    const owner = await user(h.db), { period } = await taskPeriod(h.db, owner);
    const first = await checkIn(h.db, owner, period._id), second = await checkIn(h.db, owner, period._id);
    const delivery = h.app.get(DeliveryService);
    expect(await delivery.list(owner._id, { limit: 1 })).toMatchObject({
      unreadCount: 2,
      unansweredCount: 2,
      activeCount: 2,
    });
    const read = await delivery.markRead(owner._id, first._id);
    expect(read.readAt).toEqual(expect.any(String));
    expect(read.needsAnswer).toBe(true);
    expect((await delivery.markRead(owner._id, first._id)).readAt).toBe(read.readAt);
    expect(await delivery.list(owner._id, { limit: 1 })).toMatchObject({
      unreadCount: 1,
      unansweredCount: 2,
      activeCount: 2,
    });
    await delivery.answer(owner, first._id, 'partial');
    await delivery.markRead(owner._id, second._id);
    expect(await delivery.list(owner._id, {})).toMatchObject({
      unreadCount: 0,
      unansweredCount: 0,
      activeCount: 0,
    });
    await h.app.get(TasksService).action(owner, period._id, 'done');
    expect(await delivery.list(owner._id, {})).toMatchObject({
      unreadCount: 0,
      unansweredCount: 0,
      activeCount: 0,
    });
    expect((await delivery.get(owner._id, second._id)).needsAnswer).toBe(false);
  });

  it.each(['partial', 'not_started', 'done'] as const)('closes sibling checks neutrally after %s, but leaves other tasks and future checks open', async (answer) => {
    const owner = await user(h.db), { period } = await taskPeriod(h.db, owner);
    const other = await taskPeriod(h.db, owner);
    const first = await checkIn(h.db, owner, period._id);
    const sibling = await checkIn(h.db, owner, period._id, { sentAt: new Date(Date.now() - 16 * 60000) });
    const unrelated = await checkIn(h.db, owner, other.period._id);
    const delivery = h.app.get(DeliveryService);
    const result = await delivery.answer(owner, first._id, answer);
    const closed = await delivery.get(owner._id, sibling._id);
    expect(closed).toMatchObject({
      needsAnswer: false,
      checkIn: { resolvedAt: expect.any(String) },
    });
    expect(closed.checkIn?.answer).toBeUndefined();
    expect((await delivery.get(owner._id, unrelated._id)).needsAnswer).toBe(true);
    expect(await delivery.list(owner._id, { limit: 1 })).toMatchObject({
      unreadCount: 1,
      unansweredCount: 1,
      activeCount: 1,
    });
    await expect(delivery.answer(owner, sibling._id, 'done')).rejects.toMatchObject({ status: 409 });
    const before = (await h.db.model('User').findById(owner._id).lean())!.respect;
    expect(before).toBe(result.respect);
    await h.app.get(TaskNotificationsService).missed();
    expect((await h.db.model('User').findById(owner._id).lean())!.respect).toBe(before);
    if (answer !== 'done') {
      const future = await checkIn(h.db, owner, period._id);
      expect((await delivery.get(owner._id, future._id)).needsAnswer).toBe(true);
    }
    if (answer === 'not_started') {
      // Ответ берётся из общего набора или из набора роли; у фраз с переменными сверяем начало до переменной.
      const starts = [...rolePhrases.father.on_check_in_reply_not_started, ...rolePhrases.mother.on_check_in_reply_not_started].map(t => t.split('{')[0].slice(0, 10).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      expect(result.reply).toMatch(new RegExp(`Даже не начал|Ноль сделано|Сборы уже|Прекрасное распределение|репетировать начало|${starts.join('|')}`));
    }
  });

  it('does not expose foreign users, drafts or expired tasks as actionable notifications', async () => {
    const owner = await user(h.db), other = await user(h.db), { period } = await taskPeriod(h.db, owner);
    const visible = await checkIn(h.db, owner, period._id);
    const draft = await checkIn(h.db, owner, period._id, { draft: true });
    const delivery = h.app.get(DeliveryService);
    await expect(delivery.markRead(other._id, visible._id)).rejects.toMatchObject({ status: 404 });
    await expect(delivery.markRead(owner._id, draft._id)).rejects.toMatchObject({ status: 404 });
    expect(await delivery.list(other._id, {})).toMatchObject({
      unreadCount: 0,
      unansweredCount: 0,
      activeCount: 0,
    });
    await h.db.model('Period').updateOne({ _id: period._id }, { $set: { deadline: new Date(Date.now() - 1000) } });
    expect((await delivery.get(owner._id, visible._id)).needsAnswer).toBe(false);
    expect(await delivery.list(owner._id, {})).toMatchObject({
      unreadCount: 0,
      unansweredCount: 0,
      activeCount: 0,
    });
    expect((await h.db.model('FeedMessage').findById(visible._id).lean())?.readAt).toBeUndefined();
  });

  it('shows actual silence penalties, including zero at the daily cap, and preserves them after answering', async () => {
    const owner = await user(h.db);
    const checks = [];
    for (let i = 0; i < 4; i++) {
      const { period } = await taskPeriod(h.db, owner);
      checks.push(await checkIn(h.db, owner, period._id, { sentAt: new Date(Date.now() - 16 * 60000) }));
    }
    await h.app.get(TaskNotificationsService).missed();
    const delivery = h.app.get(DeliveryService);
    const views = await Promise.all(checks.map(row => delivery.get(owner._id, row._id)));
    expect(views.map(row => row.checkIn?.respectDelta).sort()).toEqual([-1, -1, -1, 0]);
    const penalized = views.find(row => row.checkIn?.respectDelta === -1)!;
    await delivery.answer(owner, penalized.id, 'partial');
    expect((await delivery.get(owner._id, penalized.id)).checkIn?.respectDelta).toBe(-1);
    await h.db.model('FeedMessage').updateOne({ _id: penalized.id }, { $unset: { 'checkIn.respectDelta': 1 } });
    expect((await delivery.get(owner._id, penalized.id)).checkIn?.respectDelta).toBe(-1);
    expect((await delivery.list(owner._id, {})).items.find(row => row.id === penalized.id)?.checkIn?.respectDelta).toBe(-1);
  });

  it('uses the first pending deadline, sorts its newest card first, and penalizes the whole batch once', async () => {
    const owner = await user(h.db), { period } = await taskPeriod(h.db, owner), other = await taskPeriod(h.db, owner);
    const firstAt = new Date(Date.now() - 16 * 60000);
    const first = await checkIn(h.db, owner, period._id, {
      _id: 'group-a',
      sentAt: firstAt,
    });
    const newest = await checkIn(h.db, owner, period._id, { _id: 'group-b' });
    const lessUrgent = await checkIn(h.db, owner, other.period._id, { _id: 'group-z' });
    const delivery = h.app.get(DeliveryService);
    const due = new Date(firstAt.getTime() + 15 * 60000).toISOString();
    expect((await delivery.list(owner._id, {})).nextAnswerDueAt).toBe(due);
    await delivery.markRead(owner._id, first._id);
    expect((await delivery.list(owner._id, {})).nextAnswerDueAt).toBe(due);
    const page = await delivery.list(owner._id, { limit: 1 });
    expect(page.items[0].id).toBe(newest._id);
    const next = await delivery.list(owner._id, {
      limit: 1,
      cursor: page.nextCursor!,
    });
    expect(next.items[0].id).toBe(first._id);
    const last = await delivery.list(owner._id, {
      limit: 1,
      cursor: next.nextCursor!,
    });
    expect(last.items[0].id).toBe(lessUrgent._id);
    await h.app.get(TaskNotificationsService).missed();
    expect((await delivery.get(owner._id, newest._id)).checkIn).toMatchObject({
      expired: true,
      groupRespectDelta: -1,
      answerDueAt: due,
    });
    expect((await delivery.get(owner._id, first._id)).checkIn?.expired).toBe(true);
    expect((await delivery.get(owner._id, first._id)).checkIn?.groupRespectDelta).toBeUndefined();
    const late = await checkIn(h.db, owner, period._id, { _id: 'group-c' });
    await h.app.get(TaskNotificationsService).missed();
    expect((await h.db.model('User').findById(owner._id).lean())?.respect).toBe(11);
    expect((await delivery.get(owner._id, late._id)).checkIn?.groupRespectDelta).toBe(-1);
    await delivery.answer(owner, late._id, 'partial');
    expect((await delivery.get(owner._id, newest._id)).checkIn).toMatchObject({
      expired: false,
      resolvedAt: expect.any(String),
    });
    expect((await delivery.get(owner._id, late._id)).checkIn?.expired).toBe(false);
  });

  it('removes unread checks from the badge after task completion while keeping their history', async () => {
    const owner = await user(h.db), { period } = await taskPeriod(h.db, owner);
    const stale = await checkIn(h.db, owner, period._id);
    await checkIn(h.db, owner, period._id, {
      checkIn: {
        answer: 'partial',
        answeredAt: new Date(),
      },
    });
    const delivery = h.app.get(DeliveryService);
    await h.app.get(TasksService).action(owner, period._id, 'done');
    const list = await delivery.list(owner._id, {});
    expect(list).toMatchObject({
      unreadCount: 0,
      unansweredCount: 0,
      activeCount: 0,
    });
    expect(list.items).toEqual(expect.arrayContaining([expect.objectContaining({
      id: stale._id,
      needsAnswer: false,
      taskOutcome: 'done',
    })]));
    expect((await delivery.get(owner._id, stale._id)).readAt).toBeUndefined();
  });
});
