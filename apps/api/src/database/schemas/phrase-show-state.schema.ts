import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface PhraseShowState {
  _id: string;
  userId: string;
  recent: Record<string, string[]>;
}
export const PhraseShowStateSchema = new Schema<PhraseShowState>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  recent: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
PhraseShowStateSchema.index({ userId: 1 }, { unique: true });
