import type { User } from '../../database/schemas/user.schema';
import type { TaskNotificationState } from '../../database/schemas/task-notification-state.schema';
import type { OutboxMessage } from '../../database/schemas/outbox-message.schema';
import { addDays, localDate, localMinute, zonedTime } from '../../common/utils/time';

export const notificationPolicy = {
  minute: 60000,
  hour: 3600000,
  hardMinimum: 180000,
  hourlyLimit: 6,
  normal: [30, 120],
  stagnant: [7, 25],
  series: [3, 10],
  pause: [30, 60],
  seriesAdditional: 2,
  seriesLifetime: 90 * 60000,
  answerWindow: 15 * 60000,
  failWindow: 24 * 3600000,
  absence: 6 * 3600000,
  urgent: 120 * 60000,
  negativeWindow: 6 * 3600000,
  extensionWindow: 24 * 3600000,
  rotationWindow: 6 * 3600000,
  taskBoost: 0.1,
  taskBoostCap: 3,
  secondaryChance: 0.25,
  lease: 30000,
  emptyPoolBackoff: 60 * 60000,
  defeatThresholds: [20, 50, 80],
  defeatFactors: [1, 1.25, 1.5, 2],
  priority: {
    fail: 4,
    reminder: 3,
    absent: 2,
    check_in: 1,
    series_check_in: 1,
  },
  score: {
    urgent: 4,
    negative: 3,
    extended: 2,
    failed: 5,
    ageCap: 12,
    ageHour: 2,
  },
  intensity: {
    mediumScore: 4,
    highScore: 8,
    softenDefeatIndex: 2,
  },
  defeatDecayPerDay: 25,
  day: 86400000,
  historyLimit: 200,
} as const;

export function sampleMinutes(range: readonly [number, number]): number {
  return (range[0] + Math.random() * (range[1] - range[0])) * notificationPolicy.minute;
}

export function quietEnd(user: User, at: Date): Date {
  const minute = localMinute(at, user.timeZone), quiet = user.quietHours;
  const inside = quiet.start !== quiet.end && (quiet.start < quiet.end ? minute >= quiet.start && minute < quiet.end : minute >= quiet.start || minute < quiet.end);
  return inside ? zonedTime(minute < quiet.end ? localDate(at, user.timeZone) : addDays(localDate(at, user.timeZone), 1), quiet.end, user.timeZone) : at;
}

export function allowedAt(user: User, state: TaskNotificationState, history: OutboxMessage[], at: Date): Date {
  const p = notificationPolicy;
  let earliest = Math.max(at.getTime(), (user.lastSentAt?.getTime() ?? -p.hardMinimum) + p.hardMinimum, state.pauseUntil?.getTime() ?? 0,
    user.sendLeaseUntil ? user.sendLeaseUntil.getTime() + p.hardMinimum : 0);
  // History is ordered newest first. Include both confirmed sends and conservative
  // uncertainty windows in density; unknown Telegram outcomes never count as success.
  const recent = history.filter(row => (row.sentAt ?? row.sendStartedAt)!.getTime() > earliest - p.hour);
  if (recent.length >= p.hourlyLimit) {
    earliest = Math.max(earliest, (recent[p.hourlyLimit - 1].sentAt ?? recent[p.hourlyLimit - 1].sendStartedAt)!.getTime() + p.hour);
  }
  return quietEnd(user, new Date(earliest));
}

export function settingsKey(user: User): string {
  return JSON.stringify([user.role, user.gender, user.timeZone, user.quietHours, user.firstName]);
}

export function chooseNextAt(user: User, state: TaskNotificationState, history: OutboxMessage[], input: {
  defeat: number;
  taskCount: number;
  stagnant: boolean;
  urgent: boolean;
  moodFrom: Date;
}, at: Date): Date {
  const p = notificationPolicy;
  const factorIndex = p.defeatThresholds.filter(threshold => input.defeat >= threshold).length;
  const series = state.series && state.series.remaining > 0 && state.series.endsAt > at;
  const range = series ? p.series : input.stagnant ? p.stagnant : p.normal;
  const boost = 1 + Math.min(p.taskBoostCap, input.taskCount - 1) * p.taskBoost;
  let delay = sampleMinutes(range) * p.defeatFactors[factorIndex] / boost;
  if (input.urgent) {
    delay = Math.min(delay, sampleMinutes(p.stagnant) * p.defeatFactors[factorIndex] / boost);
  }
  let nextAt = at.getTime() + delay;
  if (state.nextAt && state.nextAt > at) {
    nextAt = Math.min(nextAt, state.nextAt.getTime());
  }
  return allowedAt(user, state, history, new Date(Math.max(nextAt, input.moodFrom.getTime())));
}
