import type { Me, Schema } from '../../api/contract';
import { Feedback } from '../../components/Feedback';
import { Sheet } from '../../components/Sheet';
import { usePackageEditor } from '../hooks/useOwnerEditors';

export function PackageEditor({ me, pack }: { me: Me; pack: Schema<'OwnerPackageResponse'> }) {
  const { draft, setDraft, confirm, setConfirm, save, submit } = usePackageEditor(me, pack);
  return (
    <form
      className="card stack"
      onSubmit={(event) => {
        event.preventDefault();
        setConfirm(true);
      }}
    >
      <h3>{`Пакет ${pack.id}`}</h3>
      {([['strikes', 'Удары'], ['priceStars', 'Цена в Stars'], ['order', 'Порядок']] as const).map(([key, label]) => (
        <div className="field" key={key}>
          <label htmlFor={`${pack.id}-${key}`}>{label}</label>
          <input id={`${pack.id}-${key}`} type="number" min={key === 'order' ? undefined : 1} step={1} required value={draft[key]} onChange={event => setDraft({ ...draft, [key]: Number(event.target.value) })} />
        </div>
      ))}
      <label className="opt">
        <input type="checkbox" checked={draft.active} onChange={event => setDraft({ ...draft, active: event.target.checked })} />
        Активен
      </label>
      <Feedback error={save.error}>{save.isSuccess && 'Цены сохранены. Новые счета будут выставлены по сохранённым ценам.'}</Feedback>
      <button className="btn" disabled={save.isPending}>Сохранить пакет</button>
      {confirm && (
        <Sheet title="Изменить пакет?" close={() => setConfirm(false)}>
          <p>{`${draft.strikes} ударов · ${draft.priceStars} Stars. Уже созданные счета сохранят прежнюю цену.`}</p>
          <Feedback error={save.error} />
          <button type="button" className="btn danger" disabled={save.isPending} onClick={() => void submit()}>Подтвердить</button>
        </Sheet>
      )}
    </form>
  );
}
