import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface RoleCard {
  _id: string;
  role: 'father' | 'mother';
  character: string;
  weakSpots: {
    key: string;
    description: string;
  }[];
  version: number;
}
export const RoleCardSchema = new Schema<RoleCard>({
  _id: {
    type: String,
    default: newId,
  },
  role: {
    type: String,
    required: true,
  },
  character: {
    type: String,
    required: true,
  },
  weakSpots: {
    type: Schema.Types.Mixed,
    required: true,
  },
  version: {
    type: Number,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
RoleCardSchema.index({ role: 1 }, { unique: true });
