import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface Period {
  _id: string;
  taskId: string;
  userId: string;
  startsAt: Date;
  moodFrom: Date;
  deadline: Date;
  anchorAt?: Date;
  status: 'active' | 'done' | 'failed';
  closedAt?: Date;
  closedBy?: 'done_button' | 'check_in' | 'deadline' | 'give_up';
  lastExtendedOn?: string;
  lastExtendedAt?: Date;
  retryUsed: boolean;
  series?: {
    id: string;
    startedAt: Date;
    endsAt: Date;
    penalized: boolean;
  };
  nextCheckInAt?: Date;
  respectDelta?: number;
  failMessageId?: string;
}
export const PeriodSchema = new Schema<Period>({
  _id: {
    type: String,
    default: newId,
  },
  taskId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  startsAt: {
    type: Date,
    required: true,
  },
  moodFrom: {
    type: Date,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  anchorAt: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    required: true,
  },
  closedAt: {
    type: Date,
    required: false,
  },
  closedBy: {
    type: String,
    required: false,
  },
  lastExtendedOn: {
    type: String,
    required: false,
  },
  lastExtendedAt: Date,
  retryUsed: {
    type: Boolean,
    required: true,
  },
  series: {
    type: Schema.Types.Mixed,
    required: false,
  },
  nextCheckInAt: {
    type: Date,
    required: false,
  },
  respectDelta: {
    type: Number,
    required: false,
  },
  failMessageId: {
    type: String,
    required: false,
  },
}, {
  versionKey: false,
  strict: true,
});
PeriodSchema.index({
  taskId: 1,
  status: 1,
}, {
  unique: true,
  partialFilterExpression: { status: 'active' },
});
PeriodSchema.index({
  status: 1,
  deadline: 1,
}, {});
