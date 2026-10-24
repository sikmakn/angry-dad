import { BotError } from './bot.errors';
import { TelegramUpdateReceiver } from './services/telegram-update-receiver.service';
import { NotificationStateService } from '../task-notifications/services/notification-state.service';
import { Injectable } from '@nestjs/common';
import { ratingFeedback } from '../phrases/rating-feedback';
import { Bot } from 'grammy';
import type { Update } from 'grammy/types';
import { timingSafeEqual } from 'node:crypto';
import { AppConfigService } from '../../config/app-config.service';
import { DatabaseService } from '../../database/database.service';
import { ApiError } from '../../common/errors/api-error';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { PhrasesService } from '../phrases/phrases.service';
import { DeliveryService } from '../delivery/delivery.service';
import { PaymentsService } from '../payments/payments.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { TelegramClient } from './services/telegram-client.service';
@Injectable()
export class BotService {
  private readonly bot: Bot;
  constructor(private readonly config: AppConfigService, private readonly db: DatabaseService, private readonly users: UsersService, private readonly tasks: TasksService, private readonly phrases: PhrasesService, private readonly delivery: DeliveryService, private readonly payments: PaymentsService, private readonly analytics: AnalyticsService, private readonly telegram: TelegramClient, private readonly receiver: TelegramUpdateReceiver, private readonly notifications: NotificationStateService) {
    this.bot = new Bot(config.botToken, {
      botInfo: {
        id: Number(config.botToken.split(':')[0]),
        is_bot: true,
        first_name: 'Батя',
        username: 'angry_dad_bot',
        can_join_groups: false,
        can_read_all_group_messages: false,
        supports_inline_queries: false,
        can_connect_to_business: false,
        has_main_web_app: true,
        has_topics_enabled: false,
        allows_users_to_create_topics: false,
        can_manage_bots: false,
        supports_join_request_queries: false,
      },
    });
    this.bot.on('pre_checkout_query', async (ctx) => {
      const query = ctx.preCheckoutQuery;
      await this.payments.preCheckout(query.id, query.from.id, query.invoice_payload, query.currency, query.total_amount);
    });
    this.bot.on('message:successful_payment', async (ctx) => {
      const payment = ctx.message.successful_payment;
      await this.payments.successful(ctx.from.id, payment.invoice_payload, payment.currency, payment.total_amount, payment.telegram_payment_charge_id);
    });
    this.bot.on('my_chat_member', async (ctx) => {
      if (ctx.myChatMember.chat.type !== 'private') {
        return;
      }
      const blocked = ['kicked', 'left'].includes(ctx.myChatMember.new_chat_member.status);
      await this.db.transaction(async (session) => {
        const user = await this.db.model('User').findOneAndUpdate({
          telegramId: ctx.myChatMember.chat.id,
          deleting: { $ne: true },
          botBlocked: { $ne: blocked },
        }, { $set: { botBlocked: blocked } }, {
          session,
          new: true,
        }).lean();
        if (user) {
          if (blocked) {
            await this.analytics.event('bot_blocked', user._id, undefined, session);
          }
          await this.notifications.signal(user._id, session);
        }
      });
    });
    this.bot.on('callback_query:data', async (ctx) => {
      const at = new Date();
      if (ctx.callbackQuery.message?.chat.type !== 'private' || ctx.callbackQuery.message.chat.id !== ctx.from.id) {
        await this.telegram.answerCallback(ctx.callbackQuery.id, 'Недоступно');
        return;
      }
      const user = await this.users.authenticate({
        id: ctx.from.id,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
      });
      if (ctx.callbackQuery.message?.chat.id !== ctx.from.id || user.onboarding !== 'done') {
        await this.telegram.answerCallback(ctx.callbackQuery.id, 'Недоступно');
        return;
      }
      const [kind, id, value] = ctx.callbackQuery.data.split(':');
      const valid = (kind === 'a' && ['done', 'partial', 'not_started'].includes(value)) || (kind === 'p' && ['done', 'extend', 'surrender', 'confirm_surrender'].includes(value)) || (kind === 'r' && ['0', '1', '2'].includes(value));
      if (valid && id) {
        const owned = await this.db.model(kind === 'p' ? 'Period' : 'FeedMessage').exists({
          _id: id,
          userId: user._id,
        });
        if (owned) {
          await this.users.observeActivity(user._id, false, at);
        }
      }
      try {
        if (kind === 'a' && ['done', 'partial', 'not_started'].includes(value)) {
          const result = await this.delivery.answer(user, id, value as 'done' | 'partial' | 'not_started');
          if (result.reply) {
            await this.telegram.send(user.telegramId, result.reply);
          }
        } else if (kind === 'p' && ['done', 'extend', 'surrender', 'confirm_surrender'].includes(value)) {
          if (value === 'surrender') {
            await this.telegram.send(user.telegramId, 'Точно сдаёшься?', {
              inline_keyboard: [[{
                text: 'Да, сдаюсь',
                callback_data: `p:${id}:confirm_surrender`,
              }]],
            });
            await this.telegram.answerCallback(ctx.callbackQuery.id);
            return;
          }
          const result = await this.tasks.action(user, id, (value === 'confirm_surrender' ? 'surrender' : value) as 'done' | 'extend' | 'surrender');
          if (result.reply) {
            await this.telegram.send(user.telegramId, result.reply);
          }
        } else if (kind === 'r' && ['0', '1', '2'].includes(value)) {
          await this.phrases.rate(user._id, id, Number(value) as 0 | 1 | 2);
          await this.telegram.answerCallback(ctx.callbackQuery.id, ratingFeedback[Number(value) as 0 | 1 | 2]);
          await this.delivery.refreshRating(user._id, id);
          return;
        }
        await this.telegram.answerCallback(ctx.callbackQuery.id);
      } catch (error) {
        if (!(error instanceof ApiError)) {
          throw error;
        }
        await this.telegram.answerCallback(ctx.callbackQuery.id, error.code === 'already_rated' ? 'Уже оценено' : 'Задача уже закрыта');
      }
    });
    this.bot.on('message:text', async (ctx) => {
      const at = new Date();
      if (ctx.chat.type !== 'private' || ctx.chat.id !== ctx.from.id) {
        return;
      }
      const user = await this.users.authenticate({
        id: ctx.from.id,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
      });
      const text = ctx.message.text;
      await this.users.observeActivity(user._id, /^\/start(?:@\w+)?(?:\s|$)/.test(text), at);
      if (text.startsWith('/start')) {
        const phrase = user.onboarding === 'done'
          ? (user.role === 'mother' ? 'Снова начинаем. Я не удивлена.' : 'Снова начинаем. Я не удивлён.')
          : (await this.phrases.pick({
              ...user,
              role: 'father',
              gender: 'male',
            }, 'on_greeting')).text;
        await this.telegram.send(user.telegramId, phrase || 'Откройте приложение и выберите родителя.', {
          inline_keyboard: [[{
            text: 'Открыть',
            web_app: { url: this.config.miniAppUrl },
          }]],
        });
      } else if (text.startsWith('/terms')) {
        await this.telegram.send(user.telegramId, 'Тексты задач и реплики перепалки передаются внешнему ИИ. Выполнение задач засчитывается с Ваших слов. Одна отправленная реплика в перепалке — один раз огрызнуться. Возврат оплаты возможен для целиком неиспользованного пакета. /paysupport — помощь по оплате.');
      } else if (text.startsWith('/paysupport')) {
        await this.payments.support(user, text.slice('/paysupport'.length).trim() || 'Обращение по оплате', {
          botId: ctx.me.id,
          updateId: ctx.update.update_id,
        });
        await this.telegram.send(user.telegramId, 'Обращение по оплате сохранено.');
      }
    });
  }

  async receive(secret: string | undefined, body: Record<string, unknown>): Promise<{
    ok: boolean;
  }> {
    const expected = Buffer.from(this.config.webhookSecret), actual = Buffer.from(secret ?? '');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw ApiError.unauthorized();
    }
    if (!Number.isSafeInteger(body.update_id) || (body.update_id as number) < 0) {
      throw ApiError.invalidRequest();
    }
    const id = body.update_id as number;
    try {
      await this.receiver.receive(this.bot.botInfo.id, id, () => this.bot.handleUpdate(body as unknown as Update));
    } catch {
      throw new BotError(503, 'payment_gateway_unavailable');
    }
    return { ok: true };
  }
}
