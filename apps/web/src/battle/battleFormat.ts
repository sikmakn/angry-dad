import type { Schema } from '../api/contract';

const modeLabels = { aggression: 'Давит в полную силу', defense: 'Огрызается', confusion: 'Сбит с толку', softening: 'Смягчился' };

export function modeLabel(mode: Schema<'BattleMode'>, mother: boolean, broken: boolean) {
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
