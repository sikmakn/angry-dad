export type PhraseCategoryView = 'on_greeting' | 'on_task_set' | 'on_delete' | 'on_vague' | 'on_reminder' | 'on_check_in' | 'on_check_in_reply' | 'on_check_in_missed' | 'on_fail' | 'on_excuse' | 'on_excuse_denied' | 'on_retry' | 'on_success' | 'on_absent' | 'on_battle_start' | 'on_break' | 'on_recovery';
export type PhraseRoleView = 'father' | 'mother' | 'any';
export type PhraseStatusView = 'enabled' | 'disabled' | 'pending_review';
export type RatingView = 0 | 1 | 2;
export type RateFeedMessageRequestView = {
  score: RatingView;
};
export type PhraseComboView = 'father_son' | 'father_daughter' | 'mother_son' | 'mother_daughter' | 'any';
export type PhraseDefeatLevelView = '1' | '2' | '3' | '4' | 'any';
export type PhraseSourceView = 'owner' | 'subscriber' | 'paraphrase';
export type PhraseResponseView = {
  id: string;
  role: PhraseRoleView;
  category: PhraseCategoryView;
  level?: number;
  defeatLevel: PhraseDefeatLevelView;
  combo: PhraseComboView;
  template: string;
  source: PhraseSourceView;
  author?: string;
  status: PhraseStatusView;
  shows: number;
  votes: number;
  scoreSum: number;
  belowThreshold: boolean;
};
export type PhraseListResponseView = {
  items: (PhraseResponseView)[];
  nextCursor: string | null;
};
export type PhraseItemsResponseView = {
  items: (PhraseResponseView)[];
};
export type CreatePhraseRequestView = {
  role: PhraseRoleView;
  category: PhraseCategoryView;
  level?: number;
  defeatLevel: PhraseDefeatLevelView;
  combo: PhraseComboView;
  template: string;
  source: 'owner' | 'subscriber';
  author?: string;
};
export type UpdatePhraseRequestView = {
  status: 'enabled' | 'disabled';
};
export type PhraseCoverageItemView = {
  role: PhraseRoleView;
  category: PhraseCategoryView;
  level?: number;
  defeatLevel: PhraseDefeatLevelView;
  combo: PhraseComboView;
  enabledCount: number;
  required: number;
};
export type PhraseCoverageResponseView = {
  items: (PhraseCoverageItemView)[];
};
