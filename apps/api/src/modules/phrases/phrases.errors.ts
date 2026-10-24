import { ApiError } from '../../common/errors/api-error';
export class PhrasesError extends ApiError {
  constructor(status: number, code: 'already_rated' | 'last_enabled_phrase', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
