import type { Me, Role, Schema } from '../../api/contract';
import { Feedback } from '../../components/Feedback';
import { useRoleEditor } from '../hooks/useOwnerEditors';

export function RoleEditor({ me, role, card }: { me: Me; role: Role; card: Schema<'RoleCardResponse'> }) {
  const { draft, setDraft, save, valid, submit } = useRoleEditor(me, role, card);
  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="field">
        <label htmlFor="role-character">Характер</label>
        <textarea id="role-character" required value={draft.character} onChange={event => setDraft({ ...draft, character: event.target.value })} />
      </div>
      <h3>Больные места</h3>
      <p className="hint">Больных мест не меньше 5. Изменение действует на новые ходы перепалки.</p>
      {draft.weakSpots.map((spot, index) => (
        <div className="stack" key={index}>
          <div className="field">
            <label htmlFor={`spot-key-${index}`}>{`Ключ ${index + 1}`}</label>
            <input id={`spot-key-${index}`} required value={spot.key} onChange={event => setDraft({ ...draft, weakSpots: draft.weakSpots.map((item, n) => n === index ? { ...item, key: event.target.value } : item) })} />
          </div>
          <div className="field">
            <label htmlFor={`spot-description-${index}`}>Описание</label>
            <textarea id={`spot-description-${index}`} required value={spot.description} onChange={event => setDraft({ ...draft, weakSpots: draft.weakSpots.map((item, n) => n === index ? { ...item, description: event.target.value } : item) })} />
          </div>
          <button className="btn ghost" type="button" disabled={draft.weakSpots.length <= 5} onClick={() => setDraft({ ...draft, weakSpots: draft.weakSpots.filter((_, n) => n !== index) })}>Убрать</button>
        </div>
      ))}
      <button className="btn ghost" type="button" onClick={() => setDraft({ ...draft, weakSpots: [...draft.weakSpots, { key: '', description: '' }] })}>Добавить больное место</button>
      <Feedback error={save.error}>{save.isSuccess && 'Сохранено. Действует на новые ходы.'}</Feedback>
      <button className="btn" disabled={save.isPending || !valid}>Сохранить карточку</button>
    </form>
  );
}
