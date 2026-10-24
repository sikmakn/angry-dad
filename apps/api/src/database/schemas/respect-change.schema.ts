import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface RespectChange {
  _id: string;
  userId: string;
  reason: 'start' | 'done' | 'missed_check_in' | 'fail' | 'give_up' | 'battle_hit' | 'break';
  delta: number;
  applied: number;
  eventKey: string;
  localDate: string;
  at: Date;
}
export const RespectChangeSchema = new Schema<RespectChange>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  delta: {
    type: Number,
    required: true,
  },
  applied: {
    type: Number,
    required: true,
  },
  eventKey: {
    type: String,
    required: true,
  },
  localDate: {
    type: String,
    required: true,
  },
  at: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
RespectChangeSchema.index({
  userId: 1,
  eventKey: 1,
}, { unique: true });
