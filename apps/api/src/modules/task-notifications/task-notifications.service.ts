import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../database/database.service';
import type { Period } from '../../database/schemas/period.schema';
import type { OutboxMessage } from '../../database/schemas/outbox-message.schema';
import type { TaskNotificationState } from '../../database/schemas/task-notification-state.schema';
import { newId } from '../../common/utils/id';
import { RespectService } from '../respect/respect.service';
import { NotificationStateService } from './services/notification-state.service';
import { NotificationContextService } from './services/notification-context.service';
import { allowedAt, chooseNextAt, notificationPolicy as p, sampleMinutes, settingsKey } from './task-notifications.policy';

@Injectable()
export class TaskNotificationsService {
  private bootstrapAt = 0;
  constructor(private readonly db: DatabaseService, private readonly states: NotificationStateService, private readonly context: NotificationContextService, private readonly respect: RespectService) { }

  async plan(): Promise<void> {
    // Bootstrap pre-existing users without resetting their persisted random date.
    if (Date.now() >= this.bootstrapAt) {
      const users = await this.db.model('User').find({
        onboarding: 'done',
        botBlocked: false,
        deleting: { $ne: true },
      }).select('_id').lean();
      for (const user of users) {
        await this.states.ensure(user._id);
      }
      this.bootstrapAt = Date.now() + p.minute;
    }
    await this.db.model('OutboxMessage').updateMany({
      planRevision: { $exists: false },
      status: { $in: ['planned', 'leased'] },
    }, { $set: { status: 'cancelled' } });
    for (let i = 0; i < 100; i++) {
      const owner = randomUUID(), at = new Date();
      const state = await this.db.model('TaskNotificationState').findOneAndUpdate({
        $and: [{ $or: [{ dirty: true }, { nextAt: { $lte: at } }] }, { $or: [{ leaseUntil: { $exists: false } }, { leaseUntil: { $lte: at } }] }],
      }, {
        $set: {
          owner,
          leaseUntil: new Date(at.getTime() + p.lease),
        },
      }, {
        new: true,
        sort: { nextAt: 1 },
      }).lean();
      if (!state) {
        return;
      }
      await this.db.transaction(async (session) => {
        const owned = {
          _id: state._id,
          owner,
          revision: state.revision,
          leaseUntil: { $gt: new Date() },
        };
        const current = await this.db.model('TaskNotificationState').findOne(owned).session(session).lean();
        if (!current) {
          return;
        }
        if (current.pendingOutboxId) {
          const pending = await this.db.model('OutboxMessage').findById(current.pendingOutboxId).session(session).lean();
          if (pending && ['planned', 'leased'].includes(pending.status)) {
            await this.db.model('TaskNotificationState').updateOne(owned, {
              $unset: { owner: 1 },
              $set: { leaseUntil: new Date(Date.now() + p.minute) },
            }, { session });
            return;
          }
          await this.db.model('TaskNotificationState').updateOne(owned, {
            $inc: { revision: 1 },
            $set: { dirty: true },
            $unset: {
              pendingOutboxId: 1,
              owner: 1,
              leaseUntil: 1,
            },
          }, { session });
          return;
        }
        if (current.series && current.series.endsAt <= new Date()) {
          const pauseUntil = new Date(Date.now() + sampleMinutes(p.pause));
          await this.db.model('TaskNotificationState').updateOne(owned, {
            $set: {
              pauseUntil,
              nextAt: pauseUntil,
              dirty: false,
            },
            $unset: {
              series: 1,
              owner: 1,
              leaseUntil: 1,
            },
          }, { session });
          return;
        }
        const context = await this.context.load(state.userId, current, session);
        const primary = context?.candidates[0];
        if (!context || !primary) {
          await this.db.model('TaskNotificationState').updateOne(owned, {
            $set: { dirty: false },
            $unset: {
              nextAt: 1,
              owner: 1,
              leaseUntil: 1,
              series: 1,
            },
          }, { session });
          return;
        }
        const factorIndex = p.defeatThresholds.filter(threshold => context.defeat >= threshold).length;
        const series = Boolean(current.series && current.series.remaining > 0 && current.series.endsAt > new Date());
        let nextAt = current.nextAt;
        if (current.dirty || !nextAt) {
          nextAt = chooseNextAt(context.user, current, context.history, {
            defeat: context.defeat,
            taskCount: context.candidates.length,
            stagnant: primary.negative || primary.extended,
            urgent: ['reminder', 'fail'].includes(primary.kind),
            moodFrom: primary.period.moodFrom,
          }, new Date());
        }
        nextAt = new Date(Math.max(nextAt.getTime(), primary.period.moodFrom.getTime()));
        nextAt = allowedAt(context.user, current, context.history, nextAt);
        if (nextAt > new Date()) {
          await this.db.model('TaskNotificationState').updateOne(owned, {
            $set: {
              nextAt,
              dirty: false,
            },
            $unset: {
              owner: 1,
              leaseUntil: 1,
            },
          }, { session });
          return;
        }
        const secondary = Math.random() < p.secondaryChance ? context.candidates.find(row => row.task._id !== primary.task._id && row.period.status === 'active') : undefined;
        const intensity = Math.max(1, Math.min(3, (primary.score >= p.intensity.highScore ? 3 : primary.score >= p.intensity.mediumScore ? 2 : 1) - (factorIndex >= p.intensity.softenDefeatIndex ? 1 : 0)));
        const id = newId();
        await this.db.model('OutboxMessage').create([{
          _id: id,
          userId: state.userId,
          periodId: primary.period._id,
          primaryTaskId: primary.task._id,
          secondaryTaskId: secondary?.task._id,
          secondaryPeriodId: secondary?.period._id,
          kind: primary.kind,
          reason: primary.reason,
          reasonAt: primary.reasonAt,
          sourceFeedId: primary.sourceFeedId,
          intensity,
          priority: p.priority[primary.kind === 'check_in_missed' ? 'check_in' : primary.kind],
          planRevision: state.revision,
          role: context.user.role,
          contextKey: settingsKey(context.user),
          seriesId: series ? current.series?.id : undefined,
          seriesOriginFeedId: series ? current.series?.originFeedId : undefined,
          dueAt: nextAt,
          originalDueAt: nextAt,
          status: 'planned',
          dedupeKey: `task-plan:${state.userId}:${state.revision}`,
        }], { session });
        await this.db.model('TaskNotificationState').updateOne(owned, {
          $set: {
            dirty: false,
            pendingOutboxId: id,
            nextAt,
          },
          $unset: {
            owner: 1,
            leaseUntil: 1,
          },
        }, { session });
      });
    }
  }

  async valid(message: OutboxMessage, session?: ClientSession): Promise<boolean> {
    if (message.planRevision === undefined) {
      return false;
    }
    const state = await this.db.model('TaskNotificationState').findOne({
      _id: message.userId,
      revision: message.planRevision,
      pendingOutboxId: message._id,
      dirty: false,
    }).session(session ?? null).lean();
    if (!state) {
      return false;
    }
    const context = await this.context.load(message.userId, state, session);
    if (!context || settingsKey(context.user) !== message.contextKey || context.user.role !== message.role) {
      return false;
    }
    if (allowedAt(context.user, state, context.history, new Date()).getTime() > Date.now()) {
      return false;
    }
    const primary = context.candidates.find(row => row.task._id === message.primaryTaskId && row.period._id === message.periodId);
    if (!primary || primary.kind !== message.kind || primary.reason !== message.reason || primary.period.moodFrom > new Date()) {
      return false;
    }
    return !message.secondaryTaskId || context.candidates.some(row => row.task._id === message.secondaryTaskId && row.period._id === message.secondaryPeriodId && row.period.status === 'active');
  }

  async cancel(message: OutboxMessage, backoff = 0): Promise<void> {
    await this.db.model('TaskNotificationState').updateOne({
      _id: message.userId,
      revision: message.planRevision,
      pendingOutboxId: message._id,
    }, {
      $inc: { revision: 1 },
      $set: {
        dirty: backoff === 0,
        nextAt: new Date(Date.now() + backoff),
      },
      $unset: {
        pendingOutboxId: 1,
        owner: 1,
        leaseUntil: 1,
      },
    });
  }

  async startSeries(period: Period, session: ClientSession, penalized: boolean, originFeedId: string): Promise<void> {
    const state = await this.db.model('TaskNotificationState').findById(period.userId).session(session).lean();
    if (state?.series || (state?.pauseUntil && state.pauseUntil > new Date())) {
      return;
    }
    await this.states.signal(period.userId, session);
    await this.db.model('TaskNotificationState').updateOne({ _id: period.userId }, {
      $set: {
        series: {
          id: randomUUID(),
          originFeedId,
          remaining: p.seriesAdditional,
          penalized,
          endsAt: new Date(Date.now() + p.seriesLifetime),
        },
      },
    }, { session });
  }

  async missed(): Promise<void> {
    // One response window per task period. Reading or delivering another message
    // does not restart it; an answer closes this batch and lets a new one begin.
    const groups = await this.db.model('FeedMessage').aggregate<{ _id: string;
      userId: string; }>([
      {
        $match: {
          'category': 'on_check_in',
          'draft': { $ne: true },
          'telegramMessageId': { $exists: true },
          'periodId': { $exists: true },
          'checkIn.answer': { $exists: false },
          'checkIn.resolvedAt': { $exists: false },
        },
      },
      {
        $group: {
          _id: '$periodId',
          userId: { $first: '$userId' },
          firstAt: { $min: '$sentAt' },
          unprocessed: { $sum: { $cond: [{ $ifNull: ['$checkIn.missedAt', false] }, 0, 1] } },
        },
      },
      {
        $match: {
          firstAt: { $lte: new Date(Date.now() - p.answerWindow) },
          unprocessed: { $gt: 0 },
        },
      },
      { $limit: 100 },
    ]);
    for (const group of groups) {
      await this.db.transaction(async (session) => {
        const feeds = await this.db.model('FeedMessage').find({
          'userId': group.userId,
          'periodId': group._id,
          'category': 'on_check_in',
          'draft': { $ne: true },
          'telegramMessageId': { $exists: true },
          'checkIn.answer': { $exists: false },
          'checkIn.resolvedAt': { $exists: false },
        }).sort({
          sentAt: 1,
          _id: 1,
        }).session(session).lean();
        const first = feeds[0];
        if (!first || first.sentAt.getTime() + p.answerWindow > Date.now()) {
          return;
        }
        const period = await this.db.model('Period').findOne({
          _id: group._id,
          userId: group.userId,
          status: 'active',
          deadline: { $gt: new Date() },
        }).session(session).lean();
        const task = period
          ? await this.db.model('Task').exists({
              _id: period.taskId,
              userId: group.userId,
              currentPeriodId: period._id,
              status: 'active',
              deletedAt: { $exists: false },
            }).session(session)
          : null;
        if (!period || !task) {
          return;
        }
        const at = new Date();
        const updated = await this.db.model('FeedMessage').updateMany({
          '_id': { $in: feeds.map(row => row._id) },
          'checkIn.answer': { $exists: false },
          'checkIn.resolvedAt': { $exists: false },
          'checkIn.missedAt': { $exists: false },
        }, {
          $set: {
            'checkIn.missedAt': at,
            'checkIn.respectDelta': 0,
          },
        }, { session });
        if (!updated.modifiedCount || feeds.some(row => row.checkIn?.missedAt)) {
          return;
        }
        const origin = await this.db.model('OutboxMessage').findOne({
          feedMessageId: first._id,
          status: 'sent',
        }).session(session).lean();
        const additional = Boolean(origin?.seriesId || origin?.kind === 'series_check_in');
        const originFeedId = additional ? origin?.seriesOriginFeedId ?? origin?.sourceFeedId : first._id;
        if (originFeedId) {
          const eventKey = `${originFeedId}:missed`;
          const previous = await this.db.model('RespectChange').exists({
            userId: group.userId,
            eventKey,
          }).session(session);
          const penalty = await this.respect.apply(group.userId, 'missed_check_in', eventKey, -1, session);
          await this.db.model('FeedMessage').updateOne({ _id: first._id }, { $set: { 'checkIn.respectDelta': previous ? 0 : penalty.applied } }, { session });
        }
        if (!additional) {
          await this.startSeries(period, session, true, first._id);
        }
      });
    }
  }

  async recordSuccess(message: OutboxMessage, feedId: string, telegramMessageId: number, sentAt: Date): Promise<void> {
    await this.db.transaction(async (session) => {
      const result = await this.db.model('OutboxMessage').updateOne({
        _id: message._id,
        leaseToken: message.leaseToken,
        sentAt: { $exists: false },
      }, {
        $set: {
          status: 'sent',
          sentAt,
          feedMessageId: feedId,
        },
        $unset: { leaseUntil: 1 },
      }, { session });
      if (!result.modifiedCount) {
        return;
      }
      await this.db.model('User').updateOne({ _id: message.userId }, { $max: { lastSentAt: sentAt } }, { session });
      await this.db.model('FeedMessage').updateOne({ _id: feedId }, {
        $set: {
          sentAt,
          telegramMessageId,
          draft: false,
        },
      }, { session });
      const state = await this.db.model('TaskNotificationState').findOne({
        _id: message.userId,
        revision: message.planRevision,
        pendingOutboxId: message._id,
      }).session(session).lean();
      if (!state) {
        return;
      }
      const series = state.series;
      const consumed = series && message.seriesId === series.id;
      const exhausted = consumed && series.remaining <= 1;
      const expired = series && series.endsAt <= sentAt;
      const pauseUntil = exhausted || expired ? new Date(sentAt.getTime() + sampleMinutes(p.pause)) : state.pauseUntil;
      const nextState: TaskNotificationState = {
        ...state,
        nextAt: undefined,
        pauseUntil,
        series: exhausted || expired
          ? undefined
          : consumed
            ? {
                ...series,
                remaining: series.remaining - 1,
              }
            : series,
      };
      const context = await this.context.load(message.userId, nextState, session);
      const primary = context?.candidates[0];
      // Save the next random decision in the same commit, measured from actual
      // success only while this message still owns the plan. A concurrent event
      // retries the transaction and retains its newer pending/date/lease/series.
      const nextAt = context && primary
        ? chooseNextAt(context.user, nextState, context.history, {
            defeat: context.defeat,
            taskCount: context.candidates.length,
            stagnant: primary.negative || primary.extended,
            urgent: ['reminder', 'fail'].includes(primary.kind),
            moodFrom: primary.period.moodFrom,
          }, sentAt)
        : undefined;
      await this.db.model('TaskNotificationState').updateOne({
        _id: state._id,
        revision: message.planRevision,
        pendingOutboxId: message._id,
      }, {
        $inc: { revision: 1 },
        $set: {
          dirty: false,
          ...(nextAt ? { nextAt } : {}),
          ...(pauseUntil ? { pauseUntil } : {}),
          ...(consumed && !exhausted && !expired && primary ? { 'series.remaining': series.remaining - 1 } : {}),
        },
        $unset: {
          pendingOutboxId: 1,
          ...(!nextAt ? { nextAt: 1 } : {}),
          owner: 1,
          leaseUntil: 1,
          ...(exhausted || expired || !primary ? { series: 1 } : {}),
        },
      }, { session });
    });
  }
}
