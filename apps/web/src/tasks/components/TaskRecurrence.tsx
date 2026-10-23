import type { Schema } from '../../api/contract';
import { recurrenceLabels, weekdays } from '../taskFormat';
import { recurrenceError } from '../recurrenceValidation';

export function TaskRecurrence({ value, anchorTime, onChange, onAnchorChange }: { value: Schema<'Recurrence'>; anchorTime: string; onChange: (value: Schema<'Recurrence'>) => void; onAnchorChange: (value: string) => void }) {
  return (
    <>
      <div className="field">
        <label htmlFor="recurrence">Как часто</label>
        <select id="recurrence" value={value.type} onChange={event => onChange({ type: event.target.value as Schema<'Recurrence'>['type'] })}>
          {Object.entries(recurrenceLabels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
        </select>
      </div>
      {value.type === 'weekly' && (
        <div className="field">
          <label htmlFor="weekly-day">День недели</label>
          <select id="weekly-day" value={value.days?.[0] ?? ''} onChange={event => onChange({ ...value, days: event.target.value ? [Number(event.target.value)] : undefined })}>
            <option value="">Любой, закрыть можно всю неделю</option>
            {weekdays.map((label, index) => <option key={label} value={index + 1}>{label}</option>)}
          </select>
        </div>
      )}
      {value.type === 'days_of_week' && (
        <fieldset>
          <legend>Дни недели: от 1 до 6</legend>
          <div className="seg">
            {weekdays.map((label, index) => (
              <label className="opt" key={label}>
                <input type="checkbox" checked={value.days?.includes(index + 1) ?? false} onChange={event => onChange({ ...value, days: event.target.checked ? [...(value.days ?? []), index + 1] : value.days?.filter(day => day !== index + 1) })} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {value.type === 'every_n_days' && (
        <div className="field">
          <label htmlFor="every-n">Сколько дней в периоде</label>
          <input id="every-n" type="number" min={2} max={30} required value={value.n ?? ''} aria-invalid={!!recurrenceError(value)} aria-describedby="every-n-hint" onChange={event => onChange({ ...value, n: Number(event.target.value) })} />
          {recurrenceError(value) && <p id="every-n-hint" className="hint">{recurrenceError(value)}</p>}
          <p className="hint">Задачу можно закрыть в любой день периода. «Через день» — это 2.</p>
        </div>
      )}
      <div className="field">
        <label htmlFor="anchor">Примерно во сколько (необязательно)</label>
        <input id="anchor" type="time" value={anchorTime} onChange={event => onAnchorChange(event.target.value)} />
        <p className="hint">Ориентир: напоминания пойдут от него. Провал в 22:00, а если ориентир позже, то в ориентир.</p>
      </div>
    </>
  );
}
