import { Schema } from 'mongoose';
export interface TaskNotificationState {
  _id: string;
  userId: string;
  revision: number;
  dirty: boolean;
  nextAt?: Date;
  owner?: string;
  leaseUntil?: Date;
  pendingOutboxId?: string;
  pauseUntil?: Date;
  series?: { id: string;
    originFeedId: string;
    remaining: number;
    penalized: boolean;
    endsAt: Date; };
}
export const TaskNotificationStateSchema = new Schema<TaskNotificationState>({
  _id: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  revision: {
    type: Number,
    required: true,
  },
  dirty: {
    type: Boolean,
    required: true,
  },
  nextAt: Date,
  owner: String,
  leaseUntil: Date,
  pendingOutboxId: String,
  pauseUntil: Date,
  series: Schema.Types.Mixed,
}, {
  versionKey: false,
  strict: true,
});
TaskNotificationStateSchema.index({
  dirty: 1,
  nextAt: 1,
});
TaskNotificationStateSchema.index({ nextAt: 1 });
