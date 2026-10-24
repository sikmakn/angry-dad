import { OwnerPaymentsController } from './controllers/owner-payments.controller';
import { UserPaymentsController } from './controllers/user-payments.controller';
import { Module } from '@nestjs/common';
import { StrikesModule } from '../strikes/strikes.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TelegramClientModule } from '../bot/services/telegram-client.module';
import { PaymentsService } from './payments.service';
import { PaymentReconciliationService } from './services/payment-reconciliation.service';
@Module({
  controllers: [OwnerPaymentsController, UserPaymentsController],
  imports: [StrikesModule, AnalyticsModule, TelegramClientModule],
  providers: [PaymentsService, PaymentReconciliationService],
  exports: [PaymentsService, PaymentReconciliationService],
})
export class PaymentsModule {
}
