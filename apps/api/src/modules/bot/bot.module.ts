import { WebhookBotController } from './controllers/webhook-bot.controller';
import { Module } from '@nestjs/common';
import { TaskNotificationsModule } from '../task-notifications/task-notifications.module';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { PhrasesModule } from '../phrases/phrases.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { PaymentsModule } from '../payments/payments.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TelegramClientModule } from './services/telegram-client.module';
import { BotService } from './bot.service';
import { TelegramUpdateReceiver } from './services/telegram-update-receiver.service';
@Module({
  controllers: [WebhookBotController],
  imports: [TaskNotificationsModule, UsersModule, TasksModule, PhrasesModule, DeliveryModule, PaymentsModule, AnalyticsModule, TelegramClientModule],
  providers: [BotService, TelegramUpdateReceiver],
  exports: [BotService],
})
export class BotModule {
}
