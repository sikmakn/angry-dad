import type { Me, Schema } from '../api/contract';
import { useShare } from './hooks/useShare';

export function ShareScreen({ me, body, back }: { me: Me; body: Schema<'CreateShareRequest'>; back: () => void }) {
  const sharing = useShare(me, body);
  const busy = sharing.create.isPending || sharing.selecting;
  return (
    <>
      <div>
        <div className="eyebrow">Поделиться</div>
        <h1 tabIndex={-1}>Карточка</h1>
      </div>
      <p className="card">На карточке нет твоего имени, username и названия задачи. Только фраза персонажа, результат и ссылка на бота.</p>
      {/* TODO Q-SHARE-PREVIEW: contract exposes only preparedMessageId, no preview image. */}
      <p className="muted">Карточку подготовит сервер. Выбор чата откроется в Telegram.</p>
      {sharing.create.isPending && <p className="banner" role="status" aria-busy="true">Карточка создаётся…</p>}
      {sharing.selecting && <p className="banner" role="status">Выбери чат в Telegram.</p>}
      {sharing.create.isError && <p className="banner" role="alert">Не получилось, ещё раз? Карточка не создалась, ничего не отправлено.</p>}
      {!sharing.available && <p className="banner">Отправка карточки доступна в Telegram с поддержкой shareMessage. В режиме моков отправка отключена.</p>}
      {sharing.status && <p className="banner" role="status">{sharing.status}</p>}
      <div className="btns">
        <button className="btn" disabled={!sharing.available || busy} onClick={() => void sharing.share()}>{sharing.create.isError ? 'Повторить' : 'Отправить в чат'}</button>
        <button className="btn ghost" onClick={back}>{busy ? 'Отмена' : 'Назад'}</button>
      </div>
    </>
  );
}
