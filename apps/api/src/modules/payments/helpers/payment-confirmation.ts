import { isDuplicateKey } from '../../../common/utils/mongo-error';

export interface PaymentConfirmation {
  telegramId: number;
  payload: string;
  currency: string;
  total: number;
  chargeId: string;
  paidAt?: Date;
}

export function duplicatePaymentKey(error: unknown, field: 'clientKey' | 'telegramChargeId'): boolean {
  if (!isDuplicateKey(error)) {
    return false;
  }
  const pattern = (error as { keyPattern?: Record<string, number> }).keyPattern;
  return field === 'clientKey'
    ? pattern?.userId === 1 && pattern.clientKey === 1 && Object.keys(pattern).length === 2
    : pattern?.telegramChargeId === 1 && Object.keys(pattern).length === 1;
}
