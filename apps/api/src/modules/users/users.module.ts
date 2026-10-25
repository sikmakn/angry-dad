import { OwnerUsersController } from './controllers/owner-users.controller';
import { UserUsersController } from './controllers/user-users.controller';
import { Global, Module } from '@nestjs/common';
import { TaskNotificationsModule } from '../task-notifications/task-notifications.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TelegramClientModule } from '../bot/services/telegram-client.module';
import { UsersService } from './users.service';
import { TelegramAuthService } from './services/telegram-auth.service';
import { AccountDeletionService } from './services/account-deletion.service';
import { TelegramAuthGuard } from './guards/telegram-auth.guard';
import { OwnerGuard } from './guards/owner.guard';
import { OnboardedGuard } from './guards/onboarded.guard';
@Global()
@Module({
  controllers: [OwnerUsersController, UserUsersController],
  imports: [TaskNotificationsModule, AnalyticsModule, TelegramClientModule],
  providers: [UsersService, TelegramAuthService, AccountDeletionService, TelegramAuthGuard, OwnerGuard, OnboardedGuard],
  exports: [TelegramAuthService, UsersService, AccountDeletionService, TelegramAuthGuard, OwnerGuard, OnboardedGuard],
})
export class UsersModule {
}
