import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../../src/settings/SettingsScreen';
import { StartScreen } from '../../src/start/StartScreen';
import type { Schema } from '../../src/api/contract';
import { apiLifecycle, base, me, renderApi, server } from '../helpers/api';

apiLifecycle();

const hint = 'Бот может написать в любое время, даже ночью. Утром после провала считаем 09:00.';
const field = (name: 'С' | 'до') => screen.getByLabelText(name) as HTMLInputElement;
const setTime = (name: 'С' | 'до', value: string) => fireEvent.change(field(name), { target: { value } });

async function reachStepTwo() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('radio', { name: /Отец/ }));
  await user.click(screen.getByRole('button', { name: 'Дальше' }));
  await user.click(screen.getByRole('radio', { name: 'Мужской' }));
  return user;
}

function captureOnboarding() {
  const bodies: unknown[] = [];
  server.use(http.post(`${base}/me/onboarding`, async ({ request }) => {
    bodies.push(await request.json());
    return HttpResponse.json({ user: me, replies: ['Соболезнуем Вам. Крепитесь…', 'Дальше', 'Конец'] } satisfies Schema<'OnboardingResponse'>);
  }));
  return bodies;
}

describe('quiet hours in onboarding step 2', () => {
  it('defaults to 22:00-09:00 and sends it', async () => {
    const bodies = captureOnboarding();
    renderApi(<StartScreen me={{ ...me, onboarding: 'guest' }} finished={vi.fn()} />);
    const user = await reachStepTwo();
    expect(field('С')).toHaveValue('22:00');
    expect(field('до')).toHaveValue('09:00');
    expect(screen.queryByText(hint)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    await screen.findByRole('heading', { name: 'Соболезнуем Вам. Крепитесь…' });
    expect(bodies).toEqual([expect.objectContaining({ role: 'father', gender: 'male', quietHours: { start: 1320, end: 540 } })]);
  });

  it('accepts an interval longer than 12 hours and sends exactly what was chosen', async () => {
    const bodies = captureOnboarding();
    renderApi(<StartScreen me={{ ...me, onboarding: 'guest' }} finished={vi.fn()} />);
    const user = await reachStepTwo();
    setTime('С', '08:00');
    setTime('до', '23:30');
    expect(screen.getByRole('button', { name: 'Дальше' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    await screen.findByRole('heading', { name: 'Соболезнуем Вам. Крепитесь…' });
    expect(bodies).toEqual([expect.objectContaining({ quietHours: { start: 480, end: 1410 } })]);
  });

  it('blocks Next while a time is empty and sends nothing until it is filled', async () => {
    const bodies = captureOnboarding();
    renderApi(<StartScreen me={{ ...me, onboarding: 'guest' }} finished={vi.fn()} />);
    const user = await reachStepTwo();
    for (const name of ['С', 'до'] as const) {
      setTime(name, '');
      expect(field(name)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('button', { name: 'Дальше' })).toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'Дальше' }));
      expect(bodies).toHaveLength(0);
      setTime(name, name === 'С' ? '22:00' : '09:00');
      expect(field(name)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByRole('button', { name: 'Дальше' })).toBeEnabled();
    }
  });

  it('"Без тихих часов" sets 00:00-00:00, shows the 09:00 hint and sends equal bounds', async () => {
    const bodies = captureOnboarding();
    renderApi(<StartScreen me={{ ...me, onboarding: 'guest' }} finished={vi.fn()} />);
    const user = await reachStepTwo();
    await user.click(screen.getByRole('button', { name: 'Без тихих часов' }));
    expect(field('С')).toHaveValue('00:00');
    expect(field('до')).toHaveValue('00:00');
    expect(screen.getByText(hint)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    await screen.findByRole('heading', { name: 'Соболезнуем Вам. Крепитесь…' });
    expect(bodies).toEqual([expect.objectContaining({ quietHours: { start: 0, end: 0 } })]);
  });

  it('shows the hint for any equal start and end, not only midnight', async () => {
    renderApi(<StartScreen me={{ ...me, onboarding: 'guest' }} finished={vi.fn()} />);
    await reachStepTwo();
    expect(screen.queryByText(hint)).not.toBeInTheDocument();
    setTime('до', '22:00');
    expect(screen.getByText(hint)).toBeVisible();
    setTime('С', '21:30');
    expect(screen.queryByText(hint)).not.toBeInTheDocument();
  });

  it('keeps the chosen quiet hours after a failed save and retry', async () => {
    const bodies: unknown[] = [];
    server.use(http.post(`${base}/me/onboarding`, async ({ request }) => {
      bodies.push(await request.json());
      return bodies.length === 1
        ? new HttpResponse(null, { status: 503 })
        : HttpResponse.json({ user: me, replies: ['Соболезнуем Вам. Крепитесь…', 'a', 'b'] } satisfies Schema<'OnboardingResponse'>);
    }));
    renderApi(<StartScreen me={{ ...me, onboarding: 'guest' }} finished={vi.fn()} />);
    const user = await reachStepTwo();
    setTime('С', '01:30');
    setTime('до', '05:00');
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    await screen.findByRole('alert');
    expect(field('С')).toHaveValue('01:30');
    expect(field('до')).toHaveValue('05:00');
    await user.click(screen.getByRole('button', { name: 'Дальше' }));
    await screen.findByRole('heading', { name: 'Соболезнуем Вам. Крепитесь…' });
    expect(bodies).toEqual([expect.objectContaining({ quietHours: { start: 90, end: 300 } }), expect.objectContaining({ quietHours: { start: 90, end: 300 } })]);
  });
});

describe('quiet hours in settings', () => {
  it('shows the saved interval (23:00-08:00) ', () => {
    renderApi(<SettingsScreen me={me} deleted={vi.fn()} />);
    expect(field('С')).toHaveValue('23:00');
    expect(field('до')).toHaveValue('08:00');
  });

  it('saves a long interval in minutes through PATCH /me', async () => {
    const bodies: unknown[] = [];
    server.use(http.patch(`${base}/me`, async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(me);
    }));
    renderApi(<SettingsScreen me={me} deleted={vi.fn()} />);
    const user = userEvent.setup();
    setTime('С', '07:00');
    setTime('до', '06:30');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    await screen.findByText('Сохранено. Новые фразы будут с этими настройками.');
    expect(bodies).toEqual([expect.objectContaining({ quietHours: { start: 420, end: 390 } })]);
  });

  it('blocks Save with an empty time and does not call the API', async () => {
    let calls = 0;
    server.use(http.patch(`${base}/me`, () => {
      calls++;
      return HttpResponse.json(me);
    }));
    renderApi(<SettingsScreen me={me} deleted={vi.fn()} />);
    const user = userEvent.setup();
    setTime('до', '');
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled();
    expect(field('до')).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    fireEvent.submit(field('до').closest('form')!);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(calls).toBe(0);
    setTime('до', '08:00');
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeEnabled();
  });

  it('"Без тихих часов" saves 00:00-00:00 and shows the hint', async () => {
    const bodies: unknown[] = [];
    server.use(http.patch(`${base}/me`, async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(me);
    }));
    renderApi(<SettingsScreen me={me} deleted={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Без тихих часов' }));
    expect(screen.getByText(hint)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toEqual(expect.objectContaining({ quietHours: { start: 0, end: 0 } }));
  });
});
