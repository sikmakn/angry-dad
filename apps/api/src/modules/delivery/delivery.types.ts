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
  readAt?: string;
  needsAnswer?: boolean;
  taskOutcome?: 'done' | 'give_up' | 'failed';
};
export type FeedListResponseView = {
  items: (FeedMessageResponseView)[];
  nextCursor: string | null;
  unreadCount?: number;
  unansweredCount?: number;
  activeCount?: number;
  nextAnswerDueAt?: string;
};
export type FeedMessageResponseCheckInView = {
  answer?: CheckInAnswerView;
  answeredAt?: string;
  missedAt?: string;
  resolvedAt?: string;
  respectDelta?: number;
  expired?: boolean;
  groupRespectDelta?: number;
  answerDueAt?: string;
};
