import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface StrikeLot {
  _id: string;
  userId: string;
  source: 'purchase' | 'manual';
  paymentId?: string;
  total: number;
  remaining: number;
  createdAt: Date;
  refundedAt?: Date;
  refundPending?: boolean;
}
export const StrikeLotSchema = new Schema<StrikeLot>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: false,
  },
  total: {
    type: Number,
    required: true,
  },
  remaining: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  refundedAt: {
    type: Date,
    required: false,
  },
  refundPending: {
    type: Boolean,
    required: false,
  },
}, {
  versionKey: false,
  strict: true,
});
StrikeLotSchema.index({ paymentId: 1 }, {
  unique: true,
  partialFilterExpression: { source: 'purchase' },
});
StrikeLotSchema.index({
  userId: 1,
  remaining: 1,
  createdAt: 1,
});
