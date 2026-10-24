import { useState } from 'react';
import type { Me } from './api/contract';
import { LegalContent } from './components/LegalContent';
import { Sheet } from './components/Sheet';

export function MoreScreen({ me }: { me: Me }) {
  const [legal, setLegal] = useState(false);
  return (
    <>
      <div className="eyebrow">Дневник · остальное</div>
      <h1 tabIndex={-1}>Ещё</h1>
      <a className="btn ghost" href="#shop">Огрызнуться ещё</a>
      <a className="btn ghost" href="#settings">Настройки</a>
      <button className="btn ghost" onClick={() => setLegal(true)}>Условия и политика конфиденциальности</button>
      <p className="hint">Вопросы по оплате — /paysupport в боте.</p>
      {me.isOwner && <a className="btn ghost" href="#owner">Раздел владельца</a>}
      {legal && <Sheet title="Условия и политика конфиденциальности" close={() => setLegal(false)}><LegalContent /></Sheet>}
    </>
  );
}
