import { useEffect, useState } from 'react';
import type { Me } from '../api/contract';
import { usePages } from '../hooks/useApi';
import { useNotificationCounts } from '../hooks/useNotificationCounts';
import { useClock } from '../hooks/useClock';
import { Feedback } from '../components/Feedback';
import { Meter } from '../components/Meter';
import { NotificationCountdown } from './components/NotificationCountdown';
import { TaskSummary } from './components/TaskSummary';

export function HomeScreen({ me }: { me: Me }) {
  const [showFinished, setShowFinished] = useState(false);
  const tasks = usePages(me.id, 'listTasks', { query: { status: 'active', sort: 'deadline' } });
  const closed = usePages(me.id, 'listTasks', { query: { status: 'closed' } }, showFinished);
  const stopped = usePages(me.id, 'listTasks', { query: { status: 'stopped' } }, showFinished);
  const notifications = useNotificationCounts(me.id);
  const now = useClock();
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = tasks;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);
  const items = tasks.data?.pages.flatMap(page => page.items) ?? [];
  const unanswered = notifications.data?.unansweredCount ?? 0;
  const finished = [...(closed.data?.pages.flatMap(page => page.items) ?? []), ...(stopped.data?.pages.flatMap(page => page.items) ?? [])];
  return (
    <>
      <div className="eyebrow">{`Дневник · ${new Intl.DateTimeFormat('ru', { timeZone: me.timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(now)}`}</div>
      <h1 className="sr-only" tabIndex={-1}>Главная</h1>
      <div className="card respect">
        <div className="grade ok" aria-hidden="true">{Math.floor(me.respect)}</div>
        <div className="stack">
          <Meter label="Уважение" value={me.respect} />
          <p className="small muted">{`Выше 94 — только если сломать ${me.role === 'mother' ? 'Маму' : 'Батю'} в перепалке.`}</p>
        </div>
      </div>
      {unanswered > 0 && <NotificationCountdown count={unanswered} dueAt={notifications.data?.nextAnswerDueAt} />}
      <a className="btn" href="#task-new">Новая задача</a>
      <h2>{`Активные задачи · ${items.length}`}</h2>
      <Feedback pending={tasks.isPending} error={tasks.error} />
      {tasks.isError && <button className="btn ghost" onClick={() => void tasks.refetch()}>Повторить</button>}
      {!tasks.isPending && !tasks.isError && !items.length && <p className="card">Напиши, что нужно сделать, и к какому сроку или как часто. Расплывчатое («стать лучше») не примут. Проверки, напоминания и упрёки начнутся, как только задача появится.</p>}
      <ul className="list">
        {items.map(task => (
          <li key={task.id}>
            <a className="card task" href={`#task/${encodeURIComponent(task.id)}`}>
              <TaskSummary task={task} me={me} now={now} />
            </a>
          </li>
        ))}
      </ul>
      {tasks.hasNextPage && tasks.isFetchNextPageError && <button className="btn ghost" onClick={() => void tasks.fetchNextPage()}>Загрузить остальные задачи</button>}
      <details onToggle={event => setShowFinished(event.currentTarget.open)}>
        <summary>Завершённые, проваленные и остановленные</summary>
        {showFinished && (
          <section className="stack" aria-label="Завершённые задачи">
            <Feedback pending={closed.isPending || stopped.isPending} error={closed.error ?? stopped.error} />
            {(closed.isError || stopped.isError) && (
              <button
                className="btn ghost"
                onClick={() => {
                  void closed.refetch();
                  void stopped.refetch();
                }}
              >
                Повторить
              </button>
            )}
            {!closed.isPending && !stopped.isPending && !closed.isError && !stopped.isError && !finished.length && <p className="small muted">Завершённых задач пока нет.</p>}
            <ul className="list">
              {finished.map(task => (
                <li key={task.id}>
                  <a className="card task" href={`#task/${encodeURIComponent(task.id)}`}>
                    <TaskSummary task={task} me={me} now={now} />
                    {task.status === 'stopped' && <span className="tag">Остановлена</span>}
                  </a>
                </li>
              ))}
            </ul>
            {closed.hasNextPage && <button className="btn ghost" disabled={closed.isFetchingNextPage} onClick={() => void closed.fetchNextPage()}>Ещё завершённые и проваленные</button>}
            {stopped.hasNextPage && <button className="btn ghost" disabled={stopped.isFetchingNextPage} onClick={() => void stopped.fetchNextPage()}>Ещё остановленные</button>}
          </section>
        )}
      </details>
    </>
  );
}
