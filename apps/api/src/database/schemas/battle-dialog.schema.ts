import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface BattleDialog {
  _id: string;
  userId: string;
  role: 'father' | 'mother';
  defeat: number;
  defeatAt: Date;
  brokenArmed: boolean;
  defeatAtLastTurn: number;
  rewardedSteps?: number;
  summary?: string;
  summaryUpTo?: number;
  activeTurnId?: string;
  nextSeq: number;
}
export const BattleDialogSchema = new Schema<BattleDialog>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  defeat: {
    type: Number,
    required: true,
  },
  defeatAt: {
    type: Date,
    required: true,
  },
  brokenArmed: {
    type: Boolean,
    required: true,
  },
  defeatAtLastTurn: {
    type: Number,
    required: true,
  },
  summary: {
    type: String,
    required: false,
  },
  rewardedSteps: Number,
  summaryUpTo: {
    type: Number,
    required: false,
  },
  activeTurnId: {
    type: String,
    required: false,
  },
  nextSeq: {
    type: Number,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
BattleDialogSchema.index({
  userId: 1,
  role: 1,
}, { unique: true });
