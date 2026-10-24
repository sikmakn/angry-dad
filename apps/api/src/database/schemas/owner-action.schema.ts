import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface OwnerAction {
  _id: string;
  action: string;
  targetUserId?: string;
  targetId?: string;
  targetTelegramId?: number;
  details?: Record<string, unknown>;
  at: Date;
}
export const OwnerActionSchema = new Schema<OwnerAction>({
  _id: {
    type: String,
    default: newId,
  },
  action: {
    type: String,
    required: true,
  },
  targetUserId: {
    type: String,
    required: false,
  },
  targetId: {
    type: String,
    required: false,
  },
  targetTelegramId: {
    type: Number,
    required: false,
  },
  details: {
    type: Schema.Types.Mixed,
    required: false,
  },
  at: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
