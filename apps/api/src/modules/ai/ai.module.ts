import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AiService } from './ai.service';
import { AiProvider, ConfiguredAiProvider } from './services/ai-provider.service';
@Module({
  imports: [AnalyticsModule],
  providers: [AiService, {
    provide: AiProvider,
    useClass: ConfiguredAiProvider,
  }],
  exports: [AiService],
})
export class AiModule {
}
