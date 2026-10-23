import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { BattleScreen } from '../../src/battle/BattleScreen';
import { apiLifecycle, at, base, dialog, me, problem, renderApi, reply, server, turn } from '../helpers/api';

apiLifecycle();
describe('battle transport and recovery', () => {
  it('recovers the server reply after mounting during a turn without another reload', async () => {
    let finished = false;
    server.use(
      http.get(`${base}/battle/father`, () => HttpResponse.json({ ...dialog, turnInProgress: !finished, defeat: finished ? 21 : 0, defeatAt: finished ? '2026-10-24T09:01:00Z' : at })),
      http.get(`${base}/battle/father/messages`, () => HttpResponse.json({ items: finished ? turn.messages : [], nextCursor: null })),
    );
    renderApi(<BattleScreen me={me} share={vi.fn()} />);
    expect(await screen.findByRole('button', { name: 'Батя отвечает…' })).toBeDisabled();
    finished = true;
    expect(await screen.findByText(reply.text, {}, { timeout: 5000 })).toBeVisible();
    expect(screen.getByRole('meter', { name: 'Побеждённость' })).toHaveAttribute('aria-valuenow', '21');
  });

  it('reuses the identical key and body for an unknown turn and sends no automatic retry', async () => {
    const attempts: { key: string | null; body: unknown }[] = [];
    server.use(http.post(`${base}/battle/father/messages`, async ({ request }) => {
      attempts.push({ key: request.headers.get('idempotency-key'), body: await request.json() });
      return attempts.length === 1 ? HttpResponse.error() : HttpResponse.json(turn, { status: 201 });
    }));
    renderApi(<BattleScreen me={me} share={vi.fn()} />);
    const user = userEvent.setup();
    await waitFor(() => expect(screen.getByLabelText('Твоя реплика')).toBeEnabled());
    await user.type(screen.getByLabelText('Твоя реплика'), 'Ты сам ничего не доделал.');
    await user.click(await screen.findByRole('button', { name: 'Отправить · 1 удар' }));
    const retry = await screen.findByRole('button', { name: 'Узнать результат той же попытки' });
    expect(attempts).toHaveLength(1);
    expect(screen.getByLabelText('Твоя реплика')).toBeDisabled();
    expect(screen.getByLabelText('Твоя реплика')).toHaveValue('Ты сам ничего не доделал.');
    await user.click(retry);
    await screen.findByText(/Ход засчитан/);
    expect(attempts).toHaveLength(2);
    expect(attempts[0].key).toBeTruthy();
    expect(attempts[1]).toEqual(attempts[0]);
    expect(screen.getByLabelText('Твоя реплика')).toHaveValue('');
  });

  it('preserves a definitively failed turn draft and permits a new attempt', async () => {
    const keys: (string | null)[] = [];
    server.use(http.post(`${base}/battle/father/messages`, ({ request }) => {
      keys.push(request.headers.get('idempotency-key'));
      return problem(503, 'urn:angry-dad:problem:turn_failed');
    }));
    renderApi(<BattleScreen me={me} share={vi.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Твоя реплика'), 'Я сделал всё вовремя.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Отправить · 1 удар' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Отправить · 1 удар' }));
    await screen.findByText(/Ход не засчитан, удар возвращён/);
    expect(screen.getByLabelText('Твоя реплика')).toHaveValue('Я сделал всё вовремя.');
    await user.click(screen.getByRole('button', { name: 'Отправить · 1 удар' }));
    await waitFor(() => expect(keys).toHaveLength(2));
    expect(keys[1]).not.toBe(keys[0]);
  });
});
