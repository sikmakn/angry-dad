import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventsModule } from './common/events/events.module';
import { UserActivityInterceptor } from './modules/users/interceptors/user-activity.interceptor';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ApiError } from './common/errors/api-error';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { UsersModule } from './modules/users/users.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PressureModule } from './modules/pressure/pressure.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { RespectModule } from './modules/respect/respect.module';
import { PhrasesModule } from './modules/phrases/phrases.module';
import { BattleModule } from './modules/battle/battle.module';
import { StrikesModule } from './modules/strikes/strikes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SharingModule } from './modules/sharing/sharing.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { BotModule } from './modules/bot/bot.module';
@Module({
  imports: [ConfigModule, DatabaseModule, EventsModule, UsersModule, AiModule, AnalyticsModule, TasksModule, PressureModule, DeliveryModule, RespectModule, PhrasesModule, BattleModule, StrikesModule, PaymentsModule, SharingModule, LeaderboardModule, BotModule],
  providers: [{
    provide: APP_INTERCEPTOR,
    useClass: UserActivityInterceptor,
  }, {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  }, {
    provide: APP_PIPE,
    useFactory: () => new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
      exceptionFactory: () => ApiError.invalidRequest(),
    }),
  }],
})
export class AppModule {
}
