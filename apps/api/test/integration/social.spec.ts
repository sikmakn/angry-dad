import sharp from 'sharp';
import { authorization, backend, checkIn, taskPeriod, uid, user } from '../helpers/backend';
import { LeaderboardService } from '../../src/modules/leaderboard/leaderboard.service';
import { SharingService } from '../../src/modules/sharing/sharing.service';
import { TelegramClient } from '../../src/modules/bot/services/telegram-client.service';
import { PhrasesService } from '../../src/modules/phrases/phrases.service';
import { TasksService } from '../../src/modules/tasks/tasks.service';

describe('Sharing and leaderboard public boundaries', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend(true);
  });
  afterAll(async () => {
    await h?.app.close();
  });
  afterEach(() => jest.restoreAllMocks());
  async function request(path: string, id?: number, method = 'GET', body?: unknown) {
    return fetch(`${h.url}/api${path}`, {
      method,
      headers: {
        ...(id ? { authorization: authorization(id) } : {}),
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  it('participation is opt-in, boolean-only and persists across HTTP reads', async () => {
    const u = await user(h.db, { closedCount: 1 });
    const before = await request('/leaderboard', u.telegramId);
    expect(await before.json()).toMatchObject({
      me: {
        rank: null,
        inLeaderboard: false,
      },
    });
    for (const body of [{ inLeaderboard: 'true' }, { inLeaderboard: 1 }, {
      inLeaderboard: true,
      closedCount: 999,
    }]) {
      expect((await request('/me/leaderboard-participation', u.telegramId, 'PUT', body)).status).toBe(400);
    }
    const joined = await request('/me/leaderboard-participation', u.telegramId, 'PUT', { inLeaderboard: true });
    expect(joined.status).toBe(200);
    expect(await joined.json()).toEqual({ inLeaderboard: true });
    expect(await (await request('/leaderboard', u.telegramId)).json()).toMatchObject({
      me: {
        rank: 1,
        inLeaderboard: true,
      },
    });
    await request('/me/leaderboard-participation', u.telegramId, 'PUT', { inLeaderboard: false });
    expect(await (await request('/leaderboard', u.telegramId)).json()).toMatchObject({
      items: [],
      me: { rank: null },
    });
  });
  it('ranking breaks ties by completion time then ID and exposes only public fields', async () => {
    const at = new Date('2020-01-01T00:00:00Z'), base = uid();
    const a = await user(h.db, {
      _id: `${base}-a`,
      inLeaderboard: true,
      closedCount: 500,
      closedCountAt: at,
      firstName: 'A',
    });
    const b = await user(h.db, {
      _id: `${base}-b`,
      inLeaderboard: true,
      closedCount: 500,
      closedCountAt: at,
      firstName: 'B',
    });
    const c = await user(h.db, {
      inLeaderboard: true,
      closedCount: 500,
      closedCountAt: new Date(+at + 1),
      firstName: 'C',
    });
    const excluded = await Promise.all([
      user(h.db, {
        inLeaderboard: false,
        closedCount: 999,
      }),
      user(h.db, {
        inLeaderboard: true,
        closedCount: 999,
        deleting: true,
      }),
      user(h.db, {
        inLeaderboard: true,
        closedCount: 999,
        onboarding: 'guest',
      }),
      user(h.db, {
        inLeaderboard: true,
        closedCount: 0,
      }),
    ]);
    const result = await h.app.get(LeaderboardService).get(b);
    expect(result.items.slice(0, 3)).toEqual([
      {
        rank: 1,
        firstName: 'A',
        closedCount: 500,
      },
      {
        rank: 2,
        firstName: 'B',
        closedCount: 500,
      },
      {
        rank: 3,
        firstName: 'C',
        closedCount: 500,
      },
    ]);
    expect(result.me.rank).toBe(2);
    expect(JSON.stringify(result.items)).not.toContain(a.telegramId.toString());
    for (const u of [a, b, c, ...excluded]) {
      await h.app.get(LeaderboardService).participate(u._id, false);
    }
  });
  it('top 100 remains bounded while me gets rank beyond the returned page', async () => {
    const rows = await Promise.all(Array.from({ length: 101 }, (_, i) => user(h.db, {
      inLeaderboard: true,
      closedCount: 1000 + i,
    })));
    const result = await h.app.get(LeaderboardService).get(rows[0]);
    expect(result.items).toHaveLength(100);
    expect(result.items[0].closedCount).toBe(1100);
    expect(result.items[99].closedCount).toBe(1001);
    expect(result.me.rank).toBe(101);
    await Promise.all(rows.map(u => h.app.get(LeaderboardService).participate(u._id, false)));
  });
  it('completed task enters ranking and deletion removes its contribution', async () => {
    const u = await user(h.db, { inLeaderboard: true }), { task, period } = await taskPeriod(h.db, u);
    await h.app.get(TasksService).action(u, period._id, 'done');
    let current = (await h.db.model('User').findById(u._id).lean())!;
    expect((await h.app.get(LeaderboardService).get(current)).me).toMatchObject({
      closedCount: 1,
      rank: 1,
    });
    await h.app.get(TasksService).delete(current, task._id);
    current = (await h.db.model('User').findById(u._id).lean())!;
    expect((await h.app.get(LeaderboardService).get(current)).me).toMatchObject({
      closedCount: 0,
      rank: null,
    });
  });
  it.each(['/leaderboard', '/shares'])('requires authentication and onboarding for %s', async (path) => {
    const guest = await user(h.db, { onboarding: 'guest' });
    const method = path === '/shares' ? 'POST' : 'GET';
    expect((await request(path, undefined, method)).status).toBe(401);
    expect((await request(path, guest.telegramId, method)).status).toBe(403);
  });
  it.each(['done', 'fail'] as const)('%s share prepares a real PNG and records only successful shares', async (kind) => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u, { status: kind === 'done' ? 'done' : 'failed' });
    const prepare = jest.spyOn(h.app.get(TelegramClient), 'prepare').mockResolvedValue('synthetic-prepared');
    const pick = jest.spyOn(h.app.get(PhrasesService), 'pick');
    const result = await request('/shares', u.telegramId, 'POST', {
      kind,
      periodId: period._id,
    });
    expect(result.status).toBe(201);
    expect(await result.json()).toEqual({ preparedMessageId: 'synthetic-prepared' });
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(prepare.mock.calls[0][0]).toBe(u.telegramId);
    expect(await sharp(prepare.mock.calls[0][1]).metadata()).toMatchObject({
      format: 'png',
      width: 1000,
      height: 650,
    });
    expect(pick.mock.calls[0][6]).toBe(true);
    expect(await h.db.model('AnalyticsEvent').countDocuments({
      userId: u._id,
      type: 'share',
    })).toBe(1);
    prepare.mockRejectedValueOnce(new Error('synthetic Telegram failure'));
    const failed = await request('/shares', u.telegramId, 'POST', {
      kind,
      periodId: period._id,
    });
    expect(failed.status).toBe(503);
    expect(await failed.json()).toMatchObject({
      type: 'urn:angry-dad:problem:share_failed',
      title: 'share failed',
      status: 503,
    });
    expect(await h.db.model('AnalyticsEvent').countDocuments({
      userId: u._id,
      type: 'share',
    })).toBe(1);
  });
  it('share rejects wrong state, foreign/deleted task and ambiguous kind parameters before Telegram', async () => {
    const u = await user(h.db), other = await user(h.db), { task, period } = await taskPeriod(h.db, u);
    const prepare = jest.spyOn(h.app.get(TelegramClient), 'prepare');
    await expect(h.app.get(SharingService).create(u, {
      kind: 'done',
      periodId: period._id,
    })).rejects.toMatchObject({ status: 400 });
    await expect(h.app.get(SharingService).create(other, {
      kind: 'done',
      periodId: period._id,
    })).rejects.toMatchObject({ status: 404 });
    for (const body of [{ kind: 'done' }, { kind: 'battle' }, {
      kind: 'battle',
      role: 'father',
      periodId: period._id,
    }, {
      kind: 'done',
      periodId: period._id,
      role: 'father',
    }, {
      kind: 'done',
      periodId: 1,
    }]) {
      expect((await request('/shares', u.telegramId, 'POST', body)).status).toBe(400);
    }
    await h.app.get(TasksService).delete(u, task._id);
    await expect(h.app.get(SharingService).create(u, {
      kind: 'fail',
      periodId: period._id,
    })).rejects.toMatchObject({ status: 404 });
    expect(prepare).not.toHaveBeenCalled();
  });
  it('battle share rejects another role and selects break card at defeat 100', async () => {
    const u = await user(h.db), sharing = h.app.get(SharingService);
    await expect(sharing.create(u, {
      kind: 'battle',
      role: 'mother',
    })).rejects.toMatchObject({
      status: 409,
      code: 'role_mismatch',
    });
    const at = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(at);
    await h.db.model('BattleDialog').create({
      userId: u._id,
      role: 'father',
      defeat: 100,
      defeatAt: new Date(at),
      defeatAtLastTurn: 100,
      brokenArmed: false,
      nextSeq: 0,
    });
    const pick = jest.spyOn(h.app.get(PhrasesService), 'pick');
    await sharing.create(u, {
      kind: 'battle',
      role: 'father',
    });
    expect(pick.mock.calls[0][1]).toBe('on_break');
    expect(pick.mock.calls[0][6]).toBe(true);
  });
  it('draft success text cannot become the phrase source for a share', async () => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u, { status: 'done' });
    const phrase = await h.app.get(PhrasesService).create({
      role: 'father',
      category: 'on_success',
      template: 'PRIVATE DRAFT',
      defeatLevel: 'any',
      combo: 'any',
      source: 'owner',
    });
    await checkIn(h.db, u, period._id, {
      category: 'on_success',
      draft: true,
      phraseId: phrase.id,
    });
    const pick = jest.spyOn(h.app.get(PhrasesService), 'pick');
    await h.app.get(SharingService).create(u, {
      kind: 'done',
      periodId: period._id,
    });
    expect(pick).toHaveBeenCalledWith(u, 'on_success', undefined, undefined, period.deadline, undefined, true);
  });
});
