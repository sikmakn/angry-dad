import { Module } from '@nestjs/common';
import { TaskNotificationsModule } from '../task-notifications/task-notifications.module';
import { PressureService } from './pressure.service';
@Module({
  imports: [TaskNotificationsModule],
  providers: [PressureService],
  exports: [PressureService],
})
export class PressureModule {
}
