import { Injectable } from '@nestjs/common';
import type { Task } from '../../../database/schemas/task.schema';
import type { User } from '../../../database/schemas/user.schema';
import { addDays, localDate, zonedTime } from '../../../common/utils/time';
import { ApiError } from '../../../common/errors/api-error';
export interface PeriodWindow {
  startsAt: Date;
  moodFrom: Date;
  deadline: Date;
  anchorAt?: Date;
}
@Injectable()
export class RecurrenceService {
  validate(recurrence: NonNullable<Task['recurrence']>): void {
    const { type, days, n } = recurrence;
    if ((type === 'days_of_week' && !days?.length) || (type === 'weekly' && days && days.length !== 1) || (type === 'every_n_days' && (n === undefined || n < 2 || n > 30)) || (n !== undefined && type !== 'every_n_days') || (days !== undefined && !['weekly', 'days_of_week'].includes(type)) || (days && (!days.every(d => Number.isInteger(d) && d >= 1 && d <= 7) || new Set(days).size !== days.length || days.length > 6))) {
      throw ApiError.invalidRequest();
    }
  }

  window(task: Pick<Task, 'recurrence' | 'anchorTime' | 'createdAt'>, user: User, from: Date, first = false): PeriodWindow {
    const recurrence = task.recurrence!;
    let day = localDate(from, user.timeZone);
    const weekday = (day: string): number => new Date(`${day}T12:00:00Z`).getUTCDay() || 7;
    if (first && recurrence.type === 'weekly' && !recurrence.days) {
      day = addDays(day, 1 - weekday(day));
    }
    if (recurrence.type === 'every_n_days') {
      const origin = localDate(task.createdAt, user.timeZone);
      const elapsed = Math.floor((Date.parse(day) - Date.parse(origin)) / 86400000);
      day = addDays(origin, Math.floor(elapsed / recurrence.n!) * recurrence.n!);
    }
    for (let attempt = 0; attempt < 400; attempt++) {
      const allowed = recurrence.type === 'weekdays' ? weekday(day) <= 5 : recurrence.days ? recurrence.days.includes(weekday(day)) : true;
      if (!allowed) {
        day = addDays(day, 1);
        continue;
      }
      const duration = recurrence.type === 'every_n_days' ? recurrence.n! : recurrence.type === 'weekly' && !recurrence.days ? 7 : 1;
      const lastDay = addDays(day, duration - 1);
      const anchorMinute = task.anchorTime ? Number(task.anchorTime.slice(0, 2)) * 60 + Number(task.anchorTime.slice(3)) : undefined;
      const startsAt = zonedTime(day, 0, user.timeZone);
      const deadline = zonedTime(lastDay, Math.max(1320, anchorMinute ?? 0), user.timeZone);
      if (deadline.getTime() < from.getTime() + (first ? 900000 : 0)) {
        day = addDays(day, duration);
        continue;
      }
      const morning = user.quietHours.start === user.quietHours.end ? 540 : user.quietHours.end;
      const moodFrom = new Date(Math.max(zonedTime(day, morning, user.timeZone).getTime(), first ? task.createdAt.getTime() : startsAt.getTime()));
      const anchorAt = anchorMinute !== undefined ? zonedTime(lastDay, anchorMinute, user.timeZone) : undefined;
      return {
        startsAt,
        moodFrom,
        deadline,
        ...(anchorAt && anchorAt >= moodFrom ? { anchorAt } : {}),
      };
    }
    throw ApiError.invalidRequest();
  }

  nextStart(task: Task, user: User, startsAt: Date): Date {
    const type = task.recurrence!.type;
    const days = type === 'every_n_days' ? task.recurrence!.n! : type === 'weekly' && !task.recurrence!.days ? 7 : 1;
    return this.window(task, user, zonedTime(addDays(localDate(startsAt, user.timeZone), days), 0, user.timeZone)).startsAt;
  }
}
