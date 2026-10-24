import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from './../../../database/database.service';
import type { Task } from './../../../database/schemas/task.schema';
import type { Period } from './../../../database/schemas/period.schema';
import { ApiError } from './../../../common/errors/api-error';
import { present, pageSize } from './../../../common/utils/presentation';
import type { PageInput } from './../../../common/utils/presentation';
import { decodeCursor, encodeCursor } from './../../../common/utils/pagination';
import { rateableCategories } from './../../phrases/phrases.service';
import { RecurrenceService } from './recurrence.service';
import type { TaskResponseView, TaskListResponseView, PeriodResponseView, PeriodListResponseView } from './../tasks.types';
@Injectable()
export class TaskReaderService {
  constructor(private readonly db: DatabaseService, private readonly recurrence: RecurrenceService) { }
  async get(userId: string, id: string, session?: ClientSession): Promise<Task> {
    const task = await this.db.model('Task').findOne({
      _id: id,
      userId,
      deletedAt: { $exists: false },
    }).session(session ?? null).lean();
    if (!task) {
      throw ApiError.notFound();
    }
    return task;
  }

  async view(task: Task, session?: ClientSession): Promise<TaskResponseView> {
    const result = present<TaskResponseView>(task, ['id', 'title', 'kind', 'size', 'recurrence', 'anchorTime', 'status', 'createdAt']);
    if (task.currentPeriodId) {
      const period = await this.db.model('Period').findById(task.currentPeriodId).session(session ?? null).lean();
      if (period) {
        result.currentPeriod = await this.periodView(period, session);
        if (task.kind === 'recurring' && task.status === 'active' && period.status !== 'active') {
          const user = await this.db.model('User').findById(task.userId).session(session ?? null).lean();
          if (user) {
            result.nextPeriodStartsAt = this.recurrence.nextStart(task, user, period.startsAt).toISOString();
          }
        }
      }
    }
    if (task.kind === 'recurring' && task.status === 'active' && !result.currentPeriod) {
      const user = await this.db.model('User').findById(task.userId).session(session ?? null).lean();
      if (user) {
        result.nextPeriodStartsAt = this.recurrence.window(task, user, new Date(), true).startsAt.toISOString();
      }
    }
    return result;
  }

  async periodView(period: Period, session?: ClientSession): Promise<PeriodResponseView> {
    const result = present<PeriodResponseView>(period, ['id', 'startsAt', 'moodFrom', 'deadline', 'anchorAt', 'status', 'closedAt', 'closedBy', 'retryUsed', 'respectDelta']);
    if (period.failMessageId) {
      const feed = await this.db.model('FeedMessage').findOne({
        _id: period.failMessageId,
        userId: period.userId,
        draft: { $ne: true },
      }).session(session ?? null).lean();
      if (feed) {
        result.failMessage = {
          ...present<import('../../delivery/delivery.types').FeedMessageResponseView>(feed, ['id', 'category', 'text', 'periodId', 'taskTitle', 'rating', 'sentAt']),
          rateable: rateableCategories.includes(feed.category),
        };
      }
    }
    return result;
  }

  async list(userId: string, input: PageInput & {
    status?: string;
    kind?: string;
    sort?: string;
  }): Promise<TaskListResponseView> {
    const cursor = decodeCursor(input.cursor), limit = pageSize(input);
    const byDeadline = input.sort === 'deadline';
    const cursorParts = cursor?.split('_');
    const cursorId = byDeadline ? cursorParts?.[1] : cursor;
    const cursorDeadline = byDeadline && cursorParts ? Number(cursorParts[0]) : undefined;
    if (byDeadline && cursor && (!cursorId || !Number.isFinite(cursorDeadline))) {
      throw ApiError.invalidRequest();
    }
    const rows = await this.db.model('Task').aggregate<Task & {
      period?: Period;
      sortDeadline: Date;
    }>([
      {
        $match: {
          userId,
          deletedAt: { $exists: false },
          ...(input.status ? { status: input.status } : {}),
          ...(input.kind ? { kind: input.kind } : {}),
          ...(!byDeadline && cursorId ? { _id: { $lt: cursorId } } : {}),
        },
      },
      {
        $lookup: {
          from: this.db.model('Period').collection.name,
          localField: 'currentPeriodId',
          foreignField: '_id',
          as: 'period',
        },
      },
      {
        $unwind: {
          path: '$period',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $addFields: { sortDeadline: { $ifNull: ['$period.deadline', new Date('9999-01-01T00:00:00Z')] } } },
      ...(byDeadline && cursorId && cursorDeadline !== undefined
        ? [{
            $match: {
              $or: [{ sortDeadline: { $gt: new Date(cursorDeadline) } }, {
                sortDeadline: new Date(cursorDeadline),
                _id: { $gt: cursorId },
              }],
            },
          }]
        : []),
      {
        $sort: byDeadline
          ? {
              sortDeadline: 1 as const,
              _id: 1 as const,
            }
          : { _id: -1 as const },
      },
      { $limit: limit + 1 },
    ]);
    const user = rows.some(row => row.kind === 'recurring') ? await this.db.model('User').findById(userId).lean() : null;
    const page = rows.slice(0, limit);
    const failIds = page.flatMap(row => row.period?.failMessageId ? [row.period.failMessageId] : []);
    const feeds = failIds.length
      ? await this.db.model('FeedMessage').find({
          _id: { $in: failIds },
          userId,
          draft: { $ne: true },
        }).lean()
      : [];
    const items = page.map((row) => {
      const item = present<TaskResponseView>(row, ['id', 'title', 'kind', 'size', 'recurrence', 'anchorTime', 'status', 'createdAt']);
      if (row.period) {
        item.currentPeriod = present(row.period, ['id', 'startsAt', 'moodFrom', 'deadline', 'anchorAt', 'status', 'closedAt', 'closedBy', 'retryUsed', 'respectDelta']);
        const feed = feeds.find(f => f._id === row.period?.failMessageId);
        if (feed) {
          item.currentPeriod!.failMessage = {
            ...present<import('../../delivery/delivery.types').FeedMessageResponseView>(feed, ['id', 'category', 'text', 'periodId', 'taskTitle', 'rating', 'sentAt']),
            rateable: true,
          };
        }
      }
      if (user && row.kind === 'recurring' && row.status === 'active' && row.period?.status !== 'active') {
        item.nextPeriodStartsAt = (row.period ? this.recurrence.nextStart(row, user, row.period.startsAt) : this.recurrence.window(row, user, new Date(), true).startsAt).toISOString();
      }
      return item;
    });
    const last = page[page.length - 1];
    return {
      items,
      nextCursor: rows.length > limit ? encodeCursor(byDeadline ? `${last.sortDeadline.getTime()}_${last._id}` : last._id) : null,
    };
  }

  async listPeriods(userId: string, taskId: string, input: PageInput): Promise<PeriodListResponseView> {
    await this.get(userId, taskId);
    const cursor = decodeCursor(input.cursor), limit = pageSize(input);
    const rows = await this.db.model('Period').find({
      userId,
      taskId,
      ...(cursor ? { _id: { $lt: cursor } } : {}),
    }).sort({ _id: -1 }).limit(limit + 1).lean();
    return {
      items: await Promise.all(rows.slice(0, limit).map(row => this.periodView(row))),
      nextCursor: rows.length > limit ? encodeCursor(rows[limit - 1]._id) : null,
    };
  }
}
