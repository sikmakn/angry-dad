import type { Schema } from '../api/contract';

export function recurrenceError(value: Schema<'Recurrence'>): string | undefined {
  if (value.type === 'every_n_days' && (!Number.isInteger(value.n) || value.n! < 2 || value.n! > 30)) {
    return 'От 2 до 30 дней';
  }
  if (value.type === 'days_of_week' && (!value.days?.length || value.days.length > 6)) {
    return 'Дни недели: от 1 до 6';
  }
  return undefined;
}
