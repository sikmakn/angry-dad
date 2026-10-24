import { Schema } from 'mongoose';
import { newId } from '../../common/utils/id';
export interface AnalyticsEvent {
  _id: string;
  type: string;
  userId?: string;
  props?: Record<string, number | boolean | string>;
  at: Date;
}
export const AnalyticsEventSchema = new Schema<AnalyticsEvent>({
  _id: {
    type: String,
    default: newId,
  },
  type: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  props: {
    type: Schema.Types.Mixed,
    required: false,
  },
  at: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
  strict: true,
});
