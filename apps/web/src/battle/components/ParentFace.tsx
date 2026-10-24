import type { BattleMode } from '../../api/contract';
import { modeLabel } from '../battleFormat';

export function ParentFace({ mode, mother = false, broken = false }: { mode: BattleMode; mother?: boolean; broken?: boolean }) {
  const brows = mode === 'aggression' ? 'M10 14 L21 20 M38 14 L27 20' : mode === 'defense' ? 'M10 19 L21 19 M27 14 L38 18' : mode === 'confusion' ? 'M10 20 L21 15 M38 20 L27 15' : 'M10 19 Q16 15 21 18 M38 19 Q32 15 27 18';
  const mouth = mode === 'aggression' ? 'M16 37 Q24 31 32 37' : mode === 'defense' ? 'M17 36 L31 33' : mode === 'confusion' ? 'M15 36 Q19 32 23 36 T31 36 T35 36' : 'M18 35 Q24 39 30 35';
  return (
    <div className={`face face-${mode}`} role="img" aria-label={`${mother ? 'Мама' : 'Батя'}: ${modeLabel(mode, mother, broken)}`}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d={brows} />
        <circle cx="17" cy="26" r="2" />
        <circle cx="31" cy="26" r="2" />
        <path d={mouth} />
      </svg>
    </div>
  );
}
