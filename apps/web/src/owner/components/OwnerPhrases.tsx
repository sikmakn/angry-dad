import type { Me, Schema } from '../../api/contract';
import { Feedback } from '../../components/Feedback';
import { Sheet } from '../../components/Sheet';
import { useOwnerPhrases } from '../hooks/useOwnerPhrases';

const categories: Schema<'PhraseCategory'>[] = ['on_greeting', 'on_task_set', 'on_delete', 'on_vague', 'on_reminder', 'on_check_in', 'on_check_in_reply', 'on_check_in_missed', 'on_fail', 'on_excuse', 'on_excuse_denied', 'on_retry', 'on_success', 'on_absent', 'on_battle_start', 'on_break', 'on_recovery'];
const combos: Schema<'PhraseCombo'>[] = ['any', 'father_son', 'father_daughter', 'mother_son', 'mother_daughter'];
const comboLabels = { any: 'Любое', father_son: 'Отец × сын', father_daughter: 'Отец × дочь', mother_son: 'Мать × сын', mother_daughter: 'Мать × дочь' };

export function OwnerPhrases({ me }: { me: Me }) {
  const { filter, setFilter, list, coverage, add, toggle, paraphrase, draft, setDraft, confirmation, setConfirmation, notice, submit, confirm, requestParaphrases } = useOwnerPhrases(me);
  const busy = add.isPending || paraphrase.isPending;
  return (
    <>
      <h2>Добавить фразу</h2>
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="field">
          <label htmlFor="phrase-role">Роль</label>
          <select id="phrase-role" value={draft.role} onChange={event => setDraft({ ...draft, role: event.target.value as Schema<'PhraseRole'> })}>
            <option value="father">Отец</option>
            <option value="mother">Мать</option>
            <option value="any">Любая</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="phrase-category">Категория</label>
          <select id="phrase-category" value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value as Schema<'PhraseCategory'> })}>
            {categories.map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="phrase-level">Уровень</label>
          <select id="phrase-level" value={draft.level ?? ''} onChange={event => setDraft({ ...draft, level: event.target.value ? Number(event.target.value) : undefined })}>
            <option value="">Без уровня</option>
            {[1, 2, 3].map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="phrase-defeat">Уровень побеждённости</label>
          <select id="phrase-defeat" value={draft.defeatLevel} onChange={event => setDraft({ ...draft, defeatLevel: event.target.value as Schema<'PhraseDefeatLevel'> })}>
            <option value="any">Любой</option>
            {['1', '2', '3', '4'].map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="phrase-combo">Сочетание роли и пола</label>
          <select id="phrase-combo" value={draft.combo} onChange={event => setDraft({ ...draft, combo: event.target.value as Schema<'PhraseCombo'> })}>
            {combos.map(value => <option value={value} key={value}>{comboLabels[value]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="phrase-source">Источник</label>
          <select id="phrase-source" value={draft.source} onChange={event => setDraft({ ...draft, source: event.target.value as 'owner' | 'subscriber' })}>
            <option value="owner">Владелец</option>
            <option value="subscriber">Подписчик</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="phrase-author">Автор</label>
          <input id="phrase-author" value={draft.author ?? ''} onChange={event => setDraft({ ...draft, author: event.target.value })} />
          <p className="hint">Видите только вы.</p>
        </div>
        <div className="field">
          <label htmlFor="phrase-text">Текст фразы</label>
          <textarea id="phrase-text" required value={draft.template} onChange={event => setDraft({ ...draft, template: event.target.value })} />
          <p className="hint">
            {'Слова по роду пишите с окончанием в скобках: сделал(а). Переменные: {task}, {time}, {left}, {name}, {other}.'}
          </p>
        </div>
        <Feedback error={add.error}>{notice}</Feedback>
        <button className="btn" disabled={busy || !draft.template.trim()}>Добавить фразу</button>
        <button type="button" className="btn ghost" disabled={busy || !draft.template.trim()} onClick={() => void submit(true)}>Добавить и запросить перефразы</button>
      </form>
      <div className="field">
        <label htmlFor="phrase-filter">Пул фраз</label>
        <select id="phrase-filter" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}>
          <option value="pending_review">Перефразы на одобрение</option>
          <option value="disabled">Выключенные</option>
          <option value="below">Ниже порога</option>
          <option value="enabled">Включённые</option>
        </select>
      </div>
      <Feedback pending={list.isPending || paraphrase.isPending} error={list.error ?? toggle.error ?? paraphrase.error} />
      {list.isError && <button className="btn ghost" onClick={() => void list.refetch()}>Повторить</button>}
      {!list.isPending && list.data?.pages.every(page => !page.items.length) && (
        <p className="card">{filter === 'disabled' ? 'Выключенных фраз нет' : filter === 'pending_review' ? 'Перефразов на одобрение нет' : 'Фраз нет'}</p>
      )}
      <ul className="list">
        {list.data?.pages.flatMap(page => page.items).map(item => (
          <li className="card stack" key={item.id}>
            <p>{item.template}</p>
            <p className="small muted">
              {`${item.category} · ${item.role} · ${item.status} · ${item.author ?? item.source} · avg ${item.votes ? (item.scoreSum / item.votes).toFixed(2) : '—'} · ${item.votes} голосов${item.belowThreshold ? ' · ниже порога' : ''}`}
            </p>
            <button className="btn ghost" disabled={toggle.isPending} onClick={() => setConfirmation({ id: item.id, status: item.status === 'enabled' ? 'disabled' : 'enabled', reject: false })}>
              {item.status === 'pending_review' ? 'Одобрить' : item.status === 'enabled' ? 'Выключить' : 'Включить'}
            </button>
            {item.status === 'pending_review'
              ? <button className="btn danger" disabled={toggle.isPending} onClick={() => setConfirmation({ id: item.id, status: 'disabled', reject: true })}>Отклонить</button>
              : <button className="btn ghost" disabled={busy} onClick={() => void requestParaphrases(item.id)}>Запросить перефразы</button>}
          </li>
        ))}
      </ul>
      {list.hasNextPage && <button className="btn ghost" disabled={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()}>Показать ещё</button>}
      <details className="card">
        <summary>Покрытие пула</summary>
        <Feedback pending={coverage.isPending} error={coverage.error} />
        {coverage.isError && <button className="btn ghost" onClick={() => void coverage.refetch()}>Повторить</button>}
        {coverage.data?.items.map((item, index) => <p key={index}>{`${item.role} · ${item.category} · ${item.enabledCount}/${item.required}`}</p>)}
      </details>
      {confirmation && (
        <Sheet title={confirmation.reject ? 'Отклонить перефраз?' : 'Изменить фразу?'} close={() => setConfirmation(undefined)}>
          <p>{confirmation.reject ? 'Этот вариант исчезнет из очереди и не будет показан пользователям. Исходная фраза останется. Отменить действие нельзя.' : 'Изменение будет действовать на новые сообщения.'}</p>
          <Feedback error={toggle.error} />
          <button className="btn danger" disabled={toggle.isPending} onClick={() => void confirm()}>Подтвердить</button>
        </Sheet>
      )}
    </>
  );
}
