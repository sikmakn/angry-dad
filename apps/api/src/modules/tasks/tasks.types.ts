import type { FeedMessageResponseView } from '../delivery/delivery.types';
export type TaskKindView = 'one_time' | 'recurring';
export type TaskSizeView = 'micro' | 'medium' | 'large';
export type TaskStatusView = 'active' | 'stopped' | 'closed';
export type PeriodStatusView = 'active' | 'done' | 'failed';
export type PeriodClosedByView = 'done_button' | 'check_in' | 'deadline' | 'give_up';
export type RecurrenceView = {
  type: 'daily' | 'weekdays' | 'weekly' | 'days_of_week' | 'every_n_days';
  days?: (number)[];
  n?: number;
};
export type PeriodResponseView = {
  id: string;
  startsAt: string;
  moodFrom: string;
  deadline: string;
  anchorAt?: string;
  status: PeriodStatusView;
  closedAt?: string;
  closedBy?: PeriodClosedByView;
  retryUsed: boolean;
  respectDelta?: number;
  failMessage?: FeedMessageResponseView;
};
export type TaskResponseView = {
  id: string;
  title: string;
  kind: TaskKindView;
  size: TaskSizeView;
  recurrence?: RecurrenceView;
  anchorTime?: string;
  status: TaskStatusView;
  currentPeriod?: PeriodResponseView;
  nextPeriodStartsAt?: string;
  createdAt: string;
};
export type TaskListResponseView = {
  items: (TaskResponseView)[];
  nextCursor: string | null;
};
export type PeriodListResponseView = {
  items: (PeriodResponseView)[];
  nextCursor: string | null;
};
export type CreateTaskRequestView = {
  title: string;
  kind: TaskKindView;
  deadline?: string;
  recurrence?: RecurrenceView;
  anchorTime?: string;
};
export type UpdateTaskRequestView = {
  title?: string;
  status?: 'stopped';
};
export type TaskActionResponseView = {
  task: TaskResponseView;
  reply: string | null;
};
export type PeriodActionResponseView = {
  task: TaskResponseView;
  respectDelta: number;
  respect: number;
  reply: string | null;
};
export type CheckInAnswerRequestView = {
  answer: CheckInAnswerView;
};
export type CheckInAnswerView = 'done' | 'partial' | 'not_started';
