import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface FeedMessage {
  _id: string;
  userId: string;
  phraseId?: string;
  category: string;
  text: string;
  periodId?: string;
  taskTitle?: string;
  telegramMessageId?: number;
  checkIn?: {
    answer?: 'done' | 'partial' | 'not_started';
    answeredAt?: Date;
    missedAt?: Date;
  };
  rating?: 0 | 1 | 2;
  sentAt: Date;
  draft?: boolean;
}
export const FeedMessageSchema = new Schema<FeedMessage>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  phraseId: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  periodId: {
    type: String,
    required: false,
  },
  taskTitle: {
    type: String,
    required: false,
  },
  telegramMessageId: {
    type: Number,
    required: false,
  },
  checkIn: {
    type: Schema.Types.Mixed,
    required: false,
  },
  rating: {
    type: Schema.Types.Mixed,
    required: false,
  },
  sentAt: {
    type: Date,
    required: true,
  },
  draft: Boolean,
}, {
  versionKey: false,
  strict: true,
});
FeedMessageSchema.index({
  userId: 1,
  periodId: 1,
  _id: -1,
});
FeedMessageSchema.index({
  category: 1,
  sentAt: 1,
  draft: 1,
  telegramMessageId: 1,
});
FeedMessageSchema.index({
  'category': 1,
  'checkIn.answer': 1,
  'checkIn.missedAt': 1,
  'sentAt': 1,
});
