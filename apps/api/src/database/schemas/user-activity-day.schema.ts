import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface UserActivityDay {
  _id: string;
  userId: string;
  day: Date;
  firstActivityAt: Date;
  lastActivityAt: Date;
}
export const UserActivityDaySchema = new Schema<UserActivityDay>({
  _id: {
    type: String,
    default: newId,
  },
  userId: {
    type: String,
    required: true,
  },
  day: {
    type: Date,
    required: true,
  },
  firstActivityAt: {
    type: Date,
    required: true,
  },
  lastActivityAt: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
UserActivityDaySchema.index({
  userId: 1,
  day: 1,
}, { unique: true });
UserActivityDaySchema.index({
  day: 1,
  lastActivityAt: 1,
  firstActivityAt: 1,
});
