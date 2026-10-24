import type { ReactNode } from 'react';
import type { FeedMessage, Me } from '../../api/contract';
import { NotificationCountdown } from '../../tasks/components/NotificationCountdown';
import { formatDate } from '../../format/date';
import { notificationLabel, notificationText } from '../notificationFormat';

export function NotificationCard({ message, me, children, state }: { message: FeedMessage; me: Me; children?: ReactNode; state?: ReactNode }) {
  const check = message.checkIn;
  const expired = check?.expired ?? !!check?.missedAt;
  const delta = check?.groupRespectDelta;
  const stamp = message.taskOutcome === 'done'
    ? 'ВЫПОЛНЕНО'
    : message.taskOutcome === 'give_up'
      ? me.gender === 'female' ? 'СДАЛАСЬ' : 'СДАЛСЯ'
      : message.taskOutcome === 'failed'
        ? 'СРОК ЗАДАЧИ ВЫШЕЛ'
        : check?.resolvedAt
          ? 'ОТВЕТ УЧТЁН'
          : check?.answer
            ? 'ОТВЕЧЕНО'
            : expired
              ? delta !== undefined && delta < 0 ? `Просрочено: −${Math.abs(delta)} к уважению` : 'Просрочено'
              : undefined;
  const stampClass = message.taskOutcome === 'done' ? 'done' : message.taskOutcome || (expired && !check?.resolvedAt && !check?.answer) ? 'negative' : 'neutral';
  return (
    <article className="notification-card">
      <header className="notification-header">
        <span className="notification-author">{me.role === 'mother' ? 'Мама' : 'Батя'}</span>
        <span className="notification-kind">{notificationLabel(message)}</span>
      </header>
      <time className="notification-date" dateTime={message.sentAt}>{formatDate(message.sentAt, me.timeZone)}</time>
      {state}
      {message.taskTitle && <h2 className="notification-task">{message.taskTitle}</h2>}
      <blockquote className="notification-text">{notificationText(message)}</blockquote>
      {message.needsAnswer && !expired && <NotificationCountdown dueAt={check?.answerDueAt} />}
      {stamp && (
        <div className="notification-expiry">
          <span className={`notification-expiry-stamp ${stampClass}${message.taskOutcome ? ' outcome' : ''}`}>{stamp}</span>
          {!message.taskOutcome && check?.resolvedAt && <p className="hint">Ты ответил на другую проверку этой задачи.</p>}
          {!message.taskOutcome && !check?.answer && !check?.resolvedAt && expired && <p className="hint">Не было ответа в течение 15 минут.</p>}
        </div>
      )}
      {children && <div className="notification-actions">{children}</div>}
    </article>
  );
}
