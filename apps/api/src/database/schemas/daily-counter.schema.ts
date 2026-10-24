import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface DailyCounter {
  _id: string;
  userId: string;
  kind: string;
  localDate: string;
  count: number;
  expiresAt: Date;
}
export const DailyCounterSchema = new Schema<DailyCounter>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  kind: {
    type: String,
    required: true,
  },
  localDate: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
DailyCounterSchema.index({
  userId: 1,
  kind: 1,
  localDate: 1,
}, { unique: true });
DailyCounterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
