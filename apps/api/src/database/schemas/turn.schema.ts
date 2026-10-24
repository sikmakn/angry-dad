import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface Turn {
  _id: string;
  clientTurnId: string;
  dialogId: string;
  userId: string;
  status: 'reserved' | 'judged' | 'done' | 'failed';
  playerText: string;
  judge?: {
    hit: number;
    logic: number;
    originality: number;
    corner: boolean;
    weakSpotHit: string | null;
  };
  damage?: number;
  defeatBefore?: number;
  defeatAfter?: number;
  mode?: string;
  respectDelta?: number;
  failReason?: string;
  startedAt: Date;
  result?: Record<string, unknown>;
}
export const TurnSchema = new Schema<Turn>({
  _id: {
    type: String,
    default: newId,
  },
  clientTurnId: {
    type: String,
    required: true,
  },
  dialogId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  playerText: {
    type: String,
    required: true,
  },
  judge: {
    type: Schema.Types.Mixed,
    required: false,
  },
  damage: {
    type: Number,
    required: false,
  },
  defeatBefore: {
    type: Number,
    required: false,
  },
  defeatAfter: {
    type: Number,
    required: false,
  },
  mode: {
    type: String,
    required: false,
  },
  respectDelta: {
    type: Number,
    required: false,
  },
  failReason: {
    type: String,
    required: false,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  result: {
    type: Schema.Types.Mixed,
    required: false,
  },
}, {
  versionKey: false,
  strict: true,
});
TurnSchema.index({
  userId: 1,
  clientTurnId: 1,
}, { unique: true });
TurnSchema.index({ dialogId: 1 }, {
  unique: true,
  partialFilterExpression: { status: { $in: ['reserved', 'judged'] } },
});
