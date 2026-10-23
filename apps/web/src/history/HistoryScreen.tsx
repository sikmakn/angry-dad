import { useState } from 'react';
import type { FeedMessage, Me, Schema } from '../api/contract';
import { usePages, useWrite } from '../hooks/useApi';
import { Feedback } from '../components/Feedback';
import { Sheet } from '../components/Sheet';
import { Quote } from '../components/Quote';
import { formatDate } from '../format/date';

export function HistoryScreen({ me, go }: { me: Me; go: (route: string) => void }) {
  const feed = usePages(me.id, 'listFeed');
  const rating = useWrite(me.id, 'rateFeedMessage');
  const quote = useWrite(me.id, 'createBattleQuote');
  const [choice, setChoice] = useState<{ message: FeedMessage; score: Schema<'Rating'> }>();
  const labels = ['Слабо', 'Неприятно', 'В самое больное'];
  const items = feed.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <>
      <div className="eyebrow">Дневник · записи</div>
      <h1 tabIndex={-1}>История</h1>
      <p className="small muted">{`Всё, что ${me.role === 'mother' ? 'Мама тебе сказала' : 'Батя тебе сказал'}, от новых к старым. Оценить фразу можно один раз, изменить оценку нельзя.`}</p>
      <Feedback pending={feed.isPending} error={feed.error ?? quote.error ?? rating.error} />
      {feed.isError && <button className="btn ghost" onClick={() => void feed.refetch()}>Повторить</button>}
      {!feed.isPending && !feed.isError && !items.length && <p className="card">Тут будут напоминания, проверки и упрёки. Пока чисто. Надолго ли.</p>}
      <ul className="list">
        {items.map(message => (
          <li key={message.id} className="stack card">
            <p className="small muted">{`${formatDate(message.sentAt, me.timeZone)} · ${message.taskTitle ?? 'Без задачи'}`}</p>
            <Quote text={message.text} role={me.role} />
            {message.checkIn?.answer && <p className="small">{`Твой ответ: ${message.checkIn.answer === 'done' ? 'Сделано' : message.checkIn.answer === 'partial' ? 'Частично' : me.gender === 'female' ? 'Не начинала' : 'Не начинал'}`}</p>}
            {message.rating !== undefined && <p className="small">{`Уже оценено: ${labels[message.rating]}. Изменить её нельзя.`}</p>}
            {message.rating === undefined && message.rateable && (
              <div className="btns" role="group" aria-label="Насколько задело?">
                {labels.map((label, score) => <button className="btn ghost" key={label} disabled={rating.isPending} onClick={() => setChoice({ message, score: score as Schema<'Rating'> })}>{label}</button>)}
              </div>
            )}
            <button className="btn ghost" disabled={quote.isPending} onClick={() => void quote.run({ path: { role: me.role! }, body: { feedMessageId: message.id }, key: crypto.randomUUID() }).then(response => response && go('battle')).catch(() => {})}>Ответить</button>
          </li>
        ))}
      </ul>
      {feed.hasNextPage && <button className="btn ghost" disabled={feed.isFetchingNextPage} onClick={() => void feed.fetchNextPage()}>Показать ещё</button>}
      {choice && (
        <Sheet title="Записать оценку?" close={() => setChoice(undefined)}>
          <Quote text={choice.message.text} role={me.role} />
          <p>{`Твой выбор: ${labels[choice.score]}. Оценить эту фразу можно один раз, изменить голос нельзя.`}</p>
          <Feedback error={rating.error} />
          <button className="btn" disabled={rating.isPending} onClick={() => void rating.run({ path: { feedMessageId: choice.message.id }, body: { score: choice.score } }).then(response => response && setChoice(undefined)).catch(() => {})}>Записать оценку</button>
        </Sheet>
      )}
    </>
  );
}
