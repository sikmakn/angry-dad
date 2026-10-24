import { ApiError } from '../../common/errors/api-error';
export class AiError extends ApiError {
  constructor(status: number, code: 'ai_unavailable' | 'daily_limit_reached', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
