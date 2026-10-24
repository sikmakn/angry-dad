import type { PhraseCategoryView } from '../phrases/phrases.types';
import type { RatingView } from '../phrases/phrases.types';
import type { CheckInAnswerView } from '../tasks/tasks.types';
export type FeedMessageResponseView = {
  id: string;
  category: PhraseCategoryView;
  rateable: boolean;
  text: string;
  periodId?: string;
  taskTitle?: string;
  checkIn?: FeedMessageResponseCheckInView;
  rating?: RatingView;
  sentAt: string;
};
export type FeedListResponseView = {
  items: (FeedMessageResponseView)[];
  nextCursor: string | null;
};
export type FeedMessageResponseCheckInView = {
  answer?: CheckInAnswerView;
  answeredAt?: string;
  missedAt?: string;
};
