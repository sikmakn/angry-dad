import { describe, expect, it } from 'vitest';
import { safeZonedDeadline } from '../../src/tasks/taskFormat';

describe('calendar field edits', () => {
  it('keeps an unfinished ancient year from throwing during render', () => {
    expect(() => safeZonedDeadline('0002-10-24', '22:00', 'Europe/Minsk')).not.toThrow();
  });
  it.each(['', '2027-02-31', '2027-1-0'])('rejects incomplete or nonexistent dates: %s', (day) => {
    expect(safeZonedDeadline(day, '22:00', 'Europe/Minsk')).toBeUndefined();
  });
  it('interprets a custom deadline in the profile time zone', () => {
    expect(safeZonedDeadline('2027-01-15', '22:00', 'Europe/Minsk')).toBe('2027-01-15T19:00:00.000Z');
  });
});
