import type { Me, Task } from '../../api/contract';
import { formatDate, mood, recurrenceText, remaining } from '../taskFormat';

export function TaskSummary({ task, me, now, heading = false }: { task: Task; me: Me; now: number; heading?: boolean }) {
  const period = task.currentPeriod;
  const state = period ? mood(period, me.role, now) : undefined;
  return (
    <>
      {heading ? <h1 className="task-title" tabIndex={-1}>{task.title}</h1> : <b>{task.title}</b>}
      <span className="tag">{recurrenceText(task)}</span>
      {period?.status === 'active' && (
        <>
          <span>{`${remaining(period, now)} · ${formatDate(period.deadline, me.timeZone)}`}</span>
          <span className="mood" role="img" aria-label={`Настроение: ${state?.label}, ${state?.level} из 5`}>
            {[1, 2, 3, 4, 5].map(n => <i key={n} className={n > (state?.level ?? 0) ? 'off' : ''} />)}
            <span className="small muted">{state?.label}</span>
          </span>
        </>
      )}
      {period?.status === 'done' && <span>{period.closedAt ? `Закрыта ${formatDate(period.closedAt, me.timeZone)}` : 'Закрыта'}</span>}
      {period?.status === 'failed' && <span className="tag red">Период провален</span>}
      {task.nextPeriodStartsAt && <span className="small muted">{`Следующий период — ${formatDate(task.nextPeriodStartsAt, me.timeZone)}`}</span>}
    </>
  );
}
