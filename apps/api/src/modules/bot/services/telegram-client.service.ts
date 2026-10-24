import { Injectable } from '@nestjs/common';
import { Api, InputFile, InlineKeyboard } from 'grammy';
import type { InlineKeyboardMarkup } from 'grammy/types';
import { randomUUID } from 'node:crypto';
import { AppConfigService } from '../../../config/app-config.service';
export class TelegramFailure extends Error {
  constructor(readonly status: number, readonly retryAfter = 1) {
    super('Telegram request failed');
  }
}
export interface StarHistoryTransaction {
  id: string;
  amount: number;
  nanostarAmount: number;
  date: number;
  incomingInvoice?: { telegramId: number;
    payload?: string; };
  outgoing: boolean;
}
export abstract class TelegramClient {
  abstract send(chatId: number, text: string, keyboard?: InlineKeyboardMarkup, beforeSend?: () => Promise<void>, parseMode?: 'HTML'): Promise<number>;
  abstract invoice(payload: string, strikes: number, price: number): Promise<string>;
  abstract preCheckout(id: string, ok: boolean): Promise<void>;
  abstract refund(telegramId: number, chargeId: string): Promise<void>;
  abstract getStarTransactions(offset: number, limit: number): Promise<StarHistoryTransaction[]>;
  abstract answerCallback(id: string, text?: string): Promise<void>;
  abstract editKeyboard(chatId: number, messageId: number, keyboard: InlineKeyboardMarkup): Promise<void>;
  abstract prepare(telegramId: number, png: Buffer): Promise<string>;
}
@Injectable()
export class ConfiguredTelegramClient extends TelegramClient {
  readonly sent: {
    chatId: number;
    text: string;
    keyboard?: InlineKeyboardMarkup;
  }[] = [];

  private readonly api: Api;
  private nextSendAt = 0;
  private readonly chats = new Map<number, number>();
  constructor(private readonly config: AppConfigService) {
    super();
    this.api = new Api(config.botToken, { timeoutSeconds: 10 });
  }

  async send(chatId: number, text: string, keyboard?: InlineKeyboardMarkup, beforeSend?: () => Promise<void>, parseMode?: 'HTML'): Promise<number> {
    if (this.config.testClients) {
      await beforeSend?.();
      this.sent.push({
        chatId,
        text,
        keyboard,
      });
      return this.sent.length;
    }
    const at = Math.max(Date.now(), this.nextSendAt, this.chats.get(chatId) ?? 0);
    this.nextSendAt = at + 40;
    this.chats.set(chatId, at + 1000);
    await new Promise<void>(resolve => setTimeout(resolve, Math.max(0, at - Date.now())));
    // Scheduled delivery acquires its MongoDB lease after the local queue wait.
    // Keep this outside the Telegram error wrapper so a denied lease is not retried as an API failure.
    await beforeSend?.();
    try {
      return (await this.api.sendMessage(chatId, text, {
        reply_markup: keyboard,
        parse_mode: parseMode,
      })).message_id;
    } catch (error) {
      const failure = error as {
        error_code?: number;
        parameters?: {
          retry_after?: number;
        };
      };
      throw new TelegramFailure(failure.error_code ?? 503, failure.parameters?.retry_after ?? 1);
    }
  }

  async invoice(payload: string, strikes: number, price: number): Promise<string> {
    if (this.config.testClients) {
      return `https://t.me/$test_${payload}`;
    }
    return this.api.createInvoiceLink('Огрызнуться', `Огрызнуться: ${strikes} ${strikes % 10 >= 2 && strikes % 10 <= 4 && (strikes % 100 < 12 || strikes % 100 > 14) ? 'раза' : 'раз'} в перепалке`, payload, '', 'XTR', [{
      label: 'Огрызнуться',
      amount: price,
    }]);
  }

  async preCheckout(id: string, ok: boolean): Promise<void> {
    if (!this.config.testClients) {
      await this.api.answerPreCheckoutQuery(id, ok, ok ? undefined : { error_message: 'Счёт больше недоступен' });
    }
  }

  async refund(telegramId: number, chargeId: string): Promise<void> {
    if (!this.config.testClients) {
      await this.api.refundStarPayment(telegramId, chargeId);
    }
  }

  async getStarTransactions(offset: number, limit: number): Promise<StarHistoryTransaction[]> {
    if (this.config.testClients) {
      return [];
    }
    const result = await this.api.getStarTransactions({
      offset,
      limit: Math.min(100, Math.max(1, limit)),
    });
    return result.transactions.map(row => ({
      id: row.id,
      amount: row.amount,
      nanostarAmount: row.nanostar_amount ?? 0,
      date: row.date,
      incomingInvoice: row.source?.type === 'user' && row.source.transaction_type === 'invoice_payment' && !row.receiver
        ? {
            telegramId: row.source.user.id,
            payload: row.source.invoice_payload,
          }
        : undefined,
      outgoing: row.receiver !== undefined,
    }));
  }

  async answerCallback(id: string, text?: string): Promise<void> {
    if (!this.config.testClients) {
      await this.api.answerCallbackQuery(id, { text });
    }
  }

  async editKeyboard(chatId: number, messageId: number, keyboard: InlineKeyboardMarkup): Promise<void> {
    if (!this.config.testClients) {
      await this.api.editMessageReplyMarkup(chatId, messageId, { reply_markup: keyboard });
    }
  }

  async prepare(telegramId: number, png: Buffer): Promise<string> {
    if (this.config.testClients) {
      return `test_${randomUUID()}`;
    }
    const photo = await this.api.sendPhoto(this.config.ownerId, new InputFile(png, 'card.png'), { disable_notification: true });
    const fileId = photo.photo[photo.photo.length - 1].file_id;
    const prepared = await this.api.savePreparedInlineMessage(telegramId, {
      type: 'photo',
      id: randomUUID(),
      photo_file_id: fileId,
      caption: this.config.botUrl,
      reply_markup: new InlineKeyboard().url('Батя', this.config.botUrl),
    }, {
      allow_user_chats: true,
      allow_group_chats: true,
      allow_channel_chats: true,
    });
    await this.api.deleteMessage(this.config.ownerId, photo.message_id);
    return prepared.id;
  }
}
