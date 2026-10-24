import { ApiError } from '../../common/errors/api-error';
export class StrikesError extends ApiError {
  constructor(status: number, code: 'idempotency_key_reused' | 'insufficient_strikes' | 'revoke_exceeds_balance', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
