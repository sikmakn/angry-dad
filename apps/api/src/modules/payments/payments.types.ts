export type PackageResponseView = {
  id: string;
  strikes: number;
  priceStars: number;
};
export type PackageListResponseView = {
  items: (PackageResponseView)[];
};
export type OwnerPackageResponseView = {
  id: string;
  strikes: number;
  priceStars: number;
  active: boolean;
  order: number;
};
export type OwnerPackageListResponseView = {
  items: (OwnerPackageResponseView)[];
};
export type OwnerPackageRequestView = {
  strikes: number;
  priceStars: number;
  active: boolean;
  order: number;
};
export type PackageSnapshotView = {
  strikes: number;
  priceStars: number;
};
export type InvoiceResponseView = {
  invoiceUrl: string;
  packageSnapshot: PackageSnapshotView;
};
export type PaymentStatusView = 'invoiced' | 'paid' | 'credited' | 'refunded';
export type PaymentResponseView = {
  id: string;
  refundable: boolean;
  telegramId: number;
  packageSnapshot: PackageSnapshotView;
  status: PaymentStatusView;
  telegramChargeId?: string;
  paidAt?: string;
  creditedAt?: string;
};
export type PaymentListResponseView = {
  items: (PaymentResponseView)[];
  nextCursor: string | null;
};
export type RefundRequestView = {
  reason: string;
};
export type SupportTicketStatusView = 'open' | 'resolved';
export type SupportTicketResponseView = {
  id: string;
  telegramId: number;
  text: string;
  status: SupportTicketStatusView;
  at: string;
};
export type SupportTicketListResponseView = {
  items: (SupportTicketResponseView)[];
  nextCursor: string | null;
};
export type UpdateSupportTicketRequestView = {
  status: SupportTicketStatusView;
};
export type CreateParaphrasesRequestView = {
  count?: number;
};
