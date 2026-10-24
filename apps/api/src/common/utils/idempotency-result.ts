const REPEATED = Symbol('repeated request');
export function repeatedResult<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.defineProperty(value, REPEATED, { value: true });
  }
  return value;
}
export function isRepeatedResult(value: unknown): boolean {
  return value !== null && typeof value === 'object' && (value as Record<symbol, unknown>)[REPEATED] === true;
}
