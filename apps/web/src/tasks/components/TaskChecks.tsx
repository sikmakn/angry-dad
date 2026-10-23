import type { FeedMessage, Me, Schema } from '../../api/contract';
import { Quote } from '../../components/Quote';
import { formatDate } from '../taskFormat';

export function TaskChecks({ items, me, pending, closed, answer }: { items: FeedMessage[]; me: Me; pending: boolean; closed: boolean; answer: (id: string, value: Schema<'CheckInAnswer'>) => Promise<void> }) {
  return (
    <>
      {items.map(message => (
        <section className="card stack" key={message.id}>
          <h2>Проверка</h2>
          <Quote text={message.text} role={me.role} />
          <p className="small muted">{`${formatDate(message.sentAt, me.timeZone)}. Без ответа 15 минут — минус 1 к уважению.`}</p>
          {closed && <p role="status">Задача уже закрыта. Штрафа за молчание нет.</p>}
          {!closed && message.checkIn?.missedAt && <p>Штраф за молчание уже снят. Ответить ещё можно.</p>}
          <div className="btns">
            {([['done', 'Сделано'], ['partial', 'Частично'], ['not_started', me.gender === 'female' ? 'Не начинала' : 'Не начинал']] as const).map(([value, label]) => (
              <button className="btn ghost" key={value} disabled={pending || closed} onClick={() => void answer(message.id, value)}>{label}</button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
