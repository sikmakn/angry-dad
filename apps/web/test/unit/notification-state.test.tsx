import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationCountdown } from '../../src/tasks/components/NotificationCountdown';
import { NotificationCard } from '../../src/history/components/NotificationCard';
import { check, me } from '../helpers/api';

afterEach(() => vi.useRealTimers());

describe('shared response timer and notification stamps', () => {
  it('starts the slow warning only in the final minute and removes the timer at expiry', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-24T18:00:00Z'));
    const view = render(<NotificationCountdown dueAt="2026-10-24T18:01:01Z" />);
    expect(screen.getByRole('timer')).toHaveTextContent('01:01');
    expect(view.container.querySelector('.urgent')).toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('timer')).toHaveTextContent('01:00');
    expect(view.container.querySelector('.urgent')).not.toBeNull();
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it.each([['done', 'ВЫПОЛНЕНО'], ['give_up', 'СДАЛСЯ']] as const)('prioritizes task outcome %s over an old penalty', (taskOutcome, text) => {
    render(<NotificationCard me={me} message={{ ...check, taskOutcome, checkIn: { missedAt: check.sentAt, expired: false, respectDelta: -1 } }} />);
    expect(screen.getByText(text)).toBeVisible();
    expect(screen.queryByText(/Просрочено/)).not.toBeInTheDocument();
  });

  it('shows a neutral receipt when another check was answered', () => {
    render(<NotificationCard me={me} message={{ ...check, checkIn: { resolvedAt: check.sentAt, missedAt: check.sentAt, expired: false } }} />);
    expect(screen.getByText('ОТВЕТ УЧТЁН')).toBeVisible();
    expect(screen.queryByText(/Просрочено/)).not.toBeInTheDocument();
  });
});
