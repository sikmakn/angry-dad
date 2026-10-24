import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InlineKeyboard } from 'grammy';
import { AppConfigService } from '../../../config/app-config.service';
import { DatabaseService } from '../../../database/database.service';
import type { OutboxMessage } from '../../../database/schemas/outbox-message.schema';
import { PhrasesService, rateableCategories } from '../../phrases/phrases.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { TelegramClient, TelegramFailure } from '../../bot/services/telegram-client.service';
import { TaskNotificationsService } from '../../task-notifications/task-notifications.service';
import { notificationPolicy as p } from '../../task-notifications/task-notifications.policy';

class DeliveryDeferred extends Error { }
@Injectable()
export class DispatcherService {
  constructor(private readonly config: AppConfigService, private readonly db: DatabaseService, private readonly phrases: PhrasesService, private readonly analytics: AnalyticsService, private readonly telegram: TelegramClient, private readonly notifications: TaskNotificationsService) { }

  async dispatch(): Promise<void> {
    // A crashed sender might have reached Telegram. Never blindly replay its request.
    const expired = await this.db.model('OutboxMessage').find({
      status: 'leased',
      leaseUntil: { $lte: new Date() },
    }).limit(100).lean();
    for (const message of expired) {
      // Rebuild an unsent draft after recovery: placeholders such as time left
      // must be rendered against the current context, rather than the old lease.
      const result = await this.db.model('OutboxMessage').updateOne({
        _id: message._id,
        status: 'leased',
        leaseToken: message.leaseToken,
        leaseUntil: { $lte: new Date() },
      }, {
        $set: { status: message.sendStartedAt ? 'dropped' : 'planned' },
        $unset: {
          leaseUntil: 1,
          ...(!message.sendStartedAt
            ? {
                leaseToken: 1,
                feedMessageId: 1,
              }
            : {}),
        },
      });
      if (result.modifiedCount && message.sendStartedAt) {
        await this.notifications.cancel(message, p.lease + p.hardMinimum);
      }
    }
    await this.db.model('OutboxMessage').updateMany({
      planRevision: { $exists: false },
      status: { $in: ['planned', 'leased'] },
    }, { $set: { status: 'cancelled' } });
    for (let count = 0; count < 25; count++) {
      const message = await this.db.model('OutboxMessage').findOneAndUpdate({
        planRevision: { $exists: true },
        status: 'planned',
        dueAt: { $lte: new Date() },
      }, {
        $set: {
          status: 'leased',
          leaseUntil: new Date(Date.now() + p.lease),
          leaseToken: randomUUID(),
        },
      }, {
        sort: {
          priority: -1,
          dueAt: 1,
        },
        new: true,
      }).lean();
      if (!message) {
        return;
      }
      await this.deliver(message);
    }
  }

  async deliver(message: OutboxMessage): Promise<void> {
    if (!message.leaseToken) {
      return;
    }
    const owned = {
      _id: message._id,
      status: 'leased',
      leaseToken: message.leaseToken,
    };
    const cancel = async (backoff = 0): Promise<void> => {
      const result = await this.db.model('OutboxMessage').updateOne(owned, {
        $set: { status: 'cancelled' },
        $unset: { leaseUntil: 1 },
      });
      if (result.modifiedCount) {
        await this.notifications.cancel(message, backoff);
      }
    };
    if (!await this.notifications.valid(message)) {
      await cancel();
      return;
    }
    const user = await this.db.model('User').findById(message.userId).lean();
    const period = await this.db.model('Period').findById(message.periodId).lean();
    const task = await this.db.model('Task').findById(message.primaryTaskId).lean();
    if (!user || !period || !task) {
      await cancel();
      return;
    }
    const category = ({
      check_in: 'on_check_in',
      series_check_in: 'on_check_in',
      reminder: 'on_reminder',
      fail: 'on_fail',
      absent: 'on_absent',
      check_in_missed: 'on_check_in_missed',
    })[message.kind];
    let feed = message.feedMessageId ? await this.db.model('FeedMessage').findById(message.feedMessageId).lean() : null;
    if (!feed) {
      const phrase = await this.phrases.pick(user, category, ['reminder', 'check_in', 'series_check_in', 'absent'].includes(message.kind) ? message.intensity : undefined, task.title, period.deadline);
      if (!phrase.text) {
        await cancel(p.emptyPoolBackoff);
        return;
      }
      const secondary = message.secondaryTaskId ? await this.db.model('Task').findById(message.secondaryTaskId).lean() : null;
      // One rated phrase, with an explicit primary subject for its buttons.
      const title = task.title.replace(/[\r\n]+/g, ' ');
      const text = `Про «${title}». ${phrase.text}` + (secondary ? ` И про «${secondary.title.replace(/[\r\n]+/g, ' ')}» я тоже помню.` : '');
      feed = (await this.db.model('FeedMessage').create({
        userId: user._id,
        periodId: period._id,
        taskTitle: task.title,
        category,
        ...phrase,
        text,
        ...(category === 'on_check_in' ? { checkIn: {} } : {}),
        draft: true,
        sentAt: new Date(),
      })).toObject();
      const attached = await this.db.model('OutboxMessage').updateOne({
        ...owned,
        leaseUntil: { $gt: new Date() },
      }, { $set: { feedMessageId: feed._id } });
      if (!attached.matchedCount) {
        return;
      }
    }
    const keyboard = new InlineKeyboard();
    if (category === 'on_check_in') {
      keyboard.text('Сделано', `a:${feed._id}:done`).text('Частично', `a:${feed._id}:partial`).text('Не начинал', `a:${feed._id}:not_started`).row();
    } else if (message.kind === 'reminder') {
      keyboard.text('Готово', `p:${period._id}:done`).text('Больше времени', `p:${period._id}:extend`).text('Сдаюсь', `p:${period._id}:surrender`).row();
    }
    keyboard.url('Ответить', `${this.miniAppLink()}?startapp=feed_${feed._id}`).row();
    if (rateableCategories.includes(category)) {
      keyboard.text('слабо', `r:${feed._id}:0`).text('неприятно', `r:${feed._id}:1`).text('в самое больное', `r:${feed._id}:2`);
    }
    let sent = false, releaseLease = false;
    try {
      const telegramMessageId = await this.telegram.send(user.telegramId, feed.text, keyboard, async (): Promise<void> => {
        const acquiredUntil = await this.db.transaction(async (session): Promise<number> => {
          if (!await this.notifications.valid(message, session)) {
            return 0;
          }
          const at = new Date(), until = new Date(at.getTime() + p.lease);
          // Writing the exact revision fences concurrent context signals in Mongo.
          const state = await this.db.model('TaskNotificationState').updateOne({
            _id: user._id,
            revision: message.planRevision,
            dirty: false,
            pendingOutboxId: message._id,
          }, {
            $set: {
              owner: message.leaseToken,
              leaseUntil: until,
            },
          }, { session });
          if (!state.matchedCount) {
            return 0;
          }
          const outbox = await this.db.model('OutboxMessage').updateOne({
            ...owned,
            leaseUntil: { $gt: at },
          }, {
            $set: {
              leaseUntil: until,
              sendStartedAt: at,
            },
          }, { session });
          if (!outbox.matchedCount) {
            throw new DeliveryDeferred();
          }
          const higher = await this.db.model('OutboxMessage').exists({
            userId: user._id,
            status: { $in: ['planned', 'leased'] },
            dueAt: { $lte: at },
            priority: { $gt: message.priority },
          }).session(session);
          if (higher) {
            throw new DeliveryDeferred();
          }
          const locked = await this.db.model('User').updateOne({
            _id: user._id,
            deleting: { $ne: true },
            botBlocked: false,
            onboarding: 'done',
            role: message.role,
            $and: [
              { $or: [{ lastSentAt: { $lte: new Date(at.getTime() - p.hardMinimum) } }, { lastSentAt: { $exists: false } }] },
              { $or: [{ sendLeaseUntil: { $lte: new Date(at.getTime() - p.hardMinimum) } }, { sendLeaseUntil: { $exists: false } }] },
            ],
          }, {
            $set: {
              sendLeaseToken: message.leaseToken,
              sendLeaseUntil: until,
            },
          }, { session });
          if (!locked.modifiedCount) {
            throw new DeliveryDeferred();
          }
          return until.getTime();
        });
        if (!acquiredUntil || acquiredUntil <= Date.now() + 10000) {
          releaseLease = acquiredUntil !== 0;
          await cancel();
          throw new DeliveryDeferred();
        }
      });
      sent = true;
      const sentAt = new Date();
      // This single transaction ties outbox, visible feed, history, cooldown and
      // series consumption together. Its sentAt predicate makes accounting repeatable.
      await this.notifications.recordSuccess(message, feed._id, telegramMessageId, sentAt);
      releaseLease = true;
      if (category === 'on_check_in') {
        await this.analytics.event('check_in_sent', user._id);
      }
    } catch (error) {
      if (error instanceof DeliveryDeferred) {
        await cancel();
        return;
      }
      // Never turn a post-send storage/analytics failure into a Telegram retry.
      if (sent) {
        throw error;
      }
      releaseLease = error instanceof TelegramFailure && error.status >= 400 && error.status < 500;
      if (releaseLease) {
        // Telegram explicitly rejected the request: it is not an unknown send.
        // Keep the token so this cannot erase a different worker's attempt.
        await this.db.model('OutboxMessage').updateOne({
          _id: message._id,
          leaseToken: message.leaseToken,
          sentAt: { $exists: false },
        }, { $unset: { sendStartedAt: 1 } });
      }
      if (error instanceof TelegramFailure && error.status === 403) {
        await this.db.model('User').updateOne({ _id: user._id }, { $set: { botBlocked: true } });
        await cancel();
        await this.analytics.event('bot_blocked', user._id);
      } else if (releaseLease) {
        // Explicit rejection: a future fresh decision may try again, subject to policy.
        await cancel(Math.max(p.hardMinimum, error instanceof TelegramFailure ? error.retryAfter * 1000 : 0));
      } else {
        await cancel(p.lease + p.hardMinimum);
      }
    } finally {
      if (releaseLease) {
        await this.db.model('User').updateOne({
          _id: user._id,
          sendLeaseToken: message.leaseToken,
        }, {
          $unset: {
            sendLeaseToken: 1,
            sendLeaseUntil: 1,
          },
        });
      }
    }
  }

  miniAppLink(): string {
    return this.config.botUrl;
  }
}
