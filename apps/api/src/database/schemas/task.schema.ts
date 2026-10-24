import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface Task {
  _id: string;
  userId: string;
  title: string;
  kind: 'one_time' | 'recurring';
  size: 'micro' | 'medium' | 'large';
  recurrence?: {
    type: 'daily' | 'weekdays' | 'weekly' | 'days_of_week' | 'every_n_days';
    days?: number[];
    n?: number;
  };
  anchorTime?: string;
  status: 'active' | 'stopped' | 'closed';
  currentPeriodId?: string;
  createdAt: Date;
  deletedAt?: Date;
}
export const TaskSchema = new Schema<Task>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  kind: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  recurrence: {
    type: Schema.Types.Mixed,
    required: false,
  },
  anchorTime: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
  },
  currentPeriodId: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
}, {
  versionKey: false,
  strict: true,
});
TaskSchema.index({
  userId: 1,
  status: 1,
  deletedAt: 1,
  _id: -1,
});
