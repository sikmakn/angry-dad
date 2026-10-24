import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface UserStatistics {
  _id: string;
  userId: string;
  firstStartedAt?: Date;
  firstTaskCreatedAt?: Date;
}
export const UserStatisticsSchema = new Schema<UserStatistics>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  firstStartedAt: Date,
  firstTaskCreatedAt: Date,
}, {
  versionKey: false,
  strict: true,
});
UserStatisticsSchema.index({ userId: 1 }, { unique: true });
UserStatisticsSchema.index({
  firstStartedAt: 1,
  userId: 1,
});
