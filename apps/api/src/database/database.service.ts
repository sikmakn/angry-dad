import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import type { ClientSession, Model } from 'mongoose';
import type { User } from './schemas/user.schema';
import type { UserStatistics } from './schemas/user-statistics.schema';
import type { UserActivityDay } from './schemas/user-activity-day.schema';
import type { TaskNotificationState } from './schemas/task-notification-state.schema';
import type { TelegramUpdateReceipt } from './schemas/telegram-update-receipt.schema';
import type { DeletedUser } from './schemas/deleted-user.schema';
import type { Task } from './schemas/task.schema';
import type { Period } from './schemas/period.schema';
import type { OutboxMessage } from './schemas/outbox-message.schema';
import type { FeedMessage } from './schemas/feed-message.schema';
import type { RespectChange } from './schemas/respect-change.schema';
import type { Phrase } from './schemas/phrase.schema';
import type { PhraseVote } from './schemas/phrase-vote.schema';
import type { PhraseShowState } from './schemas/phrase-show-state.schema';
import type { BattleDialog } from './schemas/battle-dialog.schema';
import type { BattleMessage } from './schemas/battle-message.schema';
import type { Turn } from './schemas/turn.schema';
import type { RoleCard } from './schemas/role-card.schema';
import type { StrikeLot } from './schemas/strike-lot.schema';
import type { StrikeOperation } from './schemas/strike-operation.schema';
import type { StarsPayment } from './schemas/stars-payment.schema';
import type { PaymentIncident } from './schemas/payment-incident.schema';
import type { Package } from './schemas/package.schema';
import type { SupportTicket } from './schemas/support-ticket.schema';
import type { AiCall } from './schemas/ai-call.schema';
import type { DailyCounter } from './schemas/daily-counter.schema';
import type { AnalyticsEvent } from './schemas/analytics-event.schema';
import type { OwnerAction } from './schemas/owner-action.schema';
import type { GameSettings } from './schemas/game-settings.schema';
export interface Entities {
  UserStatistics: UserStatistics;
  UserActivityDay: UserActivityDay;
  TaskNotificationState: TaskNotificationState;
  TelegramUpdateReceipt: TelegramUpdateReceipt;
  User: User;
  DeletedUser: DeletedUser;
  Task: Task;
  Period: Period;
  OutboxMessage: OutboxMessage;
  FeedMessage: FeedMessage;
  RespectChange: RespectChange;
  Phrase: Phrase;
  PhraseVote: PhraseVote;
  PhraseShowState: PhraseShowState;
  BattleDialog: BattleDialog;
  BattleMessage: BattleMessage;
  Turn: Turn;
  RoleCard: RoleCard;
  StrikeLot: StrikeLot;
  StrikeOperation: StrikeOperation;
  StarsPayment: StarsPayment;
  PaymentIncident: PaymentIncident;
  Package: Package;
  SupportTicket: SupportTicket;
  AiCall: AiCall;
  DailyCounter: DailyCounter;
  AnalyticsEvent: AnalyticsEvent;
  OwnerAction: OwnerAction;
  GameSettings: GameSettings;
}
@Injectable()
export class DatabaseService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection) { }

  model<K extends keyof Entities>(name: K): Model<Entities[K]> {
    return this.connection.model<Entities[K]>(name);
  }

  async transaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(() => work(session));
    } finally {
      await session.endSession();
    }
  }
}
