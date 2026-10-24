import type { Me, Period, Schema, Task } from '../../api/contract';
import { Meter } from '../../components/Meter';
import { Quote } from '../../components/Quote';
import { PenCheck } from '../../components/PenCheck';
import { formatDate } from '../taskFormat';

export function TaskOutcome({ task, period, result, me }: { task: Task; period: Period; result?: Schema<'PeriodActionResponse'>; me: Me }) {
  const failed = period.status === 'failed';
  const reply = result?.reply ?? period.failMessage?.text;
  return (
    <>
      <h2>{task.title}</h2>
      {failed
        ? (
            <div className="center">
              <div className="grade">2</div>
              <div className="stamp">{task.kind === 'recurring' ? 'Период провален' : 'Задача провалена'}</div>
            </div>
          )
        : (
            <span className="tag marked-result">
              <PenCheck />
              Выполнено
            </span>
          )}
      {reply && <Quote text={reply} role={me.role} />}
      <div className="card stack">
        <Meter label="Уважение" value={result?.respect ?? me.respect} />
        {result && <p>{`${result.respectDelta > 0 ? '+' : ''}${result.respectDelta} · ${Math.floor(result.respect - result.respectDelta)} → ${Math.floor(result.respect)}`}</p>}
        {!result && <p>{`За этот период: ${period.respectDelta ?? 0}`}</p>}
        {period.closedAt && <p className="small">{`Закрыта ${formatDate(period.closedAt, me.timeZone)}`}</p>}
        {period.closedBy === 'give_up' && <p>Закрыта кнопкой «Сдаюсь».</p>}
      </div>
      {!failed && (result?.respect ?? me.respect) >= 94 && <p className="banner">Выше 94 — только сломом в перепалке.</p>}
    </>
  );
}
