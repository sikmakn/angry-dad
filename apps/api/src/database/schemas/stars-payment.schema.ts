import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface StarsPayment {
  _id: string;
  invoicePayload: string;
  userId: string;
  telegramId: number;
  packageSnapshot: {
    strikes: number;
    priceStars: number;
  };
  status: 'invoiced' | 'paid' | 'credited' | 'refunded';
  telegramChargeId?: string;
  paidAt?: Date;
  creditedAt?: Date;
  invoiceUrl?: string;
  clientKey?: string;
  packageId?: string;
  refundPending?: boolean;
  createdAt?: Date;
  clientKeyExpiresAt?: Date;
  invoiceLeaseOwner?: string;
  invoiceLeaseUntil?: Date;
  preCheckoutQueryId?: string;
  awaitingSince?: Date;
  historyCheckedAt?: Date;
  creditBlocked?: boolean;
  starsUsdPerStar?: number;
}
export const StarsPaymentSchema = new Schema<StarsPayment>({
  _id: {
    type: String,
    default: newId,
  },
  invoicePayload: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  telegramId: {
    type: Number,
    required: true,
  },
  packageSnapshot: {
    type: Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  telegramChargeId: {
    type: String,
    required: false,
  },
  paidAt: {
    type: Date,
    required: false,
  },
  creditedAt: {
    type: Date,
    required: false,
  },
  invoiceUrl: {
    type: String,
    required: false,
  },
  clientKey: {
    type: String,
    required: false,
  },
  packageId: {
    type: String,
    required: false,
  },
  refundPending: {
    type: Boolean,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clientKeyExpiresAt: Date,
  invoiceLeaseOwner: String,
  invoiceLeaseUntil: Date,
  preCheckoutQueryId: String,
  awaitingSince: Date,
  historyCheckedAt: Date,
  creditBlocked: Boolean,
  starsUsdPerStar: Number,
}, {
  versionKey: false,
  strict: true,
});
StarsPaymentSchema.index({ telegramChargeId: 1 }, {
  unique: true,
  partialFilterExpression: { telegramChargeId: { $type: 'string' } },
});
StarsPaymentSchema.index({ invoicePayload: 1 }, { unique: true });
StarsPaymentSchema.index({
  userId: 1,
  clientKey: 1,
}, {
  unique: true,
  partialFilterExpression: { clientKey: { $type: 'string' } },
});
StarsPaymentSchema.index({
  status: 1,
  paidAt: 1,
});
StarsPaymentSchema.index({
  status: 1,
  historyCheckedAt: 1,
  _id: 1,
});
// Expiry releases only the optional request key, never the financial record.
StarsPaymentSchema.index({ clientKeyExpiresAt: 1 });
