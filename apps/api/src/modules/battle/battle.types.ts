import type { RoleView } from '../users/users.types';
export type BattleDialogResponseView = {
  role: RoleView;
  mode: BattleModeView;
  turnInProgress: boolean;
  defeat: number;
  defeatAt: string;
};
export type BattleAuthorView = 'player' | 'character';
export type BattleOriginView = 'turn' | 'reply_to_feed' | 'battle_start' | 'break';
export type BattleMessageResponseView = {
  seq: number;
  author: BattleAuthorView;
  text: string;
  origin: BattleOriginView;
  taskTitle?: string;
};
export type BattleMessageListResponseView = {
  items: (BattleMessageResponseView)[];
  nextCursor: string | null;
};
export type CreateBattleMessageRequestView = {
  text: string;
};
export type CreateBattleQuoteRequestView = {
  feedMessageId: string;
};
export type BattleModeView = 'aggression' | 'defense' | 'confusion' | 'softening';
export type TurnResponseView = {
  damage: number;
  defeatBefore: number;
  defeatAfter: number;
  mode: BattleModeView;
  respectDelta: number;
  respect: number;
  messages: (BattleMessageResponseView)[];
  strikesBalance: number;
};
export type WeakSpotView = {
  key: string;
  description: string;
};
export type RoleCardResponseView = {
  role: RoleView;
  character: string;
  weakSpots: (WeakSpotView)[];
};
export type ReplaceRoleCardRequestView = {
  character: string;
  weakSpots: (WeakSpotView)[];
};
