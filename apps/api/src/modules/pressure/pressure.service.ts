import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import type { Period } from '../../database/schemas/period.schema';
import { TaskNotificationsService } from '../task-notifications/task-notifications.service';
@Injectable()
export class PressureService {
  constructor(private readonly notifications: TaskNotificationsService) { }
  async plan(): Promise<void> {
    return this.notifications.plan();
  }

  async missed(): Promise<void> {
    return this.notifications.missed();
  }

  async startSeries(period: Period, session: ClientSession, penalized: boolean, originFeedId: string): Promise<void> {
    return this.notifications.startSeries(period, session, penalized, originFeedId);
  }
}
