import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { PhraseParaphrasesGenerated, SupportTicketStatusChanged, TaskCreated, UserActivityObserved } from '../../../common/events/application-events';
import { DatabaseService } from '../../../database/database.service';
import { AnalyticsService } from '../analytics.service';
import { UserStatisticsService } from '../services/user-statistics.service';
@Injectable()
export class AnalyticsEventsListener {
  private readonly logger = new Logger(AnalyticsEventsListener.name);
  constructor(private readonly db: DatabaseService, private readonly statistics: UserStatisticsService, private readonly analytics: AnalyticsService) { }

  @OnEvent('phrase.paraphrases.generated', { async: true })
  async paraphrasesGenerated(event: PhraseParaphrasesGenerated): Promise<void> {
    try {
      await this.analytics.journal('paraphrase_generate', undefined, event.phraseId, {
        count: event.count,
        generatedIds: event.generatedIds,
      }, undefined, { at: new Date(event.at) });
    } catch (error) {
      this.logger.error(`phrase.paraphrases.generated: ${error instanceof Error ? error.name : 'unknown'}`);
    }
  }

  @OnEvent('support.ticket.status.changed', { async: true })
  async supportTicketStatusChanged(event: SupportTicketStatusChanged): Promise<void> {
    try {
      await this.analytics.journal('support_ticket_status_changed', event.userId, event.ticketId, {
        from: event.from,
        to: event.to,
      }, undefined, {
        at: new Date(event.at),
        targetTelegramId: event.telegramId,
      });
    } catch (error) {
      this.logger.error(`support.ticket.status.changed: ${error instanceof Error ? error.name : 'unknown'}`);
    }
  }

  @OnEvent('task.created', { async: true })
  async taskCreated(event: TaskCreated): Promise<void> {
    try {
      const at = new Date(event.createdAt);
      await this.db.transaction(async (session) => {
        if (await this.statistics.firstTask(event.userId, at, session)) {
          await this.analytics.event('task_created', event.userId, { size: event.size }, session, at);
        }
      });
    } catch (error) {
      this.logger.error(`task.created: ${error instanceof Error ? error.name : 'unknown'}`);
    }
  }

  @OnEvent('user.activity.observed', { async: true })
  async activityObserved(event: UserActivityObserved): Promise<void> {
    try {
      await this.statistics.activity(event.userId, event.starts, undefined, new Date(event.at));
    } catch (error) {
      this.logger.error(`user.activity.observed: ${error instanceof Error ? error.name : 'unknown'}`);
    }
  }
}
