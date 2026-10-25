import { TasksError } from './tasks.errors';
import { NotificationStateService } from '../task-notifications/services/notification-state.service';
import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../database/database.service';
import type { Task } from '../../database/schemas/task.schema';
import type { Period } from '../../database/schemas/period.schema';
import type { User } from '../../database/schemas/user.schema';
import { ApiError } from '../../common/errors/api-error';
import type { PageInput } from '../../common/utils/presentation';
import { PhrasesService } from '../phrases/phrases.service';
import { EventPublisher } from '../../common/events/event-publisher.service';
import { RecurrenceService } from './services/recurrence.service';
import type { CreateTaskRequestView, UpdateTaskRequestView, TaskResponseView, TaskActionResponseView, TaskListResponseView, PeriodResponseView, PeriodListResponseView, PeriodActionResponseView } from './tasks.types';
import { TaskReaderService } from './services/task-reader.service';
import { PeriodsService } from './services/periods.service';
import { DeadlineSweeperService } from './services/deadline-sweeper.service';
@Injectable()
export class TasksService {
  constructor(private readonly db: DatabaseService, private readonly phrases: PhrasesService, private readonly events: EventPublisher, private readonly recurrence: RecurrenceService, private readonly reader: TaskReaderService, private readonly periods: PeriodsService, private readonly sweeper: DeadlineSweeperService, private readonly notifications: NotificationStateService) { }
  async create(user: User, input: CreateTaskRequestView): Promise<TaskActionResponseView> {
    if ((input.kind === 'one_time' && (!input.deadline || input.recurrence || input.anchorTime)) || (input.kind === 'recurring' && (!input.recurrence || input.deadline))) {
      throw ApiError.invalidRequest();
    }
    if (input.recurrence) {
      this.recurrence.validate(input.recurrence);
    }
    const deadline = input.deadline ? new Date(input.deadline) : undefined;
    if (deadline && (deadline.getTime() < Date.now() + 900000 || deadline.getTime() > Date.now() + 365 * 86400000)) {
      throw new TasksError(400, 'deadline_out_of_range');
    }
    const title = input.title.trim();
    if (!title) {
      throw ApiError.invalidRequest();
    }
    const committed = await this.db.transaction(async (session) => {
      const exists = await this.db.model('User').findOneAndUpdate({
        _id: user._id,
        deleting: { $ne: true },
      }, { $inc: { activityRevision: 1 } }, { session }).lean();
      if (!exists) {
        throw ApiError.notFound();
      }
      const [row] = await this.db.model('Task').create([{
        userId: user._id,
        title,
        kind: input.kind,
        size: 'medium',
        recurrence: input.recurrence,
        anchorTime: input.anchorTime,
        status: 'active',
        createdAt: new Date(),
      }], { session });
      const task = row.toObject();
      const window = deadline
        ? {
            startsAt: task.createdAt,
            moodFrom: task.createdAt,
            deadline,
          }
        : this.recurrence.window(task, user, new Date(), true);
      if (window.startsAt <= new Date()) {
        const [period] = await this.db.model('Period').create([{
          ...window,
          taskId: task._id,
          userId: user._id,
          status: 'active',
          retryUsed: false,
        }], { session });
        task.currentPeriodId = period._id;
        await this.db.model('Task').updateOne({ _id: task._id }, { $set: { currentPeriodId: period._id } }, { session });
      }
      await this.notifications.signal(user._id, session);
      const phrase = await this.phrases.pick(user, 'on_task_set', undefined, title, window.deadline, session);
      const response = {
        task: await this.view(task, session),
        reply: phrase.text || null,
      };
      if (phrase.text) {
        await this.db.model('FeedMessage').create([{
          userId: user._id,
          periodId: task.currentPeriodId,
          taskTitle: title,
          category: 'on_task_set',
          ...phrase,
          sentAt: new Date(),
        }], { session });
      }
      return {
        response,
        event: {
          taskId: task._id,
          userId: task.userId,
          createdAt: task.createdAt.toISOString(),
          size: task.size,
        },
      };
    });
    this.events.publish('task.created', committed.event);
    return committed.response;
  }

  async update(user: User, id: string, input: UpdateTaskRequestView): Promise<TaskActionResponseView> {
    const task = await this.get(user._id, id);
    if (!input.title && !input.status) {
      throw ApiError.invalidRequest();
    }
    if (task.status !== 'active') {
      throw new TasksError(409, 'period_not_active', { periodStatus: task.status === 'stopped' ? 'stopped' : 'done' });
    }
    if (input.title !== undefined && !input.title.trim()) {
      throw ApiError.invalidRequest();
    }
    if (input.status && task.kind !== 'recurring') {
      throw ApiError.invalidRequest();
    }
    return this.db.transaction(async (session) => {
      const updated = await this.db.model('Task').findOneAndUpdate({
        _id: id,
        userId: user._id,
        status: 'active',
        deletedAt: { $exists: false },
      }, {
        $set: {
          ...(input.title ? { title: input.title.trim() } : {}),
          ...(input.status ? { status: 'stopped' } : {}),
        },
      }, {
        session,
        new: true,
      }).lean();
      if (!updated) {
        throw new TasksError(409, 'period_not_active');
      }
      if (input.status) {
        await this.db.model('Period').updateMany({
          taskId: id,
          status: 'active',
        }, {
          $set: {
            status: 'failed',
            closedAt: new Date(),
            respectDelta: 0,
          },
        }, { session });
        await this.cancelMessages(id, session);
      }
      await this.notifications.signal(user._id, session);
      return {
        task: await this.view(updated, session),
        reply: input.status ? (await this.phrases.pick(user, 'on_delete', undefined, task.title, undefined, session)).text || null : null,
      };
    });
  }

  async delete(user: User, id: string): Promise<{
    reply: string | null;
  }> {
    return this.db.transaction(async (session) => {
      const task = await this.get(user._id, id, session);
      await this.db.model('Task').updateOne({ _id: id }, { $set: { deletedAt: new Date() } }, { session });
      await this.db.model('Period').updateMany({
        taskId: id,
        status: 'active',
      }, {
        $set: {
          status: 'failed',
          closedAt: new Date(),
          respectDelta: 0,
        },
      }, { session });
      const count = await this.db.model('Period').countDocuments({
        taskId: id,
        status: 'done',
      }).session(session);
      await this.db.model('User').updateOne({ _id: user._id }, {
        $inc: { closedCount: -count },
        $set: { closedCountAt: new Date() },
      }, { session });
      await this.cancelMessages(id, session);
      await this.notifications.signal(user._id, session);
      return { reply: (await this.phrases.pick(user, 'on_delete', undefined, task.title, undefined, session)).text || null };
    });
  }

  private async cancelMessages(taskId: string, session: ClientSession): Promise<void> {
    const periods = await this.db.model('Period').find({ taskId }).session(session).select('_id').lean();
    await this.db.model('OutboxMessage').updateMany({
      periodId: { $in: periods.map(p => p._id) },
      status: { $in: ['planned', 'leased'] },
    }, { $set: { status: 'cancelled' } }, { session });
  }

  async get(userId: string, id: string, session?: ClientSession): Promise<Task> {
    return this.reader.get(userId, id, session);
  }

  async view(task: Task, session?: ClientSession): Promise<TaskResponseView> {
    return this.reader.view(task, session);
  }

  async periodView(period: Period, session?: ClientSession): Promise<PeriodResponseView> {
    return this.reader.periodView(period, session);
  }

  async list(userId: string, input: PageInput & {
    status?: string;
    kind?: string;
    sort?: string;
  }): Promise<TaskListResponseView> {
    return this.reader.list(userId, input);
  }

  async listPeriods(userId: string, taskId: string, input: PageInput): Promise<PeriodListResponseView> {
    return this.reader.listPeriods(userId, taskId, input);
  }

  async action(user: User, id: string, action: 'done' | 'extend' | 'surrender' | 'retry' | 'deadline', closedBy: 'done_button' | 'check_in' = 'done_button', session?: ClientSession, extensionDeadline?: string): Promise<PeriodActionResponseView> {
    return this.periods.action(user, id, action, closedBy, session, extensionDeadline);
  }

  async sweep(): Promise<void> {
    return this.sweeper.sweep();
  }
}
