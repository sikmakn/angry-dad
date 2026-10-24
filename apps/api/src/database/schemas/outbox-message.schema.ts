import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface OutboxMessage {
  _id: string;
  userId: string;
  periodId?: string;
  kind: 'check_in' | 'series_check_in' | 'reminder' | 'fail' | 'absent' | 'check_in_missed';
  priority: number;
  dueAt: Date;
  originalDueAt: Date;
  status: 'planned' | 'leased' | 'sent' | 'cancelled' | 'dropped';
  leaseUntil?: Date;
  leaseToken?: string;
  dedupeKey: string;
  feedMessageId?: string;
  planRevision?: number;
  primaryTaskId?: string;
  secondaryTaskId?: string;
  secondaryPeriodId?: string;
  reason?: string;
  reasonAt?: Date;
  sourceFeedId?: string;
  intensity?: number;
  seriesId?: string;
  seriesOriginFeedId?: string;
  role?: string;
  contextKey?: string;
  sendStartedAt?: Date;
  sentAt?: Date;
}
export const OutboxMessageSchema = new Schema<OutboxMessage>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  periodId: {
    type: String,
    required: false,
  },
  kind: {
    type: String,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  dueAt: {
    type: Date,
    required: true,
  },
  originalDueAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  leaseUntil: {
    type: Date,
    required: false,
  },
  leaseToken: {
    type: String,
    required: false,
  },
  dedupeKey: {
    type: String,
    required: true,
  },
  feedMessageId: {
    type: String,
    required: false,
  },
  planRevision: Number,
  primaryTaskId: String,
  secondaryTaskId: String,
  secondaryPeriodId: String,
  reason: String,
  reasonAt: Date,
  sourceFeedId: String,
  intensity: Number,
  seriesId: String,
  seriesOriginFeedId: String,
  role: String,
  contextKey: String,
  sendStartedAt: Date,
  sentAt: Date,
}, {
  versionKey: false,
  strict: true,
});
OutboxMessageSchema.index({ dedupeKey: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'planned' },
});
OutboxMessageSchema.index({
  status: 1,
  dueAt: 1,
  priority: -1,
}, {});
OutboxMessageSchema.index({
  userId: 1,
  sentAt: -1,
});
OutboxMessageSchema.index({
  userId: 1,
  sendStartedAt: -1,
});
OutboxMessageSchema.index({
  userId: 1,
  primaryTaskId: 1,
  sentAt: -1,
});
OutboxMessageSchema.index({
  userId: 1,
  planRevision: 1,
}, {
  unique: true,
  partialFilterExpression: { planRevision: { $exists: true } },
});
