import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface AiCall {
  _id: string;
  purpose: string;
  provider: string;
  model: string;
  userId?: string;
  turnId?: string;
  inputTokens?: number;
  outputTokens?: number;
  costMicros?: number;
  costSource?: 'provider' | 'estimate' | 'mock' | 'unknown';
  inputUsdPerMillion?: number;
  outputUsdPerMillion?: number;
  outcome: string;
  latencyMs: number;
  at: Date;
}
export const AiCallSchema = new Schema<AiCall>({
  _id: {
    type: String,
    default: newId,
  },
  purpose: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  turnId: {
    type: String,
    required: false,
  },
  inputTokens: {
    type: Number,
    required: false,
  },
  outputTokens: {
    type: Number,
    required: false,
  },
  costMicros: {
    type: Number,
    required: false,
  },
  costSource: {
    type: String,
    enum: ['provider', 'estimate', 'mock', 'unknown'],
  },
  inputUsdPerMillion: Number,
  outputUsdPerMillion: Number,
  outcome: {
    type: String,
    required: true,
  },
  latencyMs: {
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
AiCallSchema.index({
  turnId: 1,
  at: 1,
});
