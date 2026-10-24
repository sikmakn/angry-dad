import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface Phrase {
  _id: string;
  role: 'father' | 'mother' | 'any';
  category: string;
  level?: number;
  defeatLevel: '1' | '2' | '3' | '4' | 'any';
  combo: 'father_son' | 'father_daughter' | 'mother_son' | 'mother_daughter' | 'any';
  template: string;
  source: 'owner' | 'subscriber' | 'paraphrase';
  author?: string;
  status: 'enabled' | 'disabled' | 'pending_review';
  shows: number;
  votes: number;
  scoreSum: number;
  belowThreshold: boolean;
}
export const PhraseSchema = new Schema<Phrase>({
  _id: {
    type: String,
    default: newId,
  },
  role: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: false,
  },
  defeatLevel: {
    type: String,
    required: true,
  },
  combo: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
  },
  shows: {
    type: Number,
    required: true,
  },
  votes: {
    type: Number,
    required: true,
  },
  scoreSum: {
    type: Number,
    required: true,
  },
  belowThreshold: {
    type: Boolean,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
PhraseSchema.index({
  role: 1,
  category: 1,
  level: 1,
  defeatLevel: 1,
  combo: 1,
  status: 1,
});
