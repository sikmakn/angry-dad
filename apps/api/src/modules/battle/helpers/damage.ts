import type { Judge } from '../../ai/ai.service';
import type { GameSettings } from '../../../database/schemas/game-settings.schema';
export function battleMode(defeat: number): 'aggression' | 'defense' | 'confusion' | 'softening' {
  return defeat < 40 ? 'aggression' : defeat <= 70 ? 'defense' : defeat <= 90 ? 'confusion' : 'softening';
}
export function battleDamage(judge: Judge, coefficients: GameSettings['battleCoefficients']): {
  base: number;
  damage: number;
} {
  const base = (judge.hit * 0.5 + judge.logic * 0.3 + judge.originality * 0.2) * coefficients.base;
  let damage = Math.round(base * coefficients.damage);
  if (judge.weakSpotHit !== null) {
    damage += coefficients.weakSpot;
  }
  if (judge.hit >= 9 && judge.logic >= 7) {
    damage = Math.round(damage * coefficients.crit);
  }
  return {
    base,
    damage: Math.max(0, Math.round(damage)),
  };
}
