import type { Role } from '../../api/contract';

export function ParentChoice({ role, select }: { role?: Role; select: (value: Role) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">Родитель</legend>
      {([['father', 'Отец', 'Сравнивает, сроки, «в твои годы»'], ['mother', 'Мать', 'Давит виной: «я для тебя всё…»']] as const).map(([value, label, hint]) => (
        <label className="opt" key={value}>
          <input type="radio" name="parent" checked={role === value} onChange={() => select(value)} />
          <span>
            <b>{label}</b>
            <span className="small muted">{hint}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
