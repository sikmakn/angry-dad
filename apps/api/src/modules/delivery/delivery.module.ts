import { FeedService } from './services/feed.service';
import { DispatcherService } from './services/dispatcher.service';
import { UserDeliveryController } from './controllers/user-delivery.controller';
import { Module } from '@nestjs/common';
import { TaskNotificationsModule } from '../task-notifications/task-notifications.module';
import { PhrasesModule } from '../phrases/phrases.module';
import { TasksModule } from '../tasks/tasks.module';
import { PressureModule } from '../pressure/pressure.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TelegramClientModule } from '../bot/services/telegram-client.module';
import { DeliveryService } from './delivery.service';
@Module({
  controllers: [UserDeliveryController],
  imports: [TaskNotificationsModule, PhrasesModule, TasksModule, PressureModule, AnalyticsModule, TelegramClientModule],
  providers: [FeedService, DispatcherService, DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {
}
