import { Injectable } from '@nestjs/common';
import type { User } from '../../database/schemas/user.schema';
import type { FeedMessage } from '../../database/schemas/feed-message.schema';
import type { PageInput } from '../../common/utils/presentation';
import type { FeedMessageResponseView, FeedListResponseView } from './delivery.types';
import type { PeriodActionResponseView } from '../tasks/tasks.types';
import { FeedService } from './services/feed.service';
import { DispatcherService } from './services/dispatcher.service';
import { DatabaseService } from '../../database/database.service';
import { AppConfigService } from '../../config/app-config.service';
import { TelegramClient } from '../bot/services/telegram-client.service';
import { notificationKeyboard } from './helpers/notification-keyboard';
import { rateableCategories } from '../phrases/phrases.service';
@Injectable()
export class DeliveryService {
  constructor(private readonly feed: FeedService, private readonly dispatcher: DispatcherService, private readonly db: DatabaseService, private readonly config: AppConfigService, private readonly telegram: TelegramClient) { }

  async refreshRating(userId: string, feedId: string): Promise<void> {
    const feed = await this.db.model('FeedMessage').findOne({
      _id: feedId,
      userId,
    }).lean();
    const user = await this.db.model('User').findById(userId).lean();
    if (!feed?.telegramMessageId || !user) {
      return;
    }
    try {
      await this.telegram.editKeyboard(user.telegramId, feed.telegramMessageId, notificationKeyboard(this.config.miniAppUrl, feedId, rateableCategories.includes(feed.category), feed.rating));
    } catch {
      // A failed markup refresh must not turn a committed vote into a failed write.
      console.warn('Telegram rating keyboard refresh was not confirmed');
    }
  }

  view(feed: FeedMessage): FeedMessageResponseView {
    return this.feed.view(feed);
  }

  async get(userId: string, id: string): Promise<FeedMessageResponseView> {
    return this.feed.get(userId, id);
  }

  async markRead(userId: string, id: string): Promise<FeedMessageResponseView> {
    return this.feed.markRead(userId, id);
  }

  async list(userId: string, input: PageInput & {
    periodId?: string;
    category?: string;
  }): Promise<FeedListResponseView> {
    return this.feed.list(userId, input);
  }

  async answer(user: User, id: string, answer: 'done' | 'partial' | 'not_started'): Promise<PeriodActionResponseView> {
    return this.feed.answer(user, id, answer);
  }

  async dispatch(): Promise<void> {
    return this.dispatcher.dispatch();
  }
}
