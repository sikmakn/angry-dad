import { useState } from 'react';
import type { Me, Schema } from '../../api/contract';
import { usePages } from '../../hooks/useApi';
import { Feedback } from '../../components/Feedback';
import { formatDate } from '../../format/date';

const labels = { phrase_add: 'Добавлена фраза', phrase_toggle: 'Изменена фраза', paraphrase_review: 'Проверен перефраз', role_card_edit: 'Изменена карточка роли', package_edit: 'Изменён пакет', strikes_grant: 'Начислены удары', strikes_revoke: 'Списаны удары', stars_refund: 'Возвращены Stars', settings_edit: 'Изменены настройки' };

export function OwnerJournal({ me }: { me: Me }) {
  const [action, setAction] = useState<Schema<'OwnerActionType'> | ''>('');
  const journal = usePages(me.id, 'listOwnerJournal', { query: { ...(action ? { action } : {}) } });
  return (
    <>
      <h2>Журнал действий</h2>
      <div className="field">
        <label htmlFor="journal-action">Действие</label>
        <select id="journal-action" value={action} onChange={event => setAction(event.target.value as typeof action)}>
          <option value="">Все действия</option>
          {(Object.keys(labels) as Schema<'OwnerActionType'>[]).map(value => <option key={value} value={value}>{labels[value]}</option>)}
        </select>
      </div>
      <Feedback pending={journal.isPending} error={journal.error} />
      {journal.isError && <button className="btn ghost" onClick={() => void journal.refetch()}>Повторить</button>}
      <ul className="list">
        {journal.data?.pages.flatMap(page => page.items).map((item, index) => (
          <li key={`${item.at}-${index}`} className="card stack">
            <b>{labels[item.action]}</b>
            <p>{item.targetTelegramId ?? item.targetId}</p>
            <p className="small muted">{formatDate(item.at, me.timeZone)}</p>
            {item.details && <p>{Object.entries(item.details).map(([key, value]) => `${key}: ${String(value)}`).join(' · ')}</p>}
          </li>
        ))}
      </ul>
      {journal.data?.pages.every(page => !page.items.length) && <p>Действий пока нет</p>}
      {journal.hasNextPage && <button className="btn ghost" disabled={journal.isFetchingNextPage} onClick={() => void journal.fetchNextPage()}>Показать ещё</button>}
      <p className="small muted">Записи только добавляются, исправить или удалить их нельзя.</p>
    </>
  );
}
