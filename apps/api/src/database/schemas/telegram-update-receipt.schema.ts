import { Schema } from 'mongoose';

export interface TelegramUpdateReceipt {
  _id: string;
  botId: number;
  updateId: number;
  state: 'processing' | 'done' | 'failed';
  ownerToken?: string;
  leaseUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

// The built-in unique _id index is the botId:updateId namespace.
export const TelegramUpdateReceiptSchema = new Schema<TelegramUpdateReceipt>({
  _id: {
    type: String,
    required: true,
  },
  botId: {
    type: Number,
    required: true,
  },
  updateId: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    enum: ['processing', 'done', 'failed'],
    required: true,
  },
  ownerToken: String,
  leaseUntil: Date,
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  completedAt: Date,
  expiresAt: Date,
}, {
  versionKey: false,
  strict: true,
});
TelegramUpdateReceiptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
