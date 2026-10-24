import { allowedAt, chooseNextAt, quietEnd } from '../../../../src/modules/task-notifications/task-notifications.policy';
import type { User } from '../../../../src/database/schemas/user.schema';
import type { TaskNotificationState } from '../../../../src/database/schemas/task-notification-state.schema';
import type { OutboxMessage } from '../../../../src/database/schemas/outbox-message.schema';

describe('User notification limits', () => {
  const at = new Date('2026-10-20T12:00:00Z');
  const user = {
    timeZone: 'UTC',
    quietHours: {
      start: 0,
      end: 0,
    },
  } as User;
  const state = {} as TaskNotificationState;
  afterEach(() => jest.restoreAllMocks());
  it.each([0, 1, 179999, 180000, 180001])('holds the shared three-minute minimum after %i ms', (elapsed) => {
    expect(allowedAt({
      ...user,
      lastSentAt: new Date(+at - elapsed),
    }, state, [], at).getTime()).toBe(Math.max(+at, +at - elapsed + 180000));
  });
  it('counts unknown sends in the rolling hour', () => {
    const history = Array.from({ length: 6 }, (_, i) => ({ sendStartedAt: new Date(+at - (i + 1) * 180000) } as OutboxMessage));
    expect(allowedAt(user, state, history, at)).toEqual(new Date(+at - 18 * 60000 + 3600000));
  });
  it('excludes the exact one-hour boundary', () => {
    const history = Array.from({ length: 6 }, () => ({ sentAt: new Date(+at - 3600000) } as OutboxMessage));
    expect(allowedAt(user, state, history, at)).toEqual(at);
  });
  it('respects a pause and outstanding send lease', () => {
    expect(allowedAt({
      ...user,
      sendLeaseUntil: new Date(+at + 30000),
    }, {
      ...state,
      pauseUntil: new Date(+at + 600000),
    }, [], at)).toEqual(new Date(+at + 600000));
  });
  it.each([
    ['2026-10-20T22:59:00Z', '2026-10-20T22:59:00Z'],
    ['2026-10-20T23:00:00Z', '2026-10-21T08:00:00Z'],
    ['2026-10-21T07:59:00Z', '2026-10-21T08:00:00Z'],
    ['2026-10-21T08:00:00Z', '2026-10-21T08:00:00Z'],
  ])('quiet hours %s -> %s', (input, expected) => {
    expect(quietEnd({
      ...user,
      quietHours: {
        start: 1380,
        end: 480,
      },
    }, new Date(input))).toEqual(new Date(expected));
  });
  it('saturates task boost rather than collapsing to three minutes', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const input = {
      defeat: 0,
      taskCount: 1000,
      stagnant: false,
      urgent: false,
      moodFrom: at,
    };
    const many = chooseNextAt(user, state, [], input, at);
    expect(many).toEqual(chooseNextAt(user, state, [], {
      ...input,
      taskCount: 4,
    }, at));
    expect(+many - +at).toBeGreaterThan(20 * 60000);
  });
  it('defeat softens frequency and future mood delays eligibility', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const input = {
      defeat: 80,
      taskCount: 1,
      stagnant: false,
      urgent: false,
      moodFrom: at,
    };
    expect(+chooseNextAt(user, state, [], input, at) - +at).toBe(3600000);
    expect(chooseNextAt(user, state, [], {
      ...input,
      moodFrom: new Date(+at + 7200000),
    }, at)).toEqual(new Date(+at + 7200000));
  });
});
