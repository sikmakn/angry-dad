export type StrikeLotSourceView = 'purchase' | 'manual';
export type StrikeLotResponseView = {
  source: StrikeLotSourceView;
  total: number;
  remaining: number;
  createdAt: string;
};
export type StrikeBalanceResponseView = {
  balance: number;
  lots: (StrikeLotResponseView)[];
};
export type OwnerStrikeLotResponseView = {
  source: StrikeLotSourceView;
  total: number;
  remaining: number;
  createdAt: string;
  refundedAt?: string;
};
export type OwnerStrikeBalanceResponseView = {
  balance: number;
  lots: (OwnerStrikeLotResponseView)[];
};
export type StrikeOperationTypeView = 'purchase' | 'spend' | 'turn_refund' | 'manual_grant' | 'manual_revoke' | 'stars_refund';
export type StrikeOperationResponseView = {
  type: StrikeOperationTypeView;
  amount: number;
  reason?: string;
  at: string;
};
export type StrikeOperationListResponseView = {
  items: (StrikeOperationResponseView)[];
  nextCursor: string | null;
};
export type CreateStrikeOperationRequestView = {
  type: 'manual_grant' | 'manual_revoke';
  amount: number;
  reason: string;
};
