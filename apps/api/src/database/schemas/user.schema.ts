import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface User {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  onboarding: 'guest' | 'done';
  role?: 'father' | 'mother';
  gender?: 'male' | 'female';
  timeZone: string;
  quietHours: {
    start: number;
    end: number;
  };
  respect: number;
  respectFromBreak: boolean;
  lastBreakRewardAt?: Date;
  inLeaderboard: boolean;
  closedCount: number;
  closedCountAt: Date;
  lastActivityAt: Date;
  botBlocked: boolean;
  lastSentAt?: Date;
  sendLeaseToken?: string;
  sendLeaseUntil?: Date;
  deleting?: boolean;
  paymentRevision?: number;
  activityRevision?: number;
}
export const UserSchema = new Schema<User>({
  _id: {
    type: String,
    default: newId,
  },
  telegramId: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: false,
  },
  onboarding: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  timeZone: {
    type: String,
    required: true,
  },
  quietHours: {
    type: Schema.Types.Mixed,
    required: true,
  },
  respect: {
    type: Number,
    required: true,
  },
  respectFromBreak: {
    type: Boolean,
    required: true,
  },
  lastBreakRewardAt: {
    type: Date,
    required: false,
  },
  inLeaderboard: {
    type: Boolean,
    required: true,
  },
  closedCount: {
    type: Number,
    required: true,
  },
  closedCountAt: {
    type: Date,
    required: true,
  },
  lastActivityAt: {
    type: Date,
    required: true,
  },
  botBlocked: {
    type: Boolean,
    required: true,
  },
  lastSentAt: {
    type: Date,
    required: false,
  },
  sendLeaseToken: {
    type: String,
    required: false,
  },
  sendLeaseUntil: {
    type: Date,
    required: false,
  },
  deleting: {
    type: Boolean,
    required: false,
  },
  paymentRevision: Number,
  activityRevision: Number,
}, {
  versionKey: false,
  strict: true,
});
UserSchema.index({ telegramId: 1 }, { unique: true });
UserSchema.index({
  inLeaderboard: 1,
  closedCount: -1,
  closedCountAt: 1,
}, {});
