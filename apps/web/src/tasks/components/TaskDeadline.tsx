import { useState } from 'react';
import { calendarDay, formatDate, safeZonedDeadline } from '../taskFormat';

export function TaskDeadline({ day, time, timeZone, onChange }: { day: string; time: string; timeZone: string; onChange: (day: string, time: string) => void }) {
  const [custom, setCustom] = useState(false);
  const today = calendarDay(timeZone);
  const tomorrow = calendarDay(timeZone, true);
  const selected = custom || (day !== today && day !== tomorrow) ? 'custom' : day === today ? 'today' : 'tomorrow';
  const deadline = safeZonedDeadline(day, time, timeZone);
  return (
    <fieldset>
      <legend>Срок</legend>
      <div className="deadline-choices" role="group" aria-label="Выбор срока">
        {([['today', 'Сегодня', today], ['tomorrow', 'Завтра', tomorrow], ['custom', 'Другая дата', day]] as const).map(([key, label, date]) => (
          <button
            key={key}
            type="button"
            className="btn ghost deadline-choice"
            aria-pressed={selected === key}
            onClick={() => {
              setCustom(key === 'custom');
              if (key !== 'custom') {
                onChange(date, time);
              }
            }}
          >
            <span>{label}</span>
            <span className="small">{key === 'custom' ? 'Календарь' : `${date.slice(8, 10)}.${date.slice(5, 7)}`}</span>
          </button>
        ))}
      </div>
      {selected === 'custom' && (
        <div className="field">
          <label htmlFor="new-day">Дата</label>
          <input id="new-day" type="date" value={day} required onChange={event => onChange(event.target.value, time)} />
        </div>
      )}
      <div className="field">
        <label htmlFor="new-time">Время</label>
        <input id="new-time" type="time" value={time} required onChange={event => onChange(day, event.target.value)} />
      </div>
      <p className="deadline-selected" role="status">{deadline ? `Срок: ${formatDate(deadline, timeZone)}` : 'Укажи корректную дату и время.'}</p>
      <p className="hint">{`Срок от 15 минут до 365 дней. Часовой пояс: ${timeZone}.`}</p>
    </fieldset>
  );
}
