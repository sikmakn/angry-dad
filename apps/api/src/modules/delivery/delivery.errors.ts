import { ApiError } from '../../common/errors/api-error';
export class DeliveryError extends ApiError {
  constructor(status: number, code: 'period_not_active', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
