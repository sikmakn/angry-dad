import type { Body, Problem, Query, Result } from './contract';
import { endpoints, type ClientOperation } from './operations';
import { config, telegram } from '../platform/telegram';

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: Problem;

  constructor(status: number, problem?: Problem) {
    super(problem?.reply ?? 'Не получилось, ещё раз?');
    this.status = status;
    this.problem = problem;
  }
}

// A proxy may return HTML or an unrelated JSON error. Do not expose it as a Problem.
function isProblem(value: unknown): value is Problem {
  if (!value || typeof value !== 'object' || !('type' in value) || typeof value.type !== 'string'
    || !value.type.startsWith('urn:angry-dad:problem:') || !('status' in value) || typeof value.status !== 'number'
    || !('title' in value) || typeof value.title !== 'string') {
    return false;
  }
  return (!('reply' in value) || typeof value.reply === 'string')
    && (!('errors' in value) || (Array.isArray(value.errors) && value.errors.every(item => item && typeof item === 'object'
      && typeof item.field === 'string' && typeof item.message === 'string')));
}

export interface RequestOptions<K extends ClientOperation> {
  body?: Body<K>;
  path?: Record<string, string>;
  query?: Query<K>;
  signal?: AbortSignal;
  key?: string;
}

export async function request<K extends ClientOperation>(operation: K, options: RequestOptions<K> = {}): Promise<Result<K>> {
  const [method, template] = endpoints[operation];
  const path = template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = options.path?.[name];
    if (!value) {
      throw new Error(`Missing path parameter: ${name}`);
    }
    return encodeURIComponent(value);
  });
  const url = new URL(`${config.apiBase}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  const initData = config.mocks ? 'mock-session' : telegram()?.initData;
  if (!initData) {
    throw new ApiError(401);
  }
  const headers = new Headers({ Authorization: `tma ${initData}` });
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.key) {
    headers.set('Idempotency-Key', options.key);
  }
  // No transport retries, especially for writes. Battle timeout exceeds server's 30s.
  const signal = AbortSignal.any([AbortSignal.timeout(40000), ...(options.signal ? [options.signal] : [])]);
  const response = await fetch(url, { method, headers, signal, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  if (!response.ok) {
    const problem: unknown = await response.json().catch(() => undefined);
    throw new ApiError(response.status, isProblem(problem) ? problem : undefined);
  }
  return response.status === 204 ? undefined as Result<K> : response.json() as Promise<Result<K>>;
}

export function errorText(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Связь оборвалась. Результат неизвестен. Обнови данные перед новой попыткой.';
  }
  if (error.problem?.reply) {
    return error.problem.reply;
  }
  const code = error.problem?.type.split(':').at(-1);
  const messages: Record<string, string> = {
    unauthorized: 'Открой приложение заново через Telegram.',
    init_data_expired: 'Вход устарел. Открой приложение заново через Telegram.',
    owner_only: 'Сюда только владельцу.',
    not_found: 'Задачи нет. Возможно, она удалена.',
    period_not_active: error.problem?.periodStatus === 'done' ? 'Задача уже закрыта' : 'Задача уже провалена',
    daily_limit_reached: 'Ставить и переименовывать задачи снова можно после 00:00. Проверки прогресса продолжаются.',
    deadline_out_of_range: 'Срок — от 15 минут до 365 дней.',
    ai_unavailable: 'Батя сейчас не может прочитать название. Попробуй позже.',
    already_rated: 'Уже оценено',
    insufficient_strikes: 'Удары закончились. Чтобы ответить, купи ещё.',
    turn_in_progress: 'Ход ещё в обработке. Подожди.',
    turn_failed: 'Ход не засчитан. Удар возвращён, шкалы не изменились.',
    last_enabled_phrase: 'В ячейке не останется фраз',
    refund_not_allowed: 'Возврат невозможен: из партии уже потрачены удары или пользователь удалён.',
    revoke_exceeds_balance: 'Недостаточно ударов для списания.',
    share_failed: 'Не получилось, ещё раз?',
    payment_gateway_unavailable: 'Оплата сейчас недоступна. Попробуй позже.',
    role_mismatch: 'Родитель изменился. Обнови страницу.',
  };
  return messages[code ?? ''] ?? error.problem?.errors?.map(item => item.message).join('. ') ?? 'Не получилось, ещё раз?';
}
