import type { GenderView } from '../users/users.types';
export type MetricsResponseView = {
  from: string;
  to: string;
  day7Retention?: number | null;
  closedShare?: number | null;
  checkInAnswerRate?: number | null;
  firstPurchaseConversion?: number | null;
  turnCostToStrikeRevenue?: number | null;
  botBlockedShare?: number | null;
  avgPhraseScore?: number | null;
  sharesPer100Active?: number | null;
  medianStartToFirstTaskSeconds?: number | null;
};
export const ownerActionTypes = ['phrase_add', 'phrase_toggle', 'paraphrase_generate', 'paraphrase_review', 'support_ticket_status_changed', 'role_card_edit', 'package_edit', 'strikes_grant', 'strikes_revoke', 'stars_refund', 'settings_edit'] as const;
export type OwnerActionTypeView = typeof ownerActionTypes[number];
export type OwnerJournalContext = {
  at?: Date;
  targetTelegramId?: number;
};
export type OwnerJournalEntryView = {
  action: OwnerActionTypeView;
  targetTelegramId?: number;
  targetId?: string;
  details?: Record<string, unknown>;
  at: string;
};
export type OwnerJournalListResponseView = {
  items: (OwnerJournalEntryView)[];
  nextCursor: string | null;
};
export type OtherNameView = {
  name: string;
  gender: GenderView;
  cases: (string)[];
};
export type GameSettingsRequestView = {
  battleCoefficients: GameSettingsRequestBattleCoefficientsView;
  aiDailyLimit: number;
  otherNames: (OtherNameView)[];
  banditParams: GameSettingsRequestBanditParamsView;
};
export type GameSettingsResponseView = {
  battleCoefficients: GameSettingsRequestBattleCoefficientsView;
  aiDailyLimit: number;
  otherNames: (OtherNameView)[];
  banditParams: GameSettingsRequestBanditParamsView;
};
export type GameSettingsRequestBattleCoefficientsView = {
  base: number;
  damage: number;
  weakSpot: number;
  crit: number;
};
export type GameSettingsRequestBanditParamsView = {
  trialShows: number;
  disableAvg: number;
  disableVotes: number;
};
