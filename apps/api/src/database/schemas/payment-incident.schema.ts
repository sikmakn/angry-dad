import { Schema } from 'mongoose';

export interface PaymentIncident {
  _id: string;
  paymentId?: string;
  payloadHash: string;
  telegramId: number;
  chargeId: string;
  currency: string;
  amount: number;
  reason: string;
  observedAt: Date;
}

// Financial exceptions are retained for investigation, without full payload JSON.
export const PaymentIncidentSchema = new Schema<PaymentIncident>({
  _id: {
    type: String,
    required: true,
  },
  paymentId: String,
  payloadHash: {
    type: String,
    required: true,
  },
  telegramId: {
    type: Number,
    required: true,
  },
  chargeId: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  observedAt: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
PaymentIncidentSchema.index({ chargeId: 1 });
