import { BattleStoreService } from './services/battle-store.service';
import { TurnService } from './services/turn.service';
import { TurnRecoveryService } from './services/turn-recovery.service';
import { OwnerBattleController } from './controllers/owner-battle.controller';
import { UserBattleController } from './controllers/user-battle.controller';
import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { StrikesModule } from '../strikes/strikes.module';
import { RespectModule } from '../respect/respect.module';
import { PhrasesModule } from '../phrases/phrases.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { BattleService } from './battle.service';
@Module({
  controllers: [OwnerBattleController, UserBattleController],
  imports: [AiModule, StrikesModule, RespectModule, PhrasesModule, AnalyticsModule],
  providers: [BattleStoreService, TurnService, TurnRecoveryService, BattleService],
  exports: [BattleService],
})
export class BattleModule {
}
