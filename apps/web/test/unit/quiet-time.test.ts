import { describe, expect, it } from 'vitest';
import { minutes, quietInvalid, timeString } from '../../src/settings/quietTime';

const duration = (start: string, end: string) => (minutes(end) - minutes(start) + 1440) % 1440;

describe('quietTime', () => {
  it('converts between minutes from midnight and HH:MM, including the contract bounds', () => {
    expect(timeString(0)).toBe('00:00');
    expect(timeString(540)).toBe('09:00');
    expect(timeString(1320)).toBe('22:00');
    expect(timeString(1410)).toBe('23:30');
    for (const value of [0, 30, 570, 1290, 1410]) {
      expect(minutes(timeString(value))).toBe(value);
    }
  });

  it('treats an empty time as invalid and a filled one as valid', () => {
    expect(Number.isNaN(minutes(''))).toBe(true);
    expect(quietInvalid(duration('', '09:00'))).toBe(true);
    expect(quietInvalid(duration('22:00', ''))).toBe(true);
    expect(quietInvalid(duration('22:00', '09:00'))).toBe(false);
    expect(quietInvalid(0)).toBe(false);
  });

  it('computes interval length across midnight with no 12 hour cap; equal bounds give zero', () => {
    expect(duration('22:00', '09:00')).toBe(660);
    expect(duration('08:00', '23:30')).toBe(930);
    expect(duration('23:30', '23:00')).toBe(1410);
    expect(duration('00:00', '00:00')).toBe(0);
    expect(quietInvalid(duration('08:00', '23:30'))).toBe(false);
  });
});
