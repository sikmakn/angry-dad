import { useState } from 'react';
import { BattleScreen } from '../../src/battle/BattleScreen';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { HomeScreen } from '../../src/tasks/HomeScreen';
import { TaskNewScreen } from '../../src/tasks/TaskNewScreen';
import { TaskScreen } from '../../src/tasks/TaskScreen';
import { NotificationScreen } from '../../src/history/NotificationScreen';
import { useRead } from '../../src/hooks/useApi';
import type { Schema, Task } from '../../src/api/contract';
import { apiLifecycle, base, check, closed, completed, me, problem, renderApi, server, task } from '../helpers/api';

apiLifecycle();
const newTask = () => renderApi(<TaskNewScreen me={me} go={vi.fn()} />);
const detail = () => renderApi(<TaskScreen id={task.id} me={me} go={vi.fn()} share={vi.fn()} />);
const notification = () => renderApi(<NotificationScreen id={check.id} me={me} go={vi.fn()} />);
async function fillRecurring() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Что нужно сделать'), 'повторять английский каждый день');
  return user;
}

describe('task creation through real client', () => {
  it('suggests recurrence, waits for confirmation, locks double submission and shows server onTaskSet', async () => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const bodies: unknown[] = [];
    server.use(http.post(`${base}/tasks`, async ({ request }) => {
      bodies.push(await request.json());
      await pending;
      return HttpResponse.json({ task: { ...task, kind: 'recurring', recurrence: { type: 'daily' } }, reply: 'Записал. Посмотрим.' } satisfies Schema<'TaskActionResponse'>, { status: 201 });
    }));
    newTask();
    expect(screen.getByRole('button', { name: 'Поставить' })).toBeDisabled();
    const user = await fillRecurring();
    expect(screen.getByRole('radio', { name: 'Повторять' })).toBeChecked();
    expect(screen.getByLabelText('Как часто')).toHaveValue('daily');
    expect(bodies).toHaveLength(0);
    fireEvent.change(screen.getByLabelText('Примерно во сколько (необязательно)'), { target: { value: '20:00' } });
    await user.dblClick(screen.getByRole('button', { name: 'Поставить' }));
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Батя читает…' })).toBeDisabled();
    expect(bodies[0]).toEqual({ title: 'повторять английский каждый день', kind: 'recurring', recurrence: { type: 'daily' }, anchorTime: '20:00' });
    finish();
    expect(await screen.findByRole('heading', { name: 'Новая задача поставлена' })).toBeVisible();
    expect(screen.getByText('Записал. Посмотрим.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'К задачам' })).toBeEnabled();
    expect(bodies).toHaveLength(1);
  });

  it('lets today and tomorrow use a manually chosen time and preserves it when changing days', async () => {
    let body: Schema<'CreateTaskRequest'> | undefined;
    server.use(http.post(`${base}/tasks`, async ({ request }) => {
      body = await request.json() as Schema<'CreateTaskRequest'>;
      return HttpResponse.json({ task, reply: 'Записал.' });
    }));
    newTask();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Что нужно сделать'), 'подготовить отчёт');
    fireEvent.change(screen.getByLabelText('Время'), { target: { value: '18:35' } });
    expect(screen.getByRole('button', { name: /^Сегодня/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /^Завтра/ }));
    expect(screen.getByLabelText('Время')).toHaveValue('18:35');
    expect(screen.getByRole('button', { name: /^Завтра/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Поставить' }));
    await screen.findByRole('heading', { name: 'Новая задача поставлена' });
    expect(body?.deadline).toMatch(/T15:35:00/);
  });

  it('preserves title and schedule after a known AI rejection and allows explicit retry', async () => {
    let calls = 0;
    server.use(http.post(`${base}/tasks`, () => {
      calls++;
      return problem(503, 'urn:angry-dad:problem:ai_unavailable', 'Попробуй позже');
    }));
    newTask();
    const user = await fillRecurring();
    await user.click(screen.getByRole('button', { name: 'Поставить' }));
    expect(await screen.findByText('Попробуй позже')).toBeVisible();
    expect(screen.getByLabelText('Что нужно сделать')).toHaveValue('повторять английский каждый день');
    expect(screen.getByLabelText('Как часто')).toHaveValue('daily');
    await user.click(screen.getByRole('button', { name: 'Поставить' }));
    await waitFor(() => expect(calls).toBe(2));
  });

  it('keeps an unknown POST blocked across remount until list review and explicit acknowledgement', async () => {
    let calls = 0;
    server.use(http.post(`${base}/tasks`, () => {
      calls++;
      return HttpResponse.error();
    }));
    const first = newTask();
    const user = await fillRecurring();
    await user.click(screen.getByRole('button', { name: 'Поставить' }));
    await screen.findByRole('heading', { name: 'Результат неизвестен' });
    expect(screen.getByRole('button', { name: 'Поставить' })).toBeDisabled();
    first.unmount();
    newTask();
    expect(screen.getByRole('heading', { name: 'Результат неизвестен' })).toBeVisible();
    expect(screen.getByLabelText('Что нужно сделать')).toHaveValue('повторять английский каждый день');
    expect(screen.getByRole('button', { name: 'Поставить' })).toBeDisabled();
    server.use(http.get(`${base}/tasks`, () => HttpResponse.json({ items: [task], nextCursor: null })));
    await user.click(screen.getByRole('button', { name: 'Обновить список задач' }));
    await screen.findByRole('link', { name: task.title });
    expect(screen.getByRole('button', { name: 'Вернуться к форме без отправки' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: /Я проверил список/ }));
    await user.click(screen.getByRole('button', { name: 'Вернуться к форме без отправки' }));
    expect(screen.getByRole('button', { name: 'Поставить' })).toBeEnabled();
    expect(calls).toBe(1);
  });

  it('allows removing the inferred schedule and honours a manually chosen schedule', async () => {
    newTask();
    const user = await fillRecurring();
    await user.click(screen.getByRole('button', { name: 'Убрать' }));
    expect(screen.getByRole('radio', { name: 'До срока' })).toBeChecked();
    await user.clear(screen.getByLabelText('Что нужно сделать'));
    await user.type(screen.getByLabelText('Что нужно сделать'), 'позвонить маме вечером каждый день');
    expect(screen.getByRole('radio', { name: 'До срока' })).toBeChecked();
  });

  it.each(['1', '31'])('R-22 disables submission and explains an invalid every-N value: %s', async (value) => {
    newTask();
    const user = await fillRecurring();
    await user.selectOptions(screen.getByLabelText('Как часто'), 'every_n_days');
    await user.type(screen.getByLabelText('Сколько дней в периоде'), value);
    expect.soft(screen.getByRole('button', { name: 'Поставить' })).toBeDisabled();
    expect.soft(screen.queryByText('От 2 до 30 дней')).toBeVisible();
  });
});

describe('task list and critical period actions', () => {
  it('refreshes the session profile after completion without a manual refresh', async () => {
    let done = false;
    server.use(
      http.get(`${base}/me`, () => HttpResponse.json({ ...me, respect: done ? 15 : 12 })),
      http.get(`${base}/tasks/:id`, () => HttpResponse.json(done ? closed : task)),
      http.post(`${base}/periods/:id/completion`, () => {
        done = true;
        return HttpResponse.json(completed);
      }),
    );
    function ProfileAndTask() {
      const profile = useRead('session', 'getMe');
      return (
        <>
          <output aria-label="Уважение профиля">{profile.data?.respect}</output>
          <TaskScreen id={task.id} me={profile.data ?? me} go={vi.fn()} share={vi.fn()} />
        </>
      );
    }
    renderApi(<ProfileAndTask />);
    await waitFor(() => expect(screen.getByLabelText('Уважение профиля')).toHaveTextContent('12'));
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Готово' }));
    await waitFor(() => expect(screen.getByLabelText('Уважение профиля')).toHaveTextContent('15'));
  });

  it('offers closed and stopped tasks from home, including pagination', async () => {
    const stopped: Task = { ...closed, id: 't_stopped', title: 'Остановленная задача', kind: 'recurring', recurrence: { type: 'daily' }, status: 'stopped' };
    server.use(http.get(`${base}/tasks`, ({ request }) => {
      const query = new URL(request.url).searchParams;
      const status = query.get('status');
      return HttpResponse.json({ items: status === 'closed' ? query.has('cursor') ? [{ ...closed, id: 't_older', title: 'Старая закрытая задача' }] : [closed] : status === 'stopped' ? [stopped] : [], nextCursor: status === 'closed' && !query.has('cursor') ? 'older' : null });
    }));
    renderApi(<HomeScreen me={me} />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Завершённые, проваленные и остановленные'));
    expect(await screen.findByRole('link', { name: new RegExp(task.title) })).toHaveAttribute('href', `#task/${task.id}`);
    expect(await screen.findByRole('link', { name: /Остановленная задача/ })).toHaveAttribute('href', '#task/t_stopped');
    const more = await screen.findByRole('button', { name: 'Ещё завершённые и проваленные' });
    await user.click(more);
    expect(await screen.findByRole('link', { name: /Старая закрытая задача/ })).toHaveAttribute('href', '#task/t_older');
  });

  it('keeps successful completion closed when the next GET fails', async () => {
    let done = false;
    let readsAfter = 0;
    server.use(
      http.get(`${base}/tasks/:id`, () => {
        if (done) {
          readsAfter++;
          return new HttpResponse(null, { status: 503 });
        }
        return HttpResponse.json(task);
      }),
      http.post(`${base}/periods/:id/completion`, () => {
        done = true;
        return HttpResponse.json(completed);
      }),
    );
    const view = detail();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Готово' }));
    expect(await screen.findByText('Выполнено')).toBeVisible();
    await waitFor(() => expect(readsAfter).toBe(1));
    expect(screen.queryByRole('button', { name: 'Готово' })).not.toBeInTheDocument();
    expect(screen.getByText('Ну наконец-то.')).toBeVisible();
    expect(view.client.getQueryData([me.id, 'getTask', { taskId: task.id }, undefined])).toEqual(closed);
  });

  it('opens a check-in separately from task actions', async () => {
    server.use(http.get(`${base}/feed`, () => HttpResponse.json({ items: [check], nextCursor: null })));
    detail();
    expect(await screen.findByRole('link', { name: 'Открыть проверку' })).toHaveAttribute('href', `#notification/${check.id}`);
    expect(screen.queryByRole('button', { name: 'Сделано' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Готово' })).toBeEnabled();
  });

  it.each([[-1, 'Просрочено: −1 к уважению'], [0, 'Просрочено']] as const)('shows the actual expired notification penalty %s', async (respectDelta, label) => {
    const missed = { ...check, readAt: check.sentAt, checkIn: { missedAt: check.sentAt, respectDelta, groupRespectDelta: respectDelta < 0 ? respectDelta : undefined, expired: true } };
    server.use(http.get(`${base}/feed`, () => HttpResponse.json({ items: [missed], nextCursor: null })));
    notification();
    expect(await screen.findByText(label)).toBeVisible();
    expect(screen.getByText('Не было ответа в течение 15 минут.')).toBeVisible();
  });

  it('quotes a check-in as the parent in battle before navigating there', async () => {
    let quoted = false;
    server.use(
      http.get(`${base}/feed`, () => HttpResponse.json({ items: [check], nextCursor: null })),
      http.post(`${base}/battle/father/quotes`, async ({ request }) => {
        expect(await request.json()).toEqual({ feedMessageId: check.id });
        quoted = true;
        return HttpResponse.json({ seq: 1, author: 'character', text: check.text, origin: 'reply_to_feed', feedMessageId: check.id });
      }),
      http.get(`${base}/battle/father/messages`, () => HttpResponse.json({ items: quoted ? [{ seq: 1, author: 'character', text: check.text, origin: 'reply_to_feed' }] : [], nextCursor: null })),
    );
    function Flow() {
      const [route, go] = useState('notification');
      return route === 'battle' ? <BattleScreen me={me} share={vi.fn()} /> : <NotificationScreen id={check.id} me={me} go={go} />;
    }
    renderApi(<Flow />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Ответить! 😠' }));
    expect(await screen.findByRole('heading', { name: 'Батя' })).toBeVisible();
    expect(await screen.findByText(check.text)).toBeVisible();
    expect(quoted).toBe(true);
  });

  it('answers a check-in as done through its own page and removes answered controls', async () => {
    let answered = false;
    server.use(
      http.get(`${base}/feed`, () => HttpResponse.json({ items: [check], nextCursor: null })),
      http.get(`${base}/tasks/:id`, () => HttpResponse.json(answered ? closed : task)),
      http.put(`${base}/feed/:id/check-in-answer`, async ({ request }) => {
        expect(await request.json()).toEqual({ answer: 'done' });
        answered = true;
        return HttpResponse.json(completed);
      }),
    );
    notification();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Сделано' }));
    await screen.findByText('Твой ответ: Сделано');
    expect(answered).toBe(true);
    expect(screen.queryByRole('button', { name: 'Сделано' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Делаю' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Не начинал' })).not.toBeInTheDocument();
  });

  it.each([['Делаю', 'partial'], ['Не начинал', 'not_started']] as const)('sends %s without closing the period or restoring the silence penalty', async (label, answer) => {
    let answered = false;
    const missed = { ...check, checkIn: { missedAt: check.sentAt } };
    server.use(
      http.put(`${base}/feed/:id/read`, () => HttpResponse.json({ ...missed, readAt: new Date().toISOString() })),
      http.get(`${base}/feed`, () => HttpResponse.json({ items: answered ? [{ ...missed, checkIn: { ...missed.checkIn, answer } }] : [missed], nextCursor: null })),
      http.put(`${base}/feed/:id/check-in-answer`, async ({ request }) => {
        expect(await request.json()).toEqual({ answer });
        answered = true;
        return HttpResponse.json({ task, respect: 11, respectDelta: 0, reply: 'Продолжай работать.' } satisfies Schema<'PeriodActionResponse'>);
      }),
    );
    notification();
    const user = userEvent.setup();
    expect(await screen.findByText('Срок уже вышел. Ответить ещё можно.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: label }));
    expect(await screen.findByText('Продолжай работать.')).toBeVisible();
    expect(screen.queryByText('Выполнено')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Готово' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
  });
});
