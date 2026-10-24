import { ApiError } from '../../common/errors/api-error';
export class PaymentsError extends ApiError {
  constructor(status: number, code: 'payment_gateway_unavailable' | 'refund_not_allowed' | 'idempotency_key_reused', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
