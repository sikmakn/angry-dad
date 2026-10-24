import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface SupportTicket {
  _id: string;
  telegramId: number;
  userId?: string;
  text: string;
  status: 'open' | 'resolved';
  at: Date;
  sourceKey?: string;
}
export const SupportTicketSchema = new Schema<SupportTicket>({
  _id: {
    type: String,
    default: newId,
  },
  telegramId: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  text: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  at: {
    type: Date,
    required: true,
  },
  sourceKey: {
    type: String,
    required: false,
  },
}, {
  versionKey: false,
  strict: true,
});
