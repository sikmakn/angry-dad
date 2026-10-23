import { calendarDay } from '../taskFormat';

export function TaskDeadline({ day, time, timeZone, onChange }: { day: string; time: string; timeZone: string; onChange: (day: string, time: string) => void }) {
  return (
    <fieldset>
      <legend>Срок</legend>
      <div className="inline">
        <button type="button" className="btn ghost" onClick={() => onChange(calendarDay(timeZone), '22:00')}>Сегодня</button>
        <button type="button" className="btn ghost" onClick={() => onChange(calendarDay(timeZone, true), '22:00')}>Завтра</button>
      </div>
      <div className="field">
        <label htmlFor="new-day">Дата</label>
        <input id="new-day" type="date" value={day} required onChange={event => onChange(event.target.value, time)} />
      </div>
      <div className="field">
        <label htmlFor="new-time">Время</label>
        <input id="new-time" type="time" value={time} required onChange={event => onChange(day, event.target.value)} />
      </div>
      <p className="hint">{`«Сегодня» и «Завтра» — до 22:00. Срок от 15 минут до 365 дней. ${timeZone}`}</p>
    </fieldset>
  );
}
