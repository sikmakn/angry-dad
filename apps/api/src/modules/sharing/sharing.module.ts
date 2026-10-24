import { UserSharingController } from './controllers/user-sharing.controller';
import { Module } from '@nestjs/common';
import { PhrasesModule } from '../phrases/phrases.module';
import { BattleModule } from '../battle/battle.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TelegramClientModule } from '../bot/services/telegram-client.module';
import { SharingService } from './sharing.service';
@Module({
  controllers: [UserSharingController],
  imports: [PhrasesModule, BattleModule, AnalyticsModule, TelegramClientModule],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {
}
