import { useState } from 'react';
import type { Period } from '../../api/contract';
import { Sheet } from '../../components/Sheet';
import { Feedback } from '../../components/Feedback';
import { useClock } from '../../hooks/useClock';
import { formatDate, safeZonedDeadline } from '../taskFormat';

function localFields(value: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(value);
  const part = (name: string) => parts.find(item => item.type === name)?.value;
  return { day: `${part('year')}-${part('month')}-${part('day')}`, time: `${part('hour')}:${part('minute')}` };
}

export function TaskExtension({ period, timeZone, recurring, pending, error, extend, close }: {
  period: Period;
  timeZone: string;
  recurring: boolean;
  pending: boolean;
  error: unknown;
  extend: (deadline: string) => Promise<boolean>;
  close: () => void;
}) {
  const [choice, setChoice] = useState<'hour' | 'day' | 'custom'>('hour');
  const now = useClock();
  const [custom, setCustom] = useState(() => localFields(Date.parse(period.deadline) + 3600000, timeZone));
  const value = choice === 'custom' ? safeZonedDeadline(custom.day, custom.time, timeZone) : new Date(Date.parse(period.deadline) + (choice === 'hour' ? 3600000 : 86400000)).toISOString();
  const valid = value && Date.parse(value) > Date.parse(period.deadline) && Date.parse(value) <= now + 365 * 86400000;
  return (
    <Sheet title="Попросить больше времени" close={close}>
      <p>{`Сейчас срок: ${formatDate(period.deadline, timeZone)}`}</p>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (valid && !pending) {
          void extend(value).then(saved => saved && close());
        }
      }}
      >
        <fieldset disabled={pending}>
          <legend>На сколько перенести?</legend>
          {([['hour', 'Ещё 1 час'], ['day', 'Ещё 1 день'], ['custom', 'Своя дата и время']] as const).map(([key, label]) => (
            <label className="opt" key={key}>
              <input type="radio" name="extension" value={key} checked={choice === key} onChange={() => setChoice(key)} />
              {label}
            </label>
          ))}
          {choice === 'custom' && (
            <>
              <div className="field">
                <label htmlFor="extension-day">Новая дата</label>
                <input id="extension-day" type="date" value={custom.day} required onChange={event => setCustom({ ...custom, day: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="extension-time">Новое время</label>
                <input id="extension-time" type="time" value={custom.time} required onChange={event => setCustom({ ...custom, time: event.target.value })} />
              </div>
            </>
          )}
        </fieldset>
        <p className="deadline-selected" role="status">{value ? `Новый срок: ${formatDate(value, timeZone)}` : 'Выбери дату и время.'}</p>
        {!valid && <p className="hint">Выбери срок позже текущего, не дальше чем через 365 дней.</p>}
        <p className="hint">Количество переносов не ограничено. Чем дальше откладываешь, тем язвительнее ответ.</p>
        {recurring && <p className="hint">У повторяющейся задачи новый срок не может заходить в следующий период.</p>}
        <Feedback pending={pending} error={error} />
        <button className="btn" disabled={!valid || pending}>Попросить больше времени</button>
      </form>
    </Sheet>
  );
}
