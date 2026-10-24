import { ApiError } from '../../common/errors/api-error';
export class SharingError extends ApiError {
  constructor(status: number, code: 'share_failed', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
