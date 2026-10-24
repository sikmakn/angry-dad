import type { Period, Role, Task } from '../api/contract';

export const recurrenceLabels = { daily: 'Каждый день', weekdays: 'По будням', weekly: 'Раз в неделю', days_of_week: 'По выбранным дням', every_n_days: 'Каждые N дней' };
export const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const sizeLabels = { micro: 'Микро-задача', medium: 'Средняя задача', large: 'Большая задача' };
export const rewards = { micro: 1, medium: 3, large: 5 };

export function formatDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('ru', { timeZone, day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function recurrenceText(task: Task) {
  const rec = task.recurrence;
  if (!rec) {
    return 'Разовая';
  }
  return `${recurrenceLabels[rec.type]}${rec.n ? ` · ${rec.n}` : ''}${rec.days ? ` · ${rec.days.map(day => weekdays[day - 1]).join(', ')}` : ''}`;
}

export function remaining(period: Period, now: number) {
  const minutes = Math.max(0, Math.ceil((Date.parse(period.deadline) - now) / 60000));
  return minutes ? `${Math.floor(minutes / 60)} ч ${minutes % 60} мин` : 'Срок вышел';
}

export function mood(period: Period, role: Role | undefined, now: number) {
  const start = Date.parse(period.moodFrom);
  const end = Date.parse(period.anchorAt ?? period.deadline);
  const fraction = (now - start) / Math.max(1, end - start);
  const level = fraction < 0.25 ? 1 : fraction < 0.6 ? 2 : fraction < 0.85 ? 3 : fraction < 1 ? 4 : 5;
  const names = role === 'mother' ? ['Спокойна', 'Присматривается', 'Раздражена', 'Зла', 'В ярости'] : ['Спокоен', 'Присматривается', 'Раздражён', 'Зол', 'В ярости'];
  return { level, label: names[level - 1] };
}

// Interpret calendar controls in the saved profile zone, not the device zone.
export function zonedDeadline(day: string, time: string, zone: string) {
  const target = Date.parse(`${day}T${time}:00Z`);
  let value = target;
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
    const part = (type: string) => parts.find(item => item.type === type)?.value;
    const represented = Date.parse(`${part('year')?.padStart(4, '0')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:00Z`);
    value += target - represented;
  }
  return new Date(value).toISOString();
}

// Date fields may emit incomplete values while the user edits a year or time.
export function safeZonedDeadline(day: string, time: string, zone: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return undefined;
  }
  try {
    const calendar = new Date(`${day}T${time}:00Z`);
    if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== day) {
      return undefined;
    }
    return zonedDeadline(day, time, zone);
  } catch {
    return undefined;
  }
}

export function calendarDay(zone: string, tomorrow = false) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  const date = new Date(`${part('year')}-${part('month')}-${part('day')}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Number(tomorrow));
  return date.toISOString().slice(0, 10);
}
