import { Module } from '@nestjs/common';
import { TaskNotificationDatabaseModule } from '../../database/task-notification-database.module';
import { RespectModule } from '../respect/respect.module';
import { TaskNotificationsService } from './task-notifications.service';
import { NotificationStateService } from './services/notification-state.service';
import { NotificationContextService } from './services/notification-context.service';
@Module({
  imports: [TaskNotificationDatabaseModule, RespectModule],
  providers: [TaskNotificationsService, NotificationStateService, NotificationContextService],
  exports: [TaskNotificationsService, NotificationStateService],
})
export class TaskNotificationsModule { }
