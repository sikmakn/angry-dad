import { ApiError } from '../../common/errors/api-error';
export class TasksError extends ApiError {
  constructor(status: number, code: 'deadline_out_of_range' | 'extension_denied' | 'period_not_active' | 'retry_unavailable' | 'task_vague', extra: Record<string, unknown> = {}) {
    super(status, code, extra);
  }
}
