import type { Gender } from '../../api/contract';

export function GenderChoice({ gender, select, pending }: { gender?: Gender; select: (value: Gender) => void; pending: boolean }) {
  return (
    <fieldset disabled={pending}>
      <legend className="sr-only">Пол</legend>
      {([['male', 'Мужской'], ['female', 'Женский']] as const).map(([value, label]) => (
        <label className="opt" key={value}>
          <input type="radio" name="gender" checked={gender === value} onChange={() => select(value)} />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
