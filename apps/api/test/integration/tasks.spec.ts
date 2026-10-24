import { backend, checkIn, taskPeriod, user } from '../helpers/backend';
import { TasksService } from '../../src/modules/tasks/tasks.service';
import { DeliveryService } from '../../src/modules/delivery/delivery.service';
import { DeadlineSweeperService } from '../../src/modules/tasks/services/deadline-sweeper.service';
import { RecurrenceService } from '../../src/modules/tasks/services/recurrence.service';
import { PeriodsService } from '../../src/modules/tasks/services/periods.service';
import { NotificationStateService } from '../../src/modules/task-notifications/services/notification-state.service';

describe('Tasks and periods with real transactions', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  it.each([0, 1])('all user transitions respect the exact deadline offset %i ms', async (offset) => {
    // Freeze only the calendar clock; MongoDB and Nest retain their real scheduling.
    const at = Date.now();
    jest.useFakeTimers({
      now: at,
      doNotFake: ['hrtime', 'nextTick', 'performance', 'queueMicrotask', 'setImmediate', 'clearImmediate', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
    });
    for (const action of ['done', 'extend', 'surrender'] as const) {
      const u = await user(h.db), { period } = await taskPeriod(h.db, u, { deadline: new Date(at + offset) });
      const operation = h.app.get(TasksService).action(u, period._id, action);
      if (offset === 0) {
        await expect(operation).rejects.toMatchObject({ status: 409 });
        expect((await h.db.model('Period').findById(period._id).lean())?.status).toBe('active');
        expect(await h.db.model('RespectChange').countDocuments({ userId: u._id })).toBe(0);
      } else {
        await expect(operation).resolves.toBeDefined();
      }
    }
    for (const answer of ['done', 'partial', 'not_started'] as const) {
      const u = await user(h.db), { period } = await taskPeriod(h.db, u, { deadline: new Date(at + offset) });
      const feed = await checkIn(h.db, u, period._id);
      const operation = h.app.get(DeliveryService).answer(u, feed._id, answer);
      if (offset === 0) {
        await expect(operation).rejects.toMatchObject({ status: 409 });
        expect((await h.db.model('FeedMessage').findById(feed._id).lean())?.checkIn?.answer).toBeUndefined();
        expect(await h.db.model('TaskNotificationState').exists({ userId: u._id })).toBeNull();
      } else {
        await expect(operation).resolves.toBeDefined();
        expect((await h.db.model('FeedMessage').findById(feed._id).lean())?.checkIn?.answer).toBe(answer);
      }
    }
  });
  it.each(['done', 'extend', 'surrender'] as const)('rejects expired %s without persisting failure or reward', async (action) => {
    const u = await user(h.db);
    const { period } = await taskPeriod(h.db, u, { deadline: new Date(Date.now() - 1) });
    await expect(h.app.get(TasksService).action(u, period._id, action)).rejects.toMatchObject({ status: 409 });
    expect(await h.db.model('Period').findById(period._id).lean()).toMatchObject({
      status: 'active',
      retryUsed: false,
    });
    expect(await h.db.model('RespectChange').countDocuments({ userId: u._id })).toBe(0);
    expect(await h.db.model('FeedMessage').countDocuments({ userId: u._id })).toBe(0);
    await h.app.get(TasksService).action(u, period._id, 'deadline');
    expect(await h.db.model('Period').findById(period._id).lean()).toMatchObject({
      status: 'failed',
      closedAt: period.deadline,
      respectDelta: -2,
    });
    await expect(h.app.get(TasksService).action(u, period._id, 'deadline')).rejects.toMatchObject({ status: 409 });
    expect(await h.db.model('RespectChange').countDocuments({ userId: u._id })).toBe(1);
  });
  it.each(['done', 'partial', 'not_started'] as const)('expired check-in %s has no answer or series side effects', async (answer) => {
    const u = await user(h.db);
    const { period } = await taskPeriod(h.db, u, { deadline: new Date(Date.now() - 1) });
    const feed = await checkIn(h.db, u, period._id);
    await expect(h.app.get(DeliveryService).answer(u, feed._id, answer)).rejects.toMatchObject({ status: 409 });
    expect((await h.db.model('FeedMessage').findById(feed._id).lean())?.checkIn?.answer).toBeUndefined();
    expect(await h.db.model('TaskNotificationState').exists({ userId: u._id })).toBeNull();
  });
  it('done is atomic under a race and rewards only once', async () => {
    const u = await user(h.db);
    const { period } = await taskPeriod(h.db, u);
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => h.app.get(TasksService).action(u, period._id, 'done')));
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(await h.db.model('User').findById(u._id).lean()).toMatchObject({
      respect: 15,
      closedCount: 1,
    });
    expect(await h.db.model('RespectChange').countDocuments({ userId: u._id })).toBe(1);
  });
  it('legacy extension adds an hour repeatedly without a daily limit; stale deadline cannot fail it', async () => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u);
    await h.app.get(TasksService).action(u, period._id, 'extend');
    expect((await h.db.model('Period').findById(period._id).lean())?.deadline).toEqual(new Date(+period.deadline + 3600000));
    await h.app.get(TasksService).action(u, period._id, 'extend');
    expect((await h.db.model('Period').findById(period._id).lean())?.deadline).toEqual(new Date(+period.deadline + 7200000));
    await expect(h.app.get(TasksService).action(u, period._id, 'deadline')).rejects.toMatchObject({ status: 409 });
    expect((await h.db.model('User').findById(u._id).lean())?.respect).toBe(12);
  });
  it('explicit deadlines select sharper phrase levels and keep respect unchanged', async () => {
    const u = await user(h.db);
    const { period } = await taskPeriod(h.db, u);
    let deadline = +period.deadline;
    for (const [added, level] of [[3600000, 1], [86400000, 2], [3 * 86400000, 3]]) {
      deadline += added;
      const result = await h.app.get(TasksService).action(u, period._id, 'extend', 'done_button', undefined, new Date(deadline).toISOString());
      expect(result.task.currentPeriod?.deadline).toEqual(new Date(deadline).toISOString());
      expect(result.respectDelta).toBe(0);
      const phrase = await h.db.model('Phrase').findOne({
        category: 'on_excuse',
        level,
        template: { $exists: true },
      }).lean();
      expect(phrase).not.toBeNull();
      const ids = (await h.db.model('Phrase').find({
        category: 'on_excuse',
        level,
      }).lean()).map(row => row._id);
      expect(await h.db.model('FeedMessage').exists({
        periodId: period._id,
        text: result.reply,
        phraseId: { $in: ids },
      })).not.toBeNull();
      expect(result.reply).not.toMatch(/\[\[|\(а\)|Больше сегодня|Последний час/);
    }
    expect((await h.db.model('User').findById(u._id).lean())?.respect).toBe(12);
  });
  it('rejects invalid or non-increasing extension deadlines without changing the period', async () => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u);
    for (const deadline of ['invalid', period.deadline.toISOString(), new Date(+period.deadline - 1).toISOString(), new Date(Date.now() + 366 * 86400000).toISOString()]) {
      await expect(h.app.get(TasksService).action(u, period._id, 'extend', 'done_button', undefined, deadline)).rejects.toMatchObject({ status: 400 });
    }
    expect((await h.db.model('Period').findById(period._id).lean())?.deadline).toEqual(period.deadline);
    expect(await h.db.model('FeedMessage').countDocuments({ periodId: period._id })).toBe(0);
  });
  it('retry clears closure fields, retains penalty, and is available only once', async () => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u, { deadline: new Date(Date.now() - 1000) });
    const tasks = h.app.get(TasksService);
    await tasks.action(u, period._id, 'deadline');
    await tasks.action(u, period._id, 'retry');
    const retried = await h.db.model('Period').findById(period._id).lean();
    expect(retried).toMatchObject({
      status: 'active',
      retryUsed: true,
    });
    expect(retried?.deadline.getTime()).toBeGreaterThan(Date.now() + 3500000);
    expect(retried?.closedAt).toBeUndefined();
    expect(retried?.failMessageId).toBeUndefined();
    await expect(tasks.action(u, period._id, 'deadline')).rejects.toMatchObject({ status: 409 });
    await tasks.action(u, period._id, 'surrender');
    await expect(tasks.action(u, period._id, 'retry')).rejects.toMatchObject({ status: 409 });
    expect((await h.db.model('User').findById(u._id).lean())?.respect).toBe(9);
  });
  it('delete closes active periods without new penalty, feed, or later deadline action', async () => {
    const u = await user(h.db), { task, period } = await taskPeriod(h.db, u, { deadline: new Date(Date.now() - 1) });
    await h.app.get(TasksService).delete(u, task._id);
    expect(await h.db.model('Period').findById(period._id).lean()).toMatchObject({
      status: 'failed',
      respectDelta: 0,
    });
    await expect(h.app.get(TasksService).action(u, period._id, 'deadline')).rejects.toMatchObject({ status: 409 });
    expect(await h.db.model('RespectChange').countDocuments({ userId: u._id })).toBe(0);
    expect(await h.db.model('FeedMessage').countDocuments({
      userId: u._id,
      category: 'on_fail',
    })).toBe(0);
  });
  it('enforces ownership on reads and transitions', async () => {
    const u = await user(h.db), other = await user(h.db), { task, period } = await taskPeriod(h.db, u);
    await expect(h.app.get(TasksService).get(other._id, task._id)).rejects.toMatchObject({ status: 404 });
    await expect(h.app.get(TasksService).action(other, period._id, 'done')).rejects.toMatchObject({ status: 404 });
  });
  it('advances beyond 200 orphan periods across users, resets after empty batch', async () => {
    const base = `000-${Date.now()}`;
    const now = new Date(Date.now() - 1000);
    await h.db.model('Period').insertMany(Array.from({ length: 201 }, (_, i) => ({
      _id: `${base}-${String(i).padStart(3, '0')}`,
      taskId: `${base}-missing-${i}`,
      userId: `${base}-user-${i}`,
      startsAt: now,
      moodFrom: now,
      deadline: now,
      status: 'active',
      retryUsed: false,
    })));
    const u = await user(h.db), { period } = await taskPeriod(h.db, u, {
      _id: `001-${Date.now()}`,
      deadline: now,
    });
    const sweeper = new DeadlineSweeperService(h.db, h.app.get(RecurrenceService), h.app.get(PeriodsService), h.app.get(NotificationStateService));
    await sweeper.sweep();
    expect((await h.db.model('Period').findById(period._id).lean())?.status).toBe('active');
    await sweeper.sweep();
    expect((await h.db.model('Period').findById(period._id).lean())?.status).toBe('failed');
    await sweeper.sweep();
    const second = await taskPeriod(h.db, u, {
      _id: `${base}-000-new`,
      deadline: now,
    });
    await sweeper.sweep();
    expect((await h.db.model('Period').findById(second.period._id).lean())?.status).toBe('failed');
  });
});
