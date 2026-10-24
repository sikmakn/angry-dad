import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskNotificationStateSchema } from './schemas/task-notification-state.schema';
@Module({
  imports: [MongooseModule.forFeature([{
    name: 'TaskNotificationState',
    schema: TaskNotificationStateSchema,
  }])],
  exports: [MongooseModule],
})
export class TaskNotificationDatabaseModule { }
