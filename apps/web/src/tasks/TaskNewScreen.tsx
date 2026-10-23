import type { Me } from '../api/contract';
import { Feedback } from '../components/Feedback';
import { Quote } from '../components/Quote';
import { useClock } from '../hooks/useClock';
import { TaskSchedule } from './components/TaskSchedule';
import { TaskTitle } from './components/TaskTitle';
import { useTaskForm } from './hooks/useTaskForm';
import { formatDate, recurrenceText, rewards, sizeLabels } from './taskFormat';

export function TaskNewScreen({ me, go }: { me: Me; go: (route: string) => void }) {
  const form = useTaskForm(me);
  const now = useClock();
  if (form.saved) {
    const task = form.saved.task;
    return (
      <>
        <h1 className="sr-only" tabIndex={-1}>Новая задача поставлена</h1>
        <div className="eyebrow">{`Дневник · ${new Intl.DateTimeFormat('ru', { timeZone: me.timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(now)}`}</div>
        {form.saved.reply && <Quote text={form.saved.reply} role={me.role} />}
        <div className="card stack">
          <p>{task.title}</p>
          <span className="tag">{recurrenceText(task)}</span>
          <span className="tag">{sizeLabels[task.size]}</span>
          {task.currentPeriod && <p>{`Срок${task.kind === 'recurring' ? ' текущего периода' : ''}: ${formatDate(task.currentPeriod.deadline, me.timeZone)}`}</p>}
          {task.kind === 'one_time'
            ? <p className="small muted">{`Размер определён при постановке, поменять его нельзя. За закрытие: +${rewards[task.size]} к уважению.`}</p>
            : <p className="small muted">{`Ориентир: ${task.anchorTime ?? 'без ориентира'}. Размер один на все периоды. За каждый закрытый период: +${rewards[task.size]} к уважению.`}</p>}
        </div>
        <p className="small muted">{`Проверки начнутся не раньше чем через 3 минуты. Когда — ${me.role === 'mother' ? 'Мама не скажет' : 'Батя не скажет'}.`}</p>
        <button className="btn" onClick={() => go('home')}>К задачам</button>
        <button className="btn ghost" onClick={form.reset}>Поставить ещё одну</button>
      </>
    );
  }
  return (
    <>
      <a className="back" href="#home">← Задачи</a>
      <h1 tabIndex={-1}>Новая задача</h1>
      <form onSubmit={(event) => {
        event.preventDefault();
        void form.submit();
      }}
      >
        <fieldset disabled={form.pending || form.uncertain}>
          <TaskTitle value={form.title} onChange={form.setTitle} />
          {form.suggestedPhrase && (
            <div className="card stack" role="status">
              <p>{`В названии есть «${form.suggestedPhrase}». Подставили периодичность. Сохранится после «Поставить».`}</p>
              <button type="button" className="btn ghost" onClick={form.removeSuggestion}>Убрать</button>
            </div>
          )}
          <TaskSchedule value={form.schedule} timeZone={me.timeZone} onChange={form.setSchedule} />
        </fieldset>
        {form.validation && <p role="alert" className="banner">{form.validation}</p>}
        <Feedback error={form.error} />
        <button className="btn" disabled={!form.title.trim() || !!form.scheduleError || form.pending || form.uncertain}>{form.pending ? `${me.role === 'mother' ? 'Мама' : 'Батя'} читает…` : 'Поставить'}</button>
      </form>
      {form.uncertain && (
        <section className="card stack" aria-labelledby="task-unknown-title">
          <h2 id="task-unknown-title">Результат неизвестен</h2>
          <p>Запрос мог сохранить задачу. Повторная отправка заблокирована. Обнови список и проверь, появилась ли она.</p>
          <button className="btn" disabled={form.review.isFetching} onClick={() => void form.refreshTasks()}>Обновить список задач</button>
          <Feedback pending={form.review.isFetching} error={form.review.error} />
          {form.reviewed && (
            <>
              {!form.review.data?.length && <p>Список задач пуст.</p>}
              <ul className="list">
                {form.review.data?.map(task => <li key={task.id}><a className="card task" href={`#task/${encodeURIComponent(task.id)}`}>{task.title}</a></li>)}
              </ul>
              <label className="opt">
                <input type="checkbox" checked={form.acknowledged} onChange={event => form.setAcknowledged(event.target.checked)} />
                Я проверил список. Разрешить создание новой задачи, понимая, что предыдущий запрос мог сохраниться позже.
              </label>
              <button className="btn ghost" disabled={!form.acknowledged} onClick={form.allowNewSubmission}>Вернуться к форме без отправки</button>
            </>
          )}
          <button className="btn ghost" onClick={() => go('home')}>К задачам</button>
        </section>
      )}
    </>
  );
}
