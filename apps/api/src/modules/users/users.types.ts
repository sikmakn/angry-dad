export type RoleView = 'father' | 'mother';
export type GenderView = 'male' | 'female';
export type QuietHoursView = {
  start: number;
  end: number;
};
export type ReplyResponseView = {
  reply: string | null;
};
export type OnboardingStateView = 'guest' | 'done';
export type MeResponseView = {
  id: string;
  isOwner: boolean;
  returning?: boolean;
  username?: string;
  firstName?: string;
  onboarding: OnboardingStateView;
  role?: RoleView;
  gender?: GenderView;
  timeZone: string;
  quietHours: QuietHoursView;
  respect: number;
  inLeaderboard: boolean;
  closedCount: number;
  closedCountAt?: string;
};
export type UpdateMeRequestView = {
  role?: RoleView;
  gender?: GenderView;
  timeZone?: string;
  quietHours?: QuietHoursView;
};
export type OnboardingRequestView = {
  role: RoleView;
  gender: GenderView;
  timeZone?: string;
};
export type OnboardingResponseView = {
  user: MeResponseView;
  replies: (string)[];
};
export type OwnerUserResponseView = {
  telegramId: number;
  username?: string;
  firstName?: string;
};
