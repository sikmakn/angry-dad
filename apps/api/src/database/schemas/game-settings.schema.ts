import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface GameSettings {
  _id: string;
  battleCoefficients: {
    base: number;
    damage: number;
    weakSpot: number;
    crit: number;
  };
  aiDailyLimit: number;
  otherNames: {
    name: string;
    gender: 'male' | 'female';
    cases: string[];
  }[];
  banditParams: {
    trialShows: number;
    disableAvg: number;
    disableVotes: number;
  };
}
export const GameSettingsSchema = new Schema<GameSettings>({
  _id: {
    type: String,
    default: newId,
  },
  battleCoefficients: {
    type: Schema.Types.Mixed,
    required: true,
  },
  aiDailyLimit: {
    type: Number,
    required: true,
  },
  otherNames: {
    type: Schema.Types.Mixed,
    required: true,
  },
  banditParams: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
