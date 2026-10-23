import { describe, expect, it } from 'vitest';
import type { Schema } from '../../src/api/contract';
import { suggestRecurrence } from '../../src/tasks/recurrenceSuggestion';

describe('R-23 / A-9 approved recurrence vocabulary', () => {
  const cases: [string, Schema<'Recurrence'>][] = [
    ['повторять английский каждый день', { type: 'daily' }],
    ['ЕЖЕДНЕВНО повторять английский', { type: 'daily' }],
    ['бегать по будням', { type: 'weekdays' }],
    ['раз в неделю звонить маме', { type: 'weekly' }],
    ['каждую неделю писать отчёт', { type: 'weekly' }],
    ['убирать по понедельникам', { type: 'days_of_week', days: [1] }],
    ['бегать по вторникам и четвергам', { type: 'days_of_week', days: [2, 4] }],
    ['бегать по вторникам, четвергам', { type: 'days_of_week', days: [2, 4] }],
    ['заниматься через день', { type: 'every_n_days', n: 2 }],
    ['повторять каждые 3 дня', { type: 'every_n_days', n: 3 }],
    ['повторять каждые 30 дней', { type: 'every_n_days', n: 30 }],
  ];
  it.each(cases)('suggests %s', (title, expected) => {
    expect(suggestRecurrence(title)?.recurrence).toEqual(expected);
  });
  it.each(['повторять каждые 31 дней', 'повторять каждые 1 дней', 'завтра позвонить маме', 'почти ежедневнослово'])('does not guess an unapproved schedule: %s', (title) => {
    expect(suggestRecurrence(title)).toBeUndefined();
  });
});
