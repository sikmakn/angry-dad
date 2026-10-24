import type { FeedMessage } from '../../api/contract';

export function NotificationState({ message }: { message: FeedMessage }) {
  if (message.taskOutcome) {
    return null;
  }
  if (!message.rateable && message.category !== 'on_check_in') {
    return <p className="notification-state read">Запись в дневнике</p>;
  }
  const waiting = message.needsAnswer ?? (message.category === 'on_check_in' && !message.checkIn?.answer && !message.checkIn?.resolvedAt);
  return (
    <div className="notification-states">
      <span className={`notification-state ${message.readAt ? 'read' : 'unread'}`}>{message.readAt ? 'Прочитано' : 'Не прочитано'}</span>
      {waiting && <span className="notification-state waiting">Ждёт ответа</span>}
      {message.checkIn?.resolvedAt && <span className="notification-state answered">Закрыто без оценки</span>}
      {message.checkIn?.answer && <span className="notification-state answered">Ответ записан</span>}
      {message.category === 'on_check_in' && !message.checkIn?.answer && !message.checkIn?.resolvedAt && !waiting && <span className="notification-state read">Неактивно</span>}
    </div>
  );
}
