import type { TaskScheduleDraft } from '../types';
import { TaskDeadline } from './TaskDeadline';
import { TaskRecurrence } from './TaskRecurrence';

export function TaskSchedule({ value, timeZone, onChange }: { value: TaskScheduleDraft; timeZone: string; onChange: (value: TaskScheduleDraft) => void }) {
  return (
    <>
      <fieldset>
        <legend>Как ставим</legend>
        <div className="seg">
          {([['one_time', 'До срока'], ['recurring', 'Повторять']] as const).map(([kind, label]) => (
            <label className="opt" key={kind}>
              <input name="task-kind" type="radio" checked={value.kind === kind} onChange={() => onChange({ ...value, kind })} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      {value.kind === 'one_time'
        ? <TaskDeadline day={value.day} time={value.time} timeZone={timeZone} onChange={(day, time) => onChange({ ...value, day, time })} />
        : <TaskRecurrence value={value.recurrence} anchorTime={value.anchorTime} onChange={recurrence => onChange({ ...value, recurrence })} onAnchorChange={anchorTime => onChange({ ...value, anchorTime })} />}
    </>
  );
}
