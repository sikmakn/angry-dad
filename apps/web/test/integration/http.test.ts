import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, errorText, request } from '../../src/api/client';
import { apiLifecycle, base, installTelegram, me, problem, server, task } from '../helpers/api';

apiLifecycle();
describe('typed HTTP transport with MSW', () => {
  it('sends Telegram auth, query, encoded path, JSON and idempotency key', async () => {
    server.use(http.post(`${base}/battle/father/messages`, async ({ request: incoming }) => {
      expect(incoming.headers.get('authorization')).toBe('tma test-init-data');
      expect(incoming.headers.get('idempotency-key')).toBe('attempt-1');
      expect(incoming.headers.get('content-type')).toBe('application/json');
      expect(await incoming.json()).toEqual({ text: 'По делу' });
      return problem(409, 'urn:angry-dad:problem:turn_in_progress');
    }));
    await expect(request('createBattleMessage', { path: { role: 'father' }, body: { text: 'По делу' }, key: 'attempt-1' })).rejects.toMatchObject({ status: 409 });
    server.use(http.get(`${base}/tasks/:id`, ({ request: incoming }) => {
      expect(new URL(incoming.url).pathname).toBe('/api/tasks/a%2Fb');
      return HttpResponse.json(task);
    }));
    expect(await request('getTask', { path: { taskId: 'a/b' } })).toEqual(task);
    server.use(http.get(`${base}/tasks`, ({ request: incoming }) => {
      expect(new URL(incoming.url).searchParams.get('status')).toBe('closed');
      expect(new URL(incoming.url).searchParams.has('cursor')).toBe(false);
      return HttpResponse.json({ items: [], nextCursor: null });
    }));
    await request('listTasks', { query: { status: 'closed', cursor: undefined } });
  });

  it('rejects missing credentials without making a network request', async () => {
    installTelegram().app.initData = '';
    const called = vi.fn();
    server.use(http.get(`${base}/me`, () => {
      called();
      return HttpResponse.json(me);
    }));
    await expect(request('getMe')).rejects.toBeInstanceOf(ApiError);
    expect(called).not.toHaveBeenCalled();
  });

  it.each([401, 403, 409, 429, 503])('preserves server problem and does not retry HTTP %i', async (status) => {
    let calls = 0;
    server.use(http.post(`${base}/tasks`, () => {
      calls++;
      return problem(status, 'urn:angry-dad:problem:ai_unavailable', 'Попробуй позже');
    }));
    const failure = await request('createTask', { body: { title: task.title, kind: 'recurring', recurrence: { type: 'daily' } } }).catch((error: unknown) => error);
    expect(failure).toMatchObject({ status, problem: { reply: 'Попробуй позже' } });
    expect(errorText(failure)).toBe('Попробуй позже');
    expect(calls).toBe(1);
  });

  it('propagates abort and never retries a network failure', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(request('getMe', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    let calls = 0;
    server.use(http.post(`${base}/tasks`, () => {
      calls++;
      return HttpResponse.error();
    }));
    await expect(request('createTask', { body: { title: task.title, kind: 'recurring', recurrence: { type: 'daily' } } })).rejects.toThrow();
    expect(calls).toBe(1);
  });

  it('handles malformed error bodies and empty 204 without JSON parsing', async () => {
    server.use(http.get(`${base}/me`, () => new HttpResponse('offline', { status: 502 })));
    await expect(request('getMe')).rejects.toMatchObject({ status: 502, problem: undefined });
    server.use(http.delete(`${base}/me`, () => new HttpResponse(null, { status: 204 })));
    await expect(request('deleteMe')).resolves.toBeUndefined();
  });

  it('aborts a request already received by the server', async () => {
    let entered!: () => void;
    let release!: () => void;
    const received = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const response = new Promise<void>((resolve) => {
      release = resolve;
    });
    let calls = 0;
    server.use(http.get(`${base}/me`, async () => {
      calls++;
      entered();
      await response;
      return HttpResponse.json(me);
    }));
    const controller = new AbortController();
    const result = request('getMe', { signal: controller.signal });
    await received;
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
    release();
    expect(calls).toBe(1);
  });
});
