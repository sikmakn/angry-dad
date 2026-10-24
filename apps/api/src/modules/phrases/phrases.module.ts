import { OwnerPhrasesController } from './controllers/owner-phrases.controller';
import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AiModule } from '../ai/ai.module';
import { PhrasesService } from './phrases.service';
@Module({
  controllers: [OwnerPhrasesController],
  imports: [AnalyticsModule, AiModule],
  providers: [PhrasesService],
  exports: [PhrasesService],
})
export class PhrasesModule {
}
