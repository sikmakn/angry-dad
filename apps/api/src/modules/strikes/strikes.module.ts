import { OwnerStrikesController } from './controllers/owner-strikes.controller';
import { UserStrikesController } from './controllers/user-strikes.controller';
import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { StrikesService } from './strikes.service';
@Module({
  controllers: [OwnerStrikesController, UserStrikesController],
  imports: [AnalyticsModule],
  providers: [StrikesService],
  exports: [StrikesService],
})
export class StrikesModule {
}
