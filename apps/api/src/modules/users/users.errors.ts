import { ApiError } from '../../common/errors/api-error';
export class UsersError extends ApiError {
  constructor(status: number, code: 'already_onboarded' | 'init_data_expired' | 'onboarding_required' | 'owner_only', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
