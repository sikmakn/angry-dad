import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface Package {
  _id: string;
  strikes: number;
  priceStars: number;
  active: boolean;
  order: number;
}
export const PackageSchema = new Schema<Package>({
  _id: {
    type: String,
    default: newId,
  },
  strikes: {
    type: Number,
    required: true,
  },
  priceStars: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
