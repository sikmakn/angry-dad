export function present<T>(value: unknown, keys: readonly string[]): T {
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const item = key === 'id' ? source._id : source[key];
    if (item !== undefined) {
      result[key] = item instanceof Date ? item.toISOString() : item;
    }
  }
  return result as T;
}
export interface PageInput {
  limit?: number;
  cursor?: string;
}
export function pageSize(input: PageInput): number {
  return input.limit ?? 50;
}
