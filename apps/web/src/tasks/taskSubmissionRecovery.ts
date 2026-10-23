import type { TaskScheduleDraft } from './types';

export interface TaskSubmissionRecovery {
  title: string;
  schedule: TaskScheduleDraft;
}

const memory = new Map<string, TaskSubmissionRecovery>();
const storageKey = (scope: string) => `angry-dad:task-submission:${scope}`;

export function readTaskSubmission(scope: string): TaskSubmissionRecovery | undefined {
  try {
    const raw = sessionStorage.getItem(storageKey(scope));
    if (!raw) {
      return memory.get(scope);
    }
    const saved = JSON.parse(raw) as TaskSubmissionRecovery;
    if (typeof saved.title !== 'string' || !saved.schedule || typeof saved.schedule.day !== 'string' || typeof saved.schedule.time !== 'string' || !['one_time', 'recurring'].includes(saved.schedule.kind)) {
      return memory.get(scope);
    }
    return saved;
  } catch {
    return memory.get(scope);
  }
}

export function rememberTaskSubmission(scope: string, draft: TaskSubmissionRecovery) {
  memory.set(scope, draft);
  try {
    sessionStorage.setItem(storageKey(scope), JSON.stringify(draft));
  } catch { /* In-memory guard still survives navigation when browser storage is unavailable. */ }
}

export function clearTaskSubmission(scope: string) {
  memory.delete(scope);
  try {
    sessionStorage.removeItem(storageKey(scope));
  } catch { /* Storage may be unavailable in the embedded browser. */ }
}
