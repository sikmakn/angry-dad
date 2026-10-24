import { Injectable } from '@nestjs/common';
import type { User } from '../../database/schemas/user.schema';
import type { FeedMessage } from '../../database/schemas/feed-message.schema';
import type { PageInput } from '../../common/utils/presentation';
import type { FeedMessageResponseView, FeedListResponseView } from './delivery.types';
import type { PeriodActionResponseView } from '../tasks/tasks.types';
import { FeedService } from './services/feed.service';
import { DispatcherService } from './services/dispatcher.service';
@Injectable()
export class DeliveryService {
  constructor(private readonly feed: FeedService, private readonly dispatcher: DispatcherService) { }
  view(feed: FeedMessage): FeedMessageResponseView {
    return this.feed.view(feed);
  }

  async get(userId: string, id: string): Promise<FeedMessageResponseView> {
    return this.feed.get(userId, id);
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
