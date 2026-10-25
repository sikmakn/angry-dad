import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { SettingsScreen } from '../../src/settings/SettingsScreen';
import { StartScreen } from '../../src/start/StartScreen';
import type { Schema } from '../../src/api/contract';
import { apiLifecycle, base, installTelegram, me, problem, renderApi, server } from '../helpers/api';

apiLifecycle();
describe('onboarding and session', () => {
  it('guards onboarding choices, preserves selection on failure and follows server replies', async () => {
    let calls = 0;
    const finished = vi.fn();
    server.use(http.post(`${base}/me/onboarding`, async ({ request }) => {
      calls++;
      expect(await request.json()).toEqual({ role: 'mother', gender: 'female', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, quietHours: { start: 1320, end: 540 } });
      return calls === 1
        ? problem(503, 'urn:angry-dad:problem:ai_unavailable', 'Попробуй позже')
        : HttpResponse.json({ user: { ...me, role: 'mother', gender: 'female' }, replies: ['Соболезнуем Вам. Крепитесь…', 'Опять ничего сама не можешь?', 'Мечты сюда не пиши.'] } satisfies Schema<'OnboardingResponse'>);
    }));
    renderApi(<StartScreen me={{ ...me, onboarding: 'guest' }} finished={finished} />);
    const user = userEvent.setup();
    expect(screen.getByRole('button', { name: 'Дальше' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: /Мать/ }));
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    expect(screen.getByRole('button', { name: 'Дальше' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Женский' }));
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    await screen.findByText('Попробуй позже');
    expect(screen.getByRole('radio', { name: 'Женский' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    await screen.findByRole('heading', { name: 'Соболезнуем Вам. Крепитесь…' });
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    expect(screen.getByText('Опять ничего сама не можешь?')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Назвать задачу' }));
    expect(finished).toHaveBeenCalledOnce();
  });

  it('refreshes respect, preserves same-session drafts and clears old account data on Telegram activation', async () => {
    const telegram = installTelegram();
    let profile = me;
    server.use(http.get(`${base}/me`, () => HttpResponse.json(profile)));
    render(<App />);
    expect(await screen.findByRole('meter', { name: 'Уважение' })).toHaveAttribute('aria-valuenow', '12');
    profile = { ...me, respect: 18 };
    await waitFor(() => expect(screen.getByRole('meter', { name: 'Уважение' })).toHaveAttribute('aria-valuenow', '18'), { timeout: 5000 });
    const user = userEvent.setup();
    await user.click(screen.getByRole('link', { name: 'Новая задача' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Новая задача' })).toHaveFocus());
    const title = await screen.findByLabelText('Что нужно сделать');
    await user.type(title, 'Подготовить черновик отчёта');
    expect(title).toHaveValue('Подготовить черновик отчёта');
    profile = { ...profile, timeZone: 'Pacific/Auckland' };
    act(() => telegram.activate());
    await screen.findByText(/^Сохранён Pacific\/Auckland,/);
    expect(screen.getByLabelText('Что нужно сделать')).toBe(title);
    expect(title).toHaveValue('Подготовить черновик отчёта');
    profile = { ...me, id: 'u_second', onboarding: 'guest' };
    telegram.app.initData = 'second-session-init-data';
    act(() => telegram.activate());
    await screen.findByRole('heading', { name: 'Выберите Вашего вредного родителя' });
    expect(screen.queryByRole('meter', { name: 'Уважение' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Что нужно сделать')).not.toBeInTheDocument();
  });
});

describe('settings and deletion', () => {
  it('preserves settings draft on server error', async () => {
    server.use(http.patch(`${base}/me`, () => problem(503, 'urn:angry-dad:problem:ai_unavailable', 'Попробуй позже')));
    renderApi(<SettingsScreen me={me} deleted={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Мать' }));
    await user.click(screen.getByRole('radio', { name: 'Женский' }));
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    await screen.findByText('Попробуй позже');
    expect(screen.getByRole('radio', { name: 'Мать' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Женский' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeEnabled();
  });

  it('requires two confirmations and known balance before deleting, then clears private cache', async () => {
    const deleted = vi.fn();
    let calls = 0;
    server.use(http.delete(`${base}/me`, () => {
      calls++;
      return new HttpResponse(null, { status: 204 });
    }));
    const view = renderApi(<SettingsScreen me={me} deleted={deleted} />);
    view.client.setQueryData([me.id, 'private'], { title: 'private task' });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Удалить аккаунт' }));
    let sheet = await screen.findByRole('dialog', { name: 'Удалить аккаунт?' });
    expect(calls).toBe(0);
    await user.click(within(sheet).getByRole('button', { name: 'Продолжить удаление' }));
    sheet = screen.getByRole('dialog', { name: 'Это насовсем' });
    expect(await within(sheet).findByText('Оставшиеся попытки (3) сгорят без возврата Stars.')).toBeVisible();
    expect(calls).toBe(0);
    await user.click(within(sheet).getByRole('button', { name: 'Удалить окончательно' }));
    await waitFor(() => expect(deleted).toHaveBeenCalledOnce());
    expect(calls).toBe(1);
    expect(view.client.getQueryData([me.id, 'private'])).toBeUndefined();
  });
});
