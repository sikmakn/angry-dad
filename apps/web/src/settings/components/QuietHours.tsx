import { quietInvalid } from '../quietTime';

export function QuietHours({ start, end, setStart, setEnd, duration }: { start: string; end: string; setStart: (value: string) => void; setEnd: (value: string) => void; duration: number }) {
  return (
    <fieldset>
      <legend>Тихие часы</legend>
      <p className="hint" id="quiet-hint">В это время бот не будет дёргать Вас уведомлениями. Спите, отдыхайте, дальше он сам разберётся.</p>
      <div className="quiet-row">
        <label htmlFor="quiet-start">С</label>
        <input id="quiet-start" type="time" required value={start} aria-invalid={quietInvalid(duration)} aria-describedby="quiet-hint" onChange={event => setStart(event.target.value)} />
        <label htmlFor="quiet-end">до</label>
        <input id="quiet-end" type="time" required value={end} aria-invalid={quietInvalid(duration)} aria-describedby="quiet-hint" onChange={event => setEnd(event.target.value)} />
      </div>
      {duration === 0 && <p className="hint">Бот может написать в любое время, даже ночью. Утром после провала считаем 09:00.</p>}
      <button
        className="btn ghost"
        type="button"
        onClick={() => {
          setStart('00:00');
          setEnd('00:00');
        }}
      >
        Без тихих часов
      </button>
    </fieldset>
  );
}
