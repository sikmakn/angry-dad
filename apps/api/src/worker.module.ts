import { Injectable, Module } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './common/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TasksService } from './modules/tasks/tasks.service';
import { TaskNotificationsModule } from './modules/task-notifications/task-notifications.module';
import { TaskNotificationsService } from './modules/task-notifications/task-notifications.service';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { DeliveryService } from './modules/delivery/delivery.service';
import { BattleModule } from './modules/battle/battle.module';
import { BattleService } from './modules/battle/battle.service';
import { PaymentsModule } from './modules/payments/payments.module';
import { PaymentsService } from './modules/payments/payments.service';
import { PaymentReconciliationService } from './modules/payments/services/payment-reconciliation.service';
@Injectable()
class WorkerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private timer?: ReturnType<typeof setInterval>;
  private running?: Promise<void>;
  private paymentTimer?: ReturnType<typeof setInterval>;
  private paymentRunning?: Promise<void>;
  private stopping = false;
  constructor(private readonly tasks: TasksService, private readonly notifications: TaskNotificationsService, private readonly delivery: DeliveryService, private readonly battle: BattleService, private readonly payments: PaymentsService, private readonly reconciliation: PaymentReconciliationService) { }
  onApplicationBootstrap(): void {
    this.startReconciliation();
    this.paymentTimer = setInterval(() => this.startReconciliation(), 60000);
    this.timer = setInterval(() => {
      if (!this.running && !this.stopping) {
        this.running = this.tick().finally(() => {
          this.running = undefined;
        });
      }
    }, 1000);
  }

  async onApplicationShutdown(): Promise<void> {
    this.stopping = true;
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
    }
    await this.reconciliation.stop();
    await this.paymentRunning;
    await this.running;
  }

  private startReconciliation(): void {
    if (!this.stopping && !this.paymentRunning) {
      this.paymentRunning = this.reconciliation.reconcile().catch((error) => {
        console.error('Payment reconciliation failed', error instanceof Error ? error.name : 'unknown');
      }).finally(() => {
        this.paymentRunning = undefined;
      });
    }
  }

  private async tick(): Promise<void> {
    const jobs: (() => Promise<void>)[] = [() => this.tasks.sweep(), () => this.notifications.missed(), () => this.notifications.plan(), () => this.delivery.dispatch(), () => this.payments.recover(), () => this.battle.recover()];
    for (const job of jobs) {
      try {
        await job();
      } catch (error) {
        console.error('Worker job failed', error instanceof Error ? error.name : 'unknown');
      }
    }
  }
}
@Module({
  imports: [ConfigModule, DatabaseModule, EventsModule, UsersModule, TasksModule, TaskNotificationsModule, DeliveryModule, BattleModule, PaymentsModule],
  providers: [WorkerService],
})
export class WorkerModule {
}
