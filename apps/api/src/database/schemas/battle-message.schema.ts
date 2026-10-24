import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface BattleMessage {
  _id: string;
  userId: string;
  dialogId: string;
  seq: number;
  author: 'player' | 'character';
  text: string;
  origin: 'turn' | 'reply_to_feed' | 'battle_start' | 'break';
  taskTitle?: string;
  turnId?: string;
  clientKey?: string;
  feedMessageId?: string;
}
export const BattleMessageSchema = new Schema<BattleMessage>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  dialogId: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  taskTitle: {
    type: String,
    required: false,
  },
  turnId: {
    type: String,
    required: false,
  },
  clientKey: {
    type: String,
    required: false,
  },
  feedMessageId: {
    type: String,
    required: false,
  },
}, {
  versionKey: false,
  strict: true,
});
BattleMessageSchema.index({
  dialogId: 1,
  seq: 1,
}, { unique: true });
