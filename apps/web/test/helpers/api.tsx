import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import type { Me, Period, Problem, Schema, Task } from '../../src/api/contract';
import { telegram } from '../../src/platform/telegram';
import { clearTaskSubmission } from '../../src/tasks/taskSubmissionRecovery';

// Frozen docs/openapi.yaml schemas; no product demo fixtures or backend needed.
export const at = '2026-10-24T09:00:00Z';
export const me: Me = { id: 'u_test', isOwner: false, onboarding: 'done', role: 'father', gender: 'male', timeZone: 'Europe/Minsk', quietHours: { start: 1380, end: 480 }, respect: 12, inLeaderboard: true, closedCount: 0 };
export const period: Period = { id: 'p_test', startsAt: at, moodFrom: at, deadline: '2027-01-01T19:00:00Z', status: 'active', retryUsed: false };
export const task: Task = { id: 't_test', title: 'Написать отчёт по продажам', kind: 'one_time', size: 'medium', status: 'active', createdAt: at, currentPeriod: period };
export const closed: Task = { ...task, status: 'closed', currentPeriod: { ...period, status: 'done', closedAt: at, closedBy: 'done_button', respectDelta: 3 } };
export const completed: Schema<'PeriodActionResponse'> = { task: closed, respect: 15, respectDelta: 3, reply: 'Ну наконец-то.' };
export const check: Schema<'FeedMessageResponse'> = { id: 'f_test', category: 'on_check_in', text: 'Что уже сделал?', sentAt: at, periodId: period.id, rateable: true, checkIn: {} };
export const dialog: Schema<'BattleDialogResponse'> = { role: 'father', defeat: 0, defeatAt: at, mode: 'aggression', turnInProgress: false };
export const reply: Schema<'BattleMessageResponse'> = { seq: 3, author: 'character', text: 'Не тебе меня учить.', origin: 'turn' };
export const turn: Schema<'TurnResponse'> = { damage: 21, defeatBefore: 0, defeatAfter: 21, mode: 'aggression', respect: 13, respectDelta: 1, strikesBalance: 2, messages: [{ seq: 2, author: 'player', text: 'Ты сам ничего не доделал.', origin: 'turn' }, reply] };
export const base = 'http://angry-dad.test/api';
export const problem = (status: number, type: Problem['type'], reply?: string) => HttpResponse.json({ status, type, title: 'Request rejected', ...(reply ? { reply } : {}) } satisfies Problem, { status });
export const server = setupServer(
  http.get(`${base}/me`, () => HttpResponse.json(me)),
  http.get(`${base}/tasks`, () => HttpResponse.json({ items: [], nextCursor: null } satisfies Schema<'TaskListResponse'>)),
  http.get(`${base}/tasks/:id`, () => HttpResponse.json(task)),
  http.get(`${base}/feed`, () => HttpResponse.json({ items: [], nextCursor: null } satisfies Schema<'FeedListResponse'>)),
  http.get(`${base}/battle/father`, () => HttpResponse.json(dialog)),
  http.get(`${base}/battle/father/messages`, () => HttpResponse.json({ items: [], nextCursor: null } satisfies Schema<'BattleMessageListResponse'>)),
  http.get(`${base}/me/strikes`, () => HttpResponse.json({ balance: 3, lots: [] } satisfies Schema<'StrikeBalanceResponse'>)),
);

export function installTelegram() {
  const events = new Map<string, Set<() => void>>();
  const back = new Set<() => void>();
  const app: NonNullable<ReturnType<typeof telegram>> = {
    initData: 'test-init-data', colorScheme: 'light', ready: vi.fn(), expand: vi.fn(),
    onEvent: (name, fn) => {
      const handlers = events.get(name) ?? new Set();
      handlers.add(fn);
      events.set(name, handlers);
    },
    offEvent: (name, fn) => {
      events.get(name)?.delete(fn);
    },
    BackButton: {
      show: vi.fn(), hide: vi.fn(),
      onClick: (fn) => {
        back.add(fn);
      },
      offClick: (fn) => {
        back.delete(fn);
      },
    },
    isVersionAtLeast: () => true, openInvoice: vi.fn(), openTelegramLink: vi.fn(),
  };
  Object.defineProperty(window, 'Telegram', { value: { WebApp: app }, configurable: true });
  return { app, activate: () => events.get('activated')?.forEach(fn => fn()), back: () => back.forEach(fn => fn()) };
}

const clients: QueryClient[] = [];
export function renderApi(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  clients.push(client);
  return { ...render(<QueryClientProvider client={client}>{node}</QueryClientProvider>), client };
}

export function apiLifecycle() {
  beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
  beforeEach(() => {
    installTelegram();
    clearTaskSubmission(me.id);
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => {
    clients.splice(0).forEach(client => client.clear());
    server.resetHandlers();
    clearTaskSubmission(me.id);
    Object.defineProperty(window, 'Telegram', { value: undefined, configurable: true });
  });
  afterAll(() => server.close());
}
