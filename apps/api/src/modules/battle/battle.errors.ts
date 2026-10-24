import { ApiError } from '../../common/errors/api-error';
export class BattleError extends ApiError {
  constructor(status: number, code: 'idempotency_key_reused' | 'role_mismatch' | 'turn_failed' | 'turn_in_progress', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
