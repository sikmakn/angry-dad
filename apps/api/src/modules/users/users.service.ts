import { UsersError } from './users.errors';
import { NotificationStateService } from '../task-notifications/services/notification-state.service';
import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { DatabaseService } from '../../database/database.service';
import { AppConfigService } from '../../config/app-config.service';
import { ApiError } from '../../common/errors/api-error';
import { present } from '../../common/utils/presentation';
import type { User } from '../../database/schemas/user.schema';
import { AnalyticsService } from '../analytics/analytics.service';
import { EventPublisher } from '../../common/events/event-publisher.service';
import { TelegramClient } from '../bot/services/telegram-client.service';
import type { TelegramIdentity } from './services/telegram-auth.service';
import type { MeResponseView, OnboardingResponseView, OnboardingRequestView, UpdateMeRequestView, OwnerUserResponseView } from './users.types';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly db: DatabaseService, private readonly config: AppConfigService, private readonly analytics: AnalyticsService, private readonly notifications: NotificationStateService, private readonly events: EventPublisher, private readonly telegram: TelegramClient) { }
  async observeActivity(userId: string, starts: boolean, at = new Date()): Promise<void> {
    const observedAt = new Date(at);
    const user = await this.db.model('User').updateOne({
      _id: userId,
      deleting: { $ne: true },
    }, { $max: { lastActivityAt: observedAt } });
    if (user.matchedCount) {
      this.events.publish('user.activity.observed', {
        userId,
        starts,
        at: observedAt.toISOString(),
      });
    }
  }

  async authenticate(identity: TelegramIdentity): Promise<User> {
    const result = await this.db.model('User').findOneAndUpdate({ telegramId: identity.id }, {
      $set: {
        ...(identity.username !== undefined ? { username: identity.username } : {}),
        ...(identity.first_name !== undefined ? { firstName: identity.first_name } : {}),
      },
      $setOnInsert: {
        lastActivityAt: new Date(),
        onboarding: 'guest',
        timeZone: 'Europe/Moscow',
        quietHours: {
          start: 1320,
          end: 540,
        },
        respect: 12,
        respectFromBreak: false,
        inLeaderboard: true,
        closedCount: 0,
        closedCountAt: new Date(),
        botBlocked: false,
      },
    }, {
      upsert: true,
      new: true,
      includeResultMetadata: true,
    }).lean() as unknown as {
      value: User | null;
      lastErrorObject?: { updatedExisting?: boolean };
    };
    const user = result.value;
    if (!user || user.deleting) {
      throw ApiError.unauthorized();
    }
    if (!result.lastErrorObject?.updatedExisting) {
      void this.notifyOwnerAboutNewUser(user);
    }
    return user;
  }

  // Upsert атомарен: вставка происходит ровно один раз, поэтому уведомление не дублируется.
  // Ошибка отправки не должна ломать вход пользователя.
  private async notifyOwnerAboutNewUser(user: User): Promise<void> {
    try {
      if (user.telegramId === this.config.ownerId) {
        return;
      }
      const total = await this.db.model('User').countDocuments({ deleting: { $ne: true } });
      const name = user.firstName?.trim() || 'без имени';
      const lines = [
        'Новый пользователь в боте',
        `Имя: ${name}`,
        ...(user.username ? [`Username: @${user.username}`] : []),
        `Telegram ID: ${user.telegramId}`,
        `Всего пользователей: ${total}`,
      ];
      await this.telegram.send(this.config.ownerId, lines.join('\n'));
    } catch (error) {
      this.logger.warn(`Не удалось уведомить владельца о новом пользователе: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async me(user: User): Promise<MeResponseView> {
    const result = present<MeResponseView>(user, ['id', 'username', 'firstName', 'onboarding', 'role', 'gender', 'timeZone', 'quietHours', 'respect', 'inLeaderboard', 'closedCount', 'closedCountAt']);
    result.isOwner = user.telegramId === this.config.ownerId;
    if (user.onboarding === 'guest') {
      result.returning = Boolean(await this.db.model('DeletedUser').exists({ telegramIdHash: this.hash(user.telegramId) }));
    }
    return result;
  }

  async onboarding(user: User, input: OnboardingRequestView): Promise<OnboardingResponseView> {
    // Тихие часы при старте обязательны.
    if (!input.quietHours) {
      throw ApiError.invalidRequest();
    }
    this.validateSettings(input);
    const updated = await this.db.transaction(async (session) => {
      const row = await this.db.model('User').findOneAndUpdate({
        _id: user._id,
        onboarding: 'guest',
        deleting: { $ne: true },
      }, {
        $set: {
          ...input,
          onboarding: 'done',
          respect: 12,
        },
      }, {
        session,
        new: true,
      }).lean();
      if (row) {
        await this.analytics.event('onboarding_done', user._id, undefined, session);
        await this.notifications.signal(user._id, session);
      }
      return row;
    });
    if (!updated) {
      throw new UsersError(409, 'already_onboarded');
    }
    return {
      user: await this.me(updated),
      replies: ['Соболезнуем Вам. Крепитесь…', 'Опять ничего сам не можешь? Ну, что тебе надо сделать?', 'Мечты сюда не пиши. Витать в облаках - не работа. Что нужно сделать, чётко?'].map(text => input.gender === 'female' ? text.replace('сам ', 'сама ') : text),
    };
  }

  async update(user: User, input: UpdateMeRequestView): Promise<MeResponseView> {
    this.validateSettings(input);
    const updated = await this.db.transaction(async (session) => {
      const row = await this.db.model('User').findOneAndUpdate({
        _id: user._id,
        deleting: { $ne: true },
      }, { $set: input }, {
        new: true,
        session,
      }).lean();
      if (row && (input.role !== undefined || input.gender !== undefined || input.quietHours !== undefined || input.timeZone !== undefined)) {
        await this.notifications.signal(user._id, session);
      }
      return row;
    });
    if (!updated) {
      throw ApiError.notFound();
    }
    return this.me(updated);
  }

  async ownerUser(telegramId: number): Promise<OwnerUserResponseView> {
    const user = await this.byTelegram(telegramId);
    return present(user, ['telegramId', 'username', 'firstName']);
  }

  async byTelegram(telegramId: number): Promise<User> {
    const user = await this.db.model('User').findOne({
      telegramId,
      deleting: { $ne: true },
    }).lean();
    if (!user) {
      throw ApiError.notFound();
    }
    return user;
  }

  hash(telegramId: number): string {
    return createHmac('sha256', this.config.deletionSalt).update(String(telegramId)).digest('hex');
  }

  private validateSettings(input: UpdateMeRequestView): void {
    if (input.quietHours) {
      const { start, end } = input.quietHours;
      if (![start, end].every(value => Number.isInteger(value) && value >= 0 && value <= 1410 && value % 30 === 0)) {
        throw ApiError.invalidRequest();
      }
    }
    if (input.timeZone !== undefined) {
      try {
        new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).format();
      } catch {
        throw ApiError.invalidRequest();
      }
    }
  }
}
