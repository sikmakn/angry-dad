import { SeedService } from './seed.service';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../config/app-config.service';
import { DatabaseService } from './database.service';
import { UserSchema } from './schemas/user.schema';
import { UserStatisticsSchema } from './schemas/user-statistics.schema';
import { UserActivityDaySchema } from './schemas/user-activity-day.schema';
import { DeletedUserSchema } from './schemas/deleted-user.schema';
import { TaskSchema } from './schemas/task.schema';
import { PeriodSchema } from './schemas/period.schema';
import { OutboxMessageSchema } from './schemas/outbox-message.schema';
import { FeedMessageSchema } from './schemas/feed-message.schema';
import { RespectChangeSchema } from './schemas/respect-change.schema';
import { PhraseSchema } from './schemas/phrase.schema';
import { PhraseVoteSchema } from './schemas/phrase-vote.schema';
import { PhraseShowStateSchema } from './schemas/phrase-show-state.schema';
import { BattleDialogSchema } from './schemas/battle-dialog.schema';
import { BattleMessageSchema } from './schemas/battle-message.schema';
import { TurnSchema } from './schemas/turn.schema';
import { RoleCardSchema } from './schemas/role-card.schema';
import { StrikeLotSchema } from './schemas/strike-lot.schema';
import { StrikeOperationSchema } from './schemas/strike-operation.schema';
import { StarsPaymentSchema } from './schemas/stars-payment.schema';
import { PaymentIncidentSchema } from './schemas/payment-incident.schema';
import { PackageSchema } from './schemas/package.schema';
import { SupportTicketSchema } from './schemas/support-ticket.schema';
import { AiCallSchema } from './schemas/ai-call.schema';
import { DailyCounterSchema } from './schemas/daily-counter.schema';
import { AnalyticsEventSchema } from './schemas/analytics-event.schema';
import { OwnerActionSchema } from './schemas/owner-action.schema';
import { GameSettingsSchema } from './schemas/game-settings.schema';
import { TelegramUpdateReceiptSchema } from './schemas/telegram-update-receipt.schema';
@Global()
@Module({
  imports: [MongooseModule.forRootAsync({
    inject: [AppConfigService],
    useFactory: (config: AppConfigService) => ({ uri: config.mongoUri }),
  }), MongooseModule.forFeature([{
    name: 'UserStatistics',
    schema: UserStatisticsSchema,
  }, {
    name: 'UserActivityDay',
    schema: UserActivityDaySchema,
  }, {
    name: 'PaymentIncident',
    schema: PaymentIncidentSchema,
  }, {
    name: 'TelegramUpdateReceipt',
    schema: TelegramUpdateReceiptSchema,
  }, {
    name: 'User',
    schema: UserSchema,
  }, {
    name: 'DeletedUser',
    schema: DeletedUserSchema,
  }, {
    name: 'Task',
    schema: TaskSchema,
  }, {
    name: 'Period',
    schema: PeriodSchema,
  }, {
    name: 'OutboxMessage',
    schema: OutboxMessageSchema,
  }, {
    name: 'FeedMessage',
    schema: FeedMessageSchema,
  }, {
    name: 'RespectChange',
    schema: RespectChangeSchema,
  }, {
    name: 'Phrase',
    schema: PhraseSchema,
  }, {
    name: 'PhraseVote',
    schema: PhraseVoteSchema,
  }, {
    name: 'PhraseShowState',
    schema: PhraseShowStateSchema,
  }, {
    name: 'BattleDialog',
    schema: BattleDialogSchema,
  }, {
    name: 'BattleMessage',
    schema: BattleMessageSchema,
  }, {
    name: 'Turn',
    schema: TurnSchema,
  }, {
    name: 'RoleCard',
    schema: RoleCardSchema,
  }, {
    name: 'StrikeLot',
    schema: StrikeLotSchema,
  }, {
    name: 'StrikeOperation',
    schema: StrikeOperationSchema,
  }, {
    name: 'StarsPayment',
    schema: StarsPaymentSchema,
  }, {
    name: 'Package',
    schema: PackageSchema,
  }, {
    name: 'SupportTicket',
    schema: SupportTicketSchema,
  }, {
    name: 'AiCall',
    schema: AiCallSchema,
  }, {
    name: 'DailyCounter',
    schema: DailyCounterSchema,
  }, {
    name: 'AnalyticsEvent',
    schema: AnalyticsEventSchema,
  }, {
    name: 'OwnerAction',
    schema: OwnerActionSchema,
  }, {
    name: 'GameSettings',
    schema: GameSettingsSchema,
  }])],
  providers: [DatabaseService, SeedService],
  exports: [DatabaseService],
})
export class DatabaseModule {
}
