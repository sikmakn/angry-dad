import { TaskReaderService } from './services/task-reader.service';
import { PeriodsService } from './services/periods.service';
import { DeadlineSweeperService } from './services/deadline-sweeper.service';
import { UserTasksController } from './controllers/user-tasks.controller';
import { Module } from '@nestjs/common';
import { TaskNotificationsModule } from '../task-notifications/task-notifications.module';
import { RespectModule } from '../respect/respect.module';
import { PhrasesModule } from '../phrases/phrases.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TasksService } from './tasks.service';
import { RecurrenceService } from './services/recurrence.service';
@Module({
  controllers: [UserTasksController],
  imports: [TaskNotificationsModule, RespectModule, PhrasesModule, AnalyticsModule],
  providers: [TaskReaderService, PeriodsService, DeadlineSweeperService, TasksService, RecurrenceService],
  exports: [TasksService, RecurrenceService],
})
export class TasksModule {
}
