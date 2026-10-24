import type { FeedMessage } from '../../api/contract';

export function TaskChecks({ items, closed }: { items: FeedMessage[]; closed: boolean }) {
  return (
    <>
      {!closed && items.map(message => (
        <section className="card stack" key={message.id}>
          <h2>Проверка ждёт ответа</h2>
          <a className="btn ghost" href={`#notification/${encodeURIComponent(message.id)}`}>Открыть проверку</a>
        </section>
      ))}
    </>
  );
}
