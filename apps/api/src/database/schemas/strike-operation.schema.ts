import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface StrikeOperation {
  _id: string;
  userId: string;
  lotId: string;
  type: 'purchase' | 'spend' | 'turn_refund' | 'manual_grant' | 'manual_revoke' | 'stars_refund';
  amount: number;
  reason?: string;
  turnId?: string;
  at: Date;
  clientKey?: string;
  requestHash?: string;
  paidStrike?: boolean;
  paidUnitRevenueMicros?: number;
  economicState?: 'reserved' | 'consumed' | 'refunded';
}
export const StrikeOperationSchema = new Schema<StrikeOperation>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  lotId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: false,
  },
  turnId: {
    type: String,
    required: false,
  },
  at: {
    type: Date,
    required: true,
  },
  clientKey: {
    type: String,
    required: false,
  },
  requestHash: {
    type: String,
    required: false,
  },
  paidStrike: Boolean,
  paidUnitRevenueMicros: Number,
  economicState: {
    type: String,
    enum: ['reserved', 'consumed', 'refunded'],
  },
}, {
  versionKey: false,
  strict: true,
});
StrikeOperationSchema.index({
  type: 1,
  at: 1,
});
StrikeOperationSchema.index({
  turnId: 1,
  type: 1,
}, {
  unique: true,
  partialFilterExpression: { turnId: { $type: 'string' } },
});
StrikeOperationSchema.index({
  userId: 1,
  clientKey: 1,
}, {
  unique: true,
  partialFilterExpression: { clientKey: { $type: 'string' } },
});
