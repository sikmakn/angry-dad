import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface DeletedUser {
  _id: string;
  telegramIdHash: string;
  deletedAt: Date;
}
export const DeletedUserSchema = new Schema<DeletedUser>({
  _id: {
    type: String,
    default: newId,
  },
  telegramIdHash: {
    type: String,
    required: true,
  },
  deletedAt: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
DeletedUserSchema.index({ telegramIdHash: 1 }, { unique: true });
