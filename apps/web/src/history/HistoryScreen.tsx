import type { Me } from '../api/contract';
import { usePages } from '../hooks/useApi';
import { Feedback } from '../components/Feedback';
import { PenCheck } from '../components/PenCheck';
import { NotificationCard } from './components/NotificationCard';
import { ratingOptions } from './notificationFormat';
import { NotificationState } from './components/NotificationState';
import { useNotificationCounts } from '../hooks/useNotificationCounts';
import { ReplyInBattle } from './components/ReplyInBattle';

export function HistoryScreen({ me }: { me: Me }) {
  const feed = usePages(me.id, 'listFeed', {}, true, true);
  const counts = useNotificationCounts(me.id);
  const items = feed.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <>
      <div className="eyebrow">Дневник · записи</div>
      <h1 tabIndex={-1}>История</h1>
      <p className="small muted">{`Всё, что ${me.role === 'mother' ? 'Мама тебе сказала' : 'Батя тебе сказал'}. Открой запись, чтобы ответить.`}</p>
      {counts.data && <p className="small muted">{`Не прочитано: ${counts.data.unreadCount ?? 0} · Ждут ответа: ${counts.data.unansweredCount ?? 0}`}</p>}
      <Feedback pending={feed.isPending} error={feed.error} />
      {feed.isError && <button className="btn ghost" onClick={() => void feed.refetch()}>Повторить</button>}
      {!feed.isPending && !feed.isError && !items.length && <p className="card">Тут будут напоминания, проверки и упрёки. Пока чисто. Надолго ли.</p>}
      <ul className="list">
        {items.map(message => (
          <li key={message.id}>
            <NotificationCard message={message} me={me} state={<NotificationState message={message} />}>
              <div className="notification-history-footer">
                <span className="hint marked-result">
                  {message.checkIn?.answer && <PenCheck />}
                  {message.checkIn?.resolvedAt ? 'Учтён ответ по этой задаче' : message.checkIn?.answer ? 'Ответ записан' : message.needsAnswer ? 'Ответь на проверку' : 'Запись в дневнике'}
                </span>
                {message.rating !== undefined && <span aria-label={`Оценка: ${ratingOptions[message.rating].label}`}>{ratingOptions[message.rating].emoji}</span>}
              </div>
              <a className="btn ghost" href={`#notification/${encodeURIComponent(message.id)}`}>Открыть сообщение</a>
              <ReplyInBattle me={me} feedId={message.id} />
            </NotificationCard>
          </li>
        ))}
      </ul>
      {feed.hasNextPage && <button className="btn ghost" disabled={feed.isFetchingNextPage} onClick={() => void feed.fetchNextPage()}>Показать ещё</button>}
    </>
  );
}
