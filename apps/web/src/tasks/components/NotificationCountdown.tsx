import { useClock } from '../../hooks/useClock';

export function NotificationCountdown({ count, dueAt }: { count?: number; dueAt?: string }) {
  const now = useClock(1000);
  const deadline = dueAt ? Date.parse(dueAt) : NaN;
  const remaining = Number.isFinite(deadline) ? Math.max(0, Math.ceil((deadline - now) / 1000)) : undefined;
  const urgent = remaining !== undefined && remaining > 0 && remaining <= 60;
  const time = remaining === undefined ? undefined : `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  if (count === undefined && (remaining === undefined || remaining === 0)) {
    return null;
  }
  return (
    <aside className={`home-notification-note${urgent ? ' urgent' : ''}${remaining === 0 ? ' expired' : ''}`}>
      {count !== undefined && (
        <p>
          {`Проверок без ответа: ${count}. `}
          {remaining === 0 ? 'Время на ответ вышло. ' : 'Ответь, чтобы не потерять уважение. '}
          <a href="#history">Открыть историю</a>
        </p>
      )}
      {time && remaining !== 0 && (
        <p className="notification-countdown">
          {remaining === 0 ? 'Срок ответа вышел: ' : 'До конца срока ответа: '}
          <strong role="timer" aria-label="Осталось на ответ">{time}</strong>
        </p>
      )}
    </aside>
  );
}
