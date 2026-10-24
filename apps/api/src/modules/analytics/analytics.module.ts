import { OwnerAnalyticsController } from './controllers/owner-analytics.controller';
import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { UserStatisticsService } from './services/user-statistics.service';
import { EngagementMetricsService } from './services/engagement-metrics.service';
import { TurnEconomicsService } from './services/turn-economics.service';
import { AnalyticsEventsListener } from './listeners/analytics-events.listener';
@Module({
  controllers: [OwnerAnalyticsController],
  providers: [AnalyticsService, UserStatisticsService, EngagementMetricsService, TurnEconomicsService, AnalyticsEventsListener],
  exports: [AnalyticsService],
})
export class AnalyticsModule {
}
