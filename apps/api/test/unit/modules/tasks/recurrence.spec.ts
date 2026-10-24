import { RecurrenceService } from '../../../../src/modules/tasks/services/recurrence.service';
import type { User } from '../../../../src/database/schemas/user.schema';
import type { Task } from '../../../../src/database/schemas/task.schema';

describe('Recurring task calendar boundaries', () => {
  const recurrence = new RecurrenceService();
  const owner = {
    timeZone: 'Europe/Minsk',
    quietHours: {
      start: 1380,
      end: 480,
    },
  } as User;
  function task(rule: NonNullable<Task['recurrence']>, createdAt = '2026-10-23T09:00:00Z'): Task {
    return {
      recurrence: rule,
      createdAt: new Date(createdAt),
    } as Task;
  }
  it('weekdays skip a weekend and use local midnight, morning and 22:00 deadline', () => {
    const result = recurrence.window(task({ type: 'weekdays' }), owner, new Date('2026-10-24T09:00:00Z'));
    expect(result).toEqual({
      startsAt: new Date('2026-10-25T21:00:00Z'),
      moodFrom: new Date('2026-10-26T05:00:00Z'),
      deadline: new Date('2026-10-26T19:00:00Z'),
    });
  });
  it('first daily period needs fifteen minutes; exact boundary remains today', () => {
    const daily = task({ type: 'daily' });
    expect(recurrence.window(daily, owner, new Date('2026-10-23T18:45:00Z'), true).deadline).toEqual(new Date('2026-10-23T19:00:00Z'));
    expect(recurrence.window(daily, owner, new Date('2026-10-23T18:45:00.001Z'), true).startsAt).toEqual(new Date('2026-10-23T21:00:00Z'));
  });
  it('weekly without day spans Monday through Sunday across a year boundary', () => {
    const result = recurrence.window(task({ type: 'weekly' }, '2025-12-31T09:00:00Z'), owner, new Date('2025-12-31T09:00:00Z'), true);
    expect(result.startsAt).toEqual(new Date('2025-12-28T21:00:00Z'));
    expect(result.deadline).toEqual(new Date('2026-01-04T19:00:00Z'));
  });
  it('every N days stays anchored to creation across month boundaries', () => {
    const result = recurrence.window(task({
      type: 'every_n_days',
      n: 3,
    }, '2026-01-30T09:00:00Z'), owner, new Date('2026-02-02T09:00:00Z'));
    expect(result.startsAt).toEqual(new Date('2026-02-01T21:00:00Z'));
    expect(result.deadline).toEqual(new Date('2026-02-04T19:00:00Z'));
  });
  it('daily period follows the DST calendar rather than adding 24 hours', () => {
    const berlin = {
      ...owner,
      timeZone: 'Europe/Berlin',
    };
    const daily = task({ type: 'daily' }, '2026-03-28T09:00:00Z');
    const start = new Date('2026-03-28T23:00:00Z');
    expect(recurrence.nextStart(daily, berlin, start)).toEqual(new Date('2026-03-29T22:00:00Z'));
  });
  it.each([
    {
      type: 'every_n_days' as const,
      n: 1,
    },
    {
      type: 'every_n_days' as const,
      n: 31,
    },
    {
      type: 'days_of_week' as const,
      days: [],
    },
    {
      type: 'days_of_week' as const,
      days: [1, 1],
    },
    {
      type: 'weekly' as const,
      days: [1, 2],
    },
    {
      type: 'daily' as const,
      n: 3,
    },
  ])('rejects inconsistent recurrence %j', (rule) => {
    expect(() => recurrence.validate(rule)).toThrow();
  });
});
