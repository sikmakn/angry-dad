import type { BattleMode } from '../api/contract';

const modeLabels = { aggression: 'Давит в полную силу', defense: 'Огрызается', confusion: 'Сбит с толку', softening: 'Смягчился' };

export function authority(defeat: number): number {
  return Math.max(0, Math.min(100, 100 - defeat));
}

export function authorityTone(value: number): 'red' | 'yellow' | 'green' | 'gold' {
  const displayed = Math.floor(value);
  return displayed === 0 ? 'gold' : displayed <= 20 ? 'green' : displayed <= 60 ? 'yellow' : 'red';
}

export function modeLabel(mode: BattleMode, mother: boolean, broken: boolean) {
  if (broken) {
    return mother ? 'Сломлена' : 'Сломлен';
  }
  if (mother && mode === 'confusion') {
    return 'Сбита с толку';
  }
  if (mother && mode === 'softening') {
    return 'Смягчилась';
  }
  return modeLabels[mode];
}
