import type { Me } from '../api/contract';
import { useRead, useWrite } from '../hooks/useApi';
import { Feedback } from '../components/Feedback';

export function LeaderboardScreen({ me }: { me: Me }) {
  const query = useRead(me.id, 'getLeaderboard');
  const participation = useWrite(me.id, 'setLeaderboardParticipation');
  return (
    <>
      <div className="eyebrow">Дневник · общий зачёт</div>
      <h1 tabIndex={-1}>Рейтинг</h1>
      <p className="small muted">Топ-100 по закрытым задачам за всё время. Каждая задача и период — за одну, независимо от размера.</p>
      <Feedback pending={query.isPending} error={query.error ?? participation.error} />
      {query.isError && <button className="btn ghost" onClick={() => void query.refetch()}>Повторить</button>}
      {query.data && (
        <>
          {!query.data.items.length && <p className="card">Пока никого. Будь первым</p>}
          <ol className="list">
            {query.data.items.map(item => (
              <li className="card row" key={item.rank}>
                <span>{`${item.rank}. ${item.username ? `@${item.username}` : item.firstName}`}</span>
                <b>{`${item.closedCount} задач`}</b>
              </li>
            ))}
          </ol>
          <div className="card stack">
            <h2>Твоя карточка</h2>
            <p>{`${me.username ? `@${me.username}` : me.firstName} · ${query.data.me.closedCount} задач`}</p>
            <p>{query.data.me.inLeaderboard ? `Вы: ${query.data.me.rank ?? '—'} место, ${query.data.me.closedCount} задач` : 'Вы не участвуете'}</p>
          </div>
          <button className="btn ghost" disabled={participation.isPending} onClick={() => void participation.run({ body: { inLeaderboard: !query.data!.me.inLeaderboard } }).catch(() => {})}>{query.data.me.inLeaderboard ? 'Выйти из рейтинга' : 'Участвовать снова'}</button>
        </>
      )}
    </>
  );
}
