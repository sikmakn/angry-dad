import type { Schema } from '../api/contract';

export interface RecurrenceSuggestion {
  phrase: string;
  recurrence: Schema<'Recurrence'>;
}

const dayNames = ['понедельникам', 'вторникам', 'средам', 'четвергам', 'пятницам', 'субботам', 'воскресеньям'];

// A-9: only the approved Russian expressions; no fuzzy guesses about schedules.
export function suggestRecurrence(title: string): RecurrenceSuggestion | undefined {
  const text = title.toLocaleLowerCase('ru');
  const daily = text.match(/(?<![а-яё])(?:каждый день|ежедневно)(?![а-яё])/u);
  if (daily) {
    return { phrase: daily[0], recurrence: { type: 'daily' } };
  }
  const weekdays = text.match(/(?<![а-яё])по будням(?![а-яё])/u);
  if (weekdays) {
    return { phrase: weekdays[0], recurrence: { type: 'weekdays' } };
  }
  const weekly = text.match(/(?<![а-яё])(?:раз в неделю|каждую неделю)(?![а-яё])/u);
  if (weekly) {
    return { phrase: weekly[0], recurrence: { type: 'weekly' } };
  }
  const alternate = text.match(/(?<![а-яё])через день(?![а-яё])/u);
  if (alternate) {
    return { phrase: alternate[0], recurrence: { type: 'every_n_days', n: 2 } };
  }
  const everyN = text.match(/(?<![а-яё])каждые\s+(\d+)\s+(?:дней|дня)(?![а-яё])/u);
  if (everyN && Number(everyN[1]) >= 2 && Number(everyN[1]) <= 30) {
    return { phrase: everyN[0], recurrence: { type: 'every_n_days', n: Number(everyN[1]) } };
  }
  const namedDays = text.match(/(?<![а-яё])по\s+(?:понедельникам|вторникам|средам|четвергам|пятницам|субботам|воскресеньям)(?:(?:\s*(?:,|и)\s*)(?:понедельникам|вторникам|средам|четвергам|пятницам|субботам|воскресеньям))*(?![а-яё])/u);
  if (namedDays) {
    const days = dayNames.flatMap((name, index) => namedDays[0].includes(name) ? [index + 1] : []);
    if (days.length === 7) {
      return { phrase: namedDays[0], recurrence: { type: 'daily' } };
    }
    return { phrase: namedDays[0], recurrence: { type: 'days_of_week', days } };
  }
  return undefined;
}
