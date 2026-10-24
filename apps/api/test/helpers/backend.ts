import 'reflect-metadata';
import { createHmac, randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import type { User } from '../../src/database/schemas/user.schema';
import type { Period } from '../../src/database/schemas/period.schema';
import type { Task } from '../../src/database/schemas/task.schema';

jest.setTimeout(60000);

export const uid = (): string => randomUUID();
export function authorization(id: number, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({
      id,
      first_name: 'Synthetic',
    }),
    ...extra,
  });
  const secret = createHmac('sha256', 'WebAppData').update('123456:synthetic-test-token').digest();
  params.set('hash', createHmac('sha256', secret).update([...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n')).digest('hex'));
  return `tma ${params}`;
}

export async function backend(prefix = false): Promise<{ app: INestApplication;
  db: DatabaseService;
  url: string; }> {
  if (process.env.NODE_ENV !== 'test' || !process.env.MONGODB_URI?.includes('angry-dad_test_')) {
    throw new Error('Use the repository test MongoDB runner');
  }
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = module.createNestApplication();
  app.useLogger(false);
  if (prefix) {
    app.setGlobalPrefix('api');
  }
  try {
    await app.init();
    const connection = app.get<Connection>(getConnectionToken());
    await Promise.all(Object.values(connection.models).map(model => model.init()));
    await app.listen(0, '127.0.0.1');
    return {
      app,
      db: app.get(DatabaseService),
      url: await app.getUrl(),
    };
  } catch (error) {
    await app.close();
    throw error;
  }
}

export async function user(db: DatabaseService, overrides: Partial<User> = {}): Promise<User> {
  return (await db.model('User').create({
    telegramId: Number.parseInt(randomUUID().replaceAll('-', '').slice(0, 12), 16),
    onboarding: 'done',
    role: 'father',
    gender: 'male',
    timeZone: 'UTC',
    quietHours: {
      start: 0,
      end: 0,
    },
    respect: 12,
    respectFromBreak: false,
    inLeaderboard: false,
    closedCount: 0,
    closedCountAt: new Date(),
    lastActivityAt: new Date(),
    botBlocked: false,
    ...overrides,
  })).toObject();
}

export async function taskPeriod(db: DatabaseService, owner: User, period: Partial<Period> = {}, task: Partial<Task> = {}): Promise<{ task: Task;
  period: Period; }> {
  const taskId = task._id ?? uid(), periodId = period._id ?? uid();
  const savedTask = (await db.model('Task').create({
    _id: taskId,
    userId: owner._id,
    title: 'Написать три страницы',
    kind: 'one_time',
    size: 'medium',
    status: 'active',
    currentPeriodId: periodId,
    createdAt: new Date(),
    ...task,
  })).toObject();
  const savedPeriod = (await db.model('Period').create({
    _id: periodId,
    userId: owner._id,
    taskId: savedTask._id,
    startsAt: new Date(Date.now() - 3600000),
    moodFrom: new Date(Date.now() - 3600000),
    deadline: new Date(Date.now() + 14400000),
    status: 'active',
    retryUsed: false,
    ...period,
  })).toObject();
  return {
    task: savedTask,
    period: savedPeriod,
  };
}

export async function checkIn(db: DatabaseService, owner: User, periodId: string, overrides: Record<string, unknown> = {}) {
  return (await db.model('FeedMessage').create({
    userId: owner._id,
    periodId,
    category: 'on_check_in',
    text: 'Как дело?',
    sentAt: new Date(),
    telegramMessageId: 1,
    checkIn: {},
    ...overrides,
  })).toObject();
}

export async function eventually(assertion: () => Promise<void>): Promise<void> {
  const end = Date.now() + 3000;
  for (;;) {
    try {
      await assertion();
      return;
    } catch (error) {
      if (Date.now() >= end) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 15));
    }
  }
}
