import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface PhraseVote {
  _id: string;
  userId: string;
  phraseId: string;
  score: number;
  at: Date;
}
export const PhraseVoteSchema = new Schema<PhraseVote>({
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
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  at: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
PhraseVoteSchema.index({
  userId: 1,
  phraseId: 1,
}, { unique: true });
