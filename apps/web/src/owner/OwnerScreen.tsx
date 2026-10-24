import { useState } from 'react';
import type { Me } from '../api/contract';
import { OwnerPhrases } from './components/OwnerPhrases';
import { OwnerRoles } from './components/OwnerRoles';
import { OwnerStrikes } from './components/OwnerStrikes';
import { OwnerMetrics } from './components/OwnerMetrics';
import { OwnerJournal } from './components/OwnerJournal';

export function OwnerScreen({ me }: { me: Me }) {
  const [tab, setTab] = useState('phrases');
  if (!me.isOwner) {
    return (
      <section className="card stack" role="alert">
        <h1 tabIndex={-1}>Эта страница только для владельца</h1>
        <p>Батя здесь один, и это не ты. Ничего не изменилось, твои данные на месте.</p>
        <a className="btn" href="#more">Вернуться в «Ещё»</a>
      </section>
    );
  }
  return (
    <>
      <a className="back" href="#more">← Ещё</a>
      <div className="eyebrow">Раздел владельца</div>
      <h1 tabIndex={-1}>Кабинет</h1>
      <nav className="tabs" aria-label="Разделы владельца">
        {([['phrases', 'Фразы'], ['roles', 'Роли и цены'], ['strikes', 'Попытки'], ['metrics', 'Метрики'], ['log', 'Журнал']] as const).map(([value, label]) => (
          <button className={`btn small ${tab === value ? '' : 'ghost'}`} aria-current={tab === value ? 'page' : undefined} key={value} onClick={() => setTab(value)}>{label}</button>
        ))}
      </nav>
      {tab === 'phrases' && <OwnerPhrases me={me} />}
      {tab === 'roles' && <OwnerRoles me={me} />}
      {tab === 'strikes' && <OwnerStrikes me={me} />}
      {tab === 'metrics' && <OwnerMetrics me={me} />}
      {tab === 'log' && <OwnerJournal me={me} />}
    </>
  );
}
