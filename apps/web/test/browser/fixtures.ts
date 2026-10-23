import { test as base, expect } from '@playwright/test';
import type { Me, Schema, Task } from '../../src/api/contract';

// Independent wire fixtures from docs/openapi.yaml; never import product MSW or Vitest setup.
const at = new Date().toISOString();
export const task: Task = {
  id: 't_browser', title: 'Написать отчёт по продажам', kind: 'one_time', size: 'medium',
  status: 'active', createdAt: at,
  currentPeriod: {
    id: 'p_browser', startsAt: at, moodFrom: at,
    deadline: new Date(Date.now() + 86400000).toISOString(), status: 'active', retryUsed: false,
  },
};
export const closed: Task = {
  ...task, status: 'closed',
  currentPeriod: { ...task.currentPeriod!, status: 'done', closedAt: at, closedBy: 'done_button', respectDelta: 3 },
};

interface TelegramDouble {
  activate: () => void;
  back: () => void;
  update: (theme: 'light' | 'dark', bottom: number) => void;
}
declare global {
  interface Window {
    browserTelegram: TelegramDouble;
  }
}

interface World {
  me: Me;
  tasks: Task[];
  loseCreateResponse: boolean;
  creates: Schema<'CreateTaskRequest'>[];
  onboarding: Schema<'OnboardingRequest'>[];
  completions: number;
}

export const test = base.extend<{ world: World }>({
  world: async ({ page }, provide) => {
    const world: World = {
      me: { id: 'u_browser', isOwner: false, onboarding: 'done', role: 'father', gender: 'male', timeZone: 'Europe/Minsk', quietHours: { start: 1380, end: 480 }, respect: 12, inLeaderboard: true, closedCount: 0 },
      tasks: [], loseCreateResponse: false, creates: [], onboarding: [], completions: 0,
    };
    const unexpected: string[] = [];
    page.on('pageerror', error => unexpected.push(error.message));
    await page.addInitScript(() => {
      const events = new Map<string, Set<() => void>>();
      const back = new Set<() => void>();
      const app = {
        initData: 'browser-test-init-data', colorScheme: 'dark',
        safeAreaInset: { top: 20, bottom: 24, left: 4, right: 4 },
        contentSafeAreaInset: { top: 8, bottom: 10, left: 2, right: 2 },
        ready: () => {}, expand: () => {}, isVersionAtLeast: () => true,
        onEvent: (name: string, fn: () => void) => {
          const handlers = events.get(name) ?? new Set();
          handlers.add(fn);
          events.set(name, handlers);
        },
        offEvent: (name: string, fn: () => void) => {
          events.get(name)?.delete(fn);
        },
        BackButton: {
          show: () => {}, hide: () => {},
          onClick: (fn: () => void) => {
            back.add(fn);
          },
          offClick: (fn: () => void) => {
            back.delete(fn);
          },
        },
        openInvoice: () => {
          throw new Error('Unexpected invoice');
        },
        openTelegramLink: () => {
          throw new Error('Unexpected external Telegram link');
        },
      };
      Object.defineProperty(window, 'Telegram', { value: { WebApp: app } });
      window.browserTelegram = {
        activate: () => events.get('activated')?.forEach(fn => fn()),
        back: () => back.forEach(fn => fn()),
        update: (theme, bottom) => {
          app.colorScheme = theme;
          app.safeAreaInset.bottom = bottom;
          events.get('themeChanged')?.forEach(fn => fn());
          events.get('safeAreaChanged')?.forEach(fn => fn());
          events.get('contentSafeAreaChanged')?.forEach(fn => fn());
        },
      };
    });
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === 'https://telegram.org' && url.pathname === '/js/telegram-web-app.js') {
        await route.fulfill({ contentType: 'application/javascript', body: '/* SDK replaced before document load */' });
        return;
      }
      if (url.origin !== 'http://127.0.0.1:4179') {
        unexpected.push(request.url());
        await route.abort('blockedbyclient');
        return;
      }
      if (!url.pathname.startsWith('/api/')) {
        await route.continue();
        return;
      }
      expect(request.headers().authorization).toBe('tma browser-test-init-data');
      const key = `${request.method()} ${url.pathname}`;
      const json = async (body: unknown, status = 200) => route.fulfill({ status, json: body });
      if (key === 'GET /api/me') {
        await json(world.me);
      } else if (key === 'POST /api/me/onboarding') {
        const body = request.postDataJSON() as Schema<'OnboardingRequest'>;
        world.onboarding.push(body);
        world.me = { ...world.me, ...body, onboarding: 'done' };
        await json({ user: world.me, replies: ['Соболезнуем Вам. Крепитесь…', 'Опять ничего сам не можешь? Ну, что тебе надо сделать?', 'Мечты сюда не пиши. Витать в облаках — не работа. Что нужно сделать, чётко?'] } satisfies Schema<'OnboardingResponse'>);
      } else if (key === 'GET /api/tasks') {
        const status = url.searchParams.get('status');
        await json({ items: world.tasks.filter(item => !status || item.status === status), nextCursor: null } satisfies Schema<'TaskListResponse'>);
      } else if (key === 'POST /api/tasks') {
        const body = request.postDataJSON() as Schema<'CreateTaskRequest'>;
        world.creates.push(body);
        const created: Task = { ...task, title: body.title, kind: body.kind, ...(body.recurrence ? { recurrence: body.recurrence } : {}), currentPeriod: { ...task.currentPeriod!, deadline: body.deadline ?? task.currentPeriod!.deadline } };
        world.tasks.push(created);
        if (world.loseCreateResponse) {
          await route.abort('connectionreset');
        } else {
          await json({ task: created, reply: 'Записал. Посмотрим.' } satisfies Schema<'TaskActionResponse'>, 201);
        }
      } else if (request.method() === 'GET' && world.tasks.some(item => url.pathname === `/api/tasks/${item.id}`)) {
        await json(world.tasks.find(item => url.pathname === `/api/tasks/${item.id}`));
      } else if (key === 'GET /api/feed') {
        await json({ items: [], nextCursor: null } satisfies Schema<'FeedListResponse'>);
      } else if (key === `POST /api/periods/${task.currentPeriod!.id}/completion`) {
        world.completions++;
        world.tasks = world.tasks.map(item => item.id === task.id ? { ...closed, title: item.title } : item);
        world.me = { ...world.me, respect: 15, closedCount: 1 };
        await json({ task: world.tasks.find(item => item.id === task.id)!, respect: 15, respectDelta: 3, reply: 'Ну наконец-то.' } satisfies Schema<'PeriodActionResponse'>);
      } else {
        unexpected.push(key);
        await route.abort('blockedbyclient');
      }
    });
    await provide(world);
    expect(unexpected, 'No unconfigured API or external network calls').toEqual([]);
  },
});
export { expect } from '@playwright/test';
