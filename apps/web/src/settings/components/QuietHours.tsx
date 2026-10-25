import { quietInvalid } from '../quietTime';

export function QuietHours({ start, end, setStart, setEnd, duration }: { start: string; end: string; setStart: (value: string) => void; setEnd: (value: string) => void; duration: number }) {
  return (
    <fieldset>
      <legend>Тихие часы</legend>
      <div className="inline">
        <div className="field">
          <label htmlFor="quiet-start">С</label>
          <input id="quiet-start" type="time" step={1800} required value={start} aria-invalid={quietInvalid(duration)} aria-describedby="quiet-hint" onChange={event => setStart(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="quiet-end">До</label>
          <input id="quiet-end" type="time" step={1800} required value={end} aria-invalid={quietInvalid(duration)} aria-describedby="quiet-hint" onChange={event => setEnd(event.target.value)} />
        </div>
      </div>
      <p className="hint" id="quiet-hint">Шаг 30 минут. Если «с» и «до» совпадают, тихих часов нет.</p>
      {duration === 0 && <p className="hint">Бот может написать в любое время, даже ночью. Утром после провала считаем 08:00.</p>}
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
