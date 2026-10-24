import { ApiError } from '../../common/errors/api-error';
export class BotError extends ApiError {
  constructor(status: number, code: 'payment_gateway_unavailable', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
