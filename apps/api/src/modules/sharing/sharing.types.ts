import type { RoleView } from '../users/users.types';
export type ShareKindView = 'done' | 'fail' | 'battle';
export type CreateShareRequestView = {
  kind: ShareKindView;
  periodId?: string;
  role?: RoleView;
};
export type ShareResponseView = {
  preparedMessageId: string;
};
