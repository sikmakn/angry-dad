import { authorization, backend, eventually, taskPeriod, uid, user } from '../helpers/backend';
import { StrikesService } from '../../src/modules/strikes/strikes.service';

describe.each([false, true])('HTTP application (global prefix=%s)', (prefix) => {
  let h: Awaited<ReturnType<typeof backend>>;
  let base: string;
  beforeAll(async () => {
    h = await backend(prefix);
    base = `${h.url}${prefix ? '/api' : ''}`;
  });
  afterAll(async () => {
    await h?.app.close();
  });
  async function request(path: string, id?: number, method = 'GET', body?: unknown, key?: string) {
    return fetch(`${base}${path}`, {
      method,
      headers: {
        ...(id ? { authorization: authorization(id) } : {}),
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(key ? { 'idempotency-key': key } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  it('unauthorized response is Problem JSON without internal details', async () => {
    const r = await request('/me');
    expect(r.status).toBe(401);
    expect(r.headers.get('content-type')).toContain('application/problem+json');
    expect(await r.json()).toEqual({
      type: 'urn:angry-dad:problem:unauthorized',
      title: 'unauthorized',
      status: 401,
    });
  });
  it('guest may open profile, cannot access tasks or owner endpoints; onboarding is once only', async () => {
    const u = await user(h.db, { onboarding: 'guest' });
    expect((await request('/tasks', u.telegramId)).status).toBe(403);
    expect((await request('/owner/packages', u.telegramId)).status).toBe(403);
    const me = await request('/me', u.telegramId);
    expect(me.status).toBe(200);
    expect(await me.json()).toMatchObject({
      id: u._id,
      isOwner: false,
      onboarding: 'guest',
      returning: false,
    });
    const input = {
      role: 'mother',
      gender: 'female',
      timeZone: 'Europe/Minsk',
    };
    expect((await request('/me/onboarding', u.telegramId, 'POST', input)).status).toBe(200);
    expect((await request('/me/onboarding', u.telegramId, 'POST', input)).status).toBe(409);
  });
  it.each([
    {
      role: 'father',
      admin: true,
    }, { role: [] }, { timeZone: 'Mars/Unknown' },
    {
      quietHours: {
        start: -1,
        end: 480,
      },
    }, {
      quietHours: {
        start: 1,
        end: 800,
      },
    },
    {
      quietHours: {
        start: '0',
        end: 480,
      },
    }, {
      quietHours: {
        start: 0,
        end: 480,
        extra: true,
      },
    },
  ])('settings rejects invalid input %j', async (body) => {
    const u = await user(h.db);
    const r = await request('/me', u.telegramId, 'PATCH', body);
    expect(r.status).toBe(400);
    expect(await r.json()).toMatchObject({
      type: 'urn:angry-dad:problem:validation_failed',
      status: 400,
    });
  });
  it('opening records first/day activity; polling and owner reads do not', async () => {
    const u = await user(h.db);
    const before = new Date();
    expect((await request('/me', u.telegramId)).status).toBe(200);
    await eventually(async () => {
      expect(await h.db.model('UserStatistics').findOne({ userId: u._id }).lean()).toMatchObject({ firstStartedAt: expect.any(Date) });
    });
    const first = await h.db.model('UserStatistics').findOne({ userId: u._id }).lean();
    expect(first!.firstStartedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect((await request('/me', u.telegramId)).status).toBe(200);
    const polling = await user(h.db);
    expect((await request('/tasks', polling.telegramId)).status).toBe(200);
    expect(await h.db.model('UserStatistics').exists({ userId: polling._id })).toBeNull();
    const owner = await h.db.model('User').findOne({ telegramId: 999999999 }).lean() ?? await user(h.db, { telegramId: 999999999 });
    const ownerDate = (await h.db.model('User').findById(owner._id).lean())!.lastActivityAt;
    expect((await request('/owner/packages', owner.telegramId)).status).toBe(200);
    expect((await h.db.model('User').findById(owner._id).lean())!.lastActivityAt).toEqual(ownerDate);
    expect((await h.db.model('UserStatistics').findOne({ userId: u._id }).lean())!.firstStartedAt).toEqual(first!.firstStartedAt);
  });
  it('each POST tasks creates a distinct task; whitelist and ownership hold', async () => {
    const u = await user(h.db), other = await user(h.db);
    const body = {
      title: 'Написать три страницы',
      kind: 'one_time',
      deadline: new Date(Date.now() + 3600000).toISOString(),
    };
    const first = await request('/tasks', u.telegramId, 'POST', body);
    expect(first.status).toBe(201);
    const a = await first.json() as { task: { id: string };
      reply: string; };
    const second = await request('/tasks', u.telegramId, 'POST', body);
    expect(second.status).toBe(201);
    const b = await second.json() as typeof a;
    expect(a.task.id).not.toBe(b.task.id);
    expect(first.headers.get('location')).toContain(a.task.id);
    expect((await request(`/tasks/${a.task.id}`, other.telegramId)).status).toBe(404);
    expect((await request('/tasks', u.telegramId, 'POST', {
      ...body,
      size: 'large',
    })).status).toBe(400);
    expect((await request('/tasks?limit=0', u.telegramId)).status).toBe(400);
    expect((await request('/tasks?limit=101', u.telegramId)).status).toBe(400);
    await eventually(async () => {
      expect(await h.db.model('AnalyticsEvent').countDocuments({
        userId: u._id,
        type: 'task_created',
      })).toBe(2);
    });
  });
  it('invoice and battle repeats expose 201/200/409 with stable bodies', async () => {
    const u = await user(h.db), key = uid();
    const a = await request('/packages/package-1/invoices', u.telegramId, 'POST', undefined, key);
    expect(a.status).toBe(201);
    expect(a.headers.get('location')).toBe('/api/packages/package-1');
    const b = await request('/packages/package-1/invoices', u.telegramId, 'POST', undefined, key);
    expect(b.status).toBe(200);
    expect(await b.json()).toEqual(await a.json());
    expect((await request('/packages/package-3/invoices', u.telegramId, 'POST', undefined, key)).status).toBe(409);
    expect((await request('/battle/mother', u.telegramId)).status).toBe(409);
    expect((await request('/battle/father/messages', u.telegramId, 'POST', { text: 'Мой аргумент' })).status).toBe(400);
    await h.app.get(StrikesService).manual(u._id, 'manual_grant', 2, 'Synthetic', uid());
    const turnKey = uid();
    const turn = await request('/battle/father/messages', u.telegramId, 'POST', { text: 'Мой аргумент' }, turnKey);
    expect(turn.status).toBe(201);
    const repeat = await request('/battle/father/messages', u.telegramId, 'POST', { text: 'Мой аргумент' }, turnKey);
    expect(repeat.status).toBe(200);
    expect(await repeat.json()).toEqual(await turn.json());
    expect((await request('/battle/father/messages', u.telegramId, 'POST', { text: 'Другой аргумент' }, turnKey)).status).toBe(409);
  });
  it('DELETE me erases personal data and next opening marks returning guest', async () => {
    const u = await user(h.db);
    await taskPeriod(h.db, u);
    const r = await request('/me', u.telegramId, 'DELETE');
    expect(r.status).toBe(204);
    expect(await r.text()).toBe('');
    expect(await h.db.model('User').exists({ _id: u._id })).toBeNull();
    expect(await h.db.model('UserActivityDay').exists({ userId: u._id })).toBeNull();
    const returned = await request('/me', u.telegramId);
    expect(await returned.json()).toMatchObject({
      onboarding: 'guest',
      returning: true,
    });
  });
});
