import { useState } from 'react';
import type { Me, Role } from '../../api/contract';
import { useRead } from '../../hooks/useApi';
import { Feedback } from '../../components/Feedback';
import { RoleEditor } from './RoleEditor';
import { PackageEditor } from './PackageEditor';

export function OwnerRoles({ me }: { me: Me }) {
  const [role, setRole] = useState<Role>('father');
  const card = useRead(me.id, 'getOwnerRoleCard', { path: { role } });
  const packages = useRead(me.id, 'listOwnerPackages');
  return (
    <>
      <h2>Карточка роли</h2>
      <div className="seg">
        {(['father', 'mother'] as const).map(value => <button className="btn ghost" key={value} aria-pressed={role === value} onClick={() => setRole(value)}>{value === 'father' ? 'Отец' : 'Мать'}</button>)}
      </div>
      <Feedback pending={card.isPending || packages.isPending} error={card.error ?? packages.error} />
      {(card.isError || packages.isError) && (
        <button
          className="btn ghost"
          onClick={() => {
            void card.refetch();
            void packages.refetch();
          }}
        >
          Повторить
        </button>
      )}
      {card.data && <RoleEditor key={role} role={role} me={me} card={card.data} />}
      <h2>Пакеты попыток</h2>
      {packages.data?.items.map(pack => <PackageEditor key={pack.id} me={me} pack={pack} />)}
      {packages.data && !packages.data.items.length && <p className="card">Пакетов пока нет</p>}
    </>
  );
}
