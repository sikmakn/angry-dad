export function isDuplicateKey(error: unknown): boolean {
  return error !== null && typeof error === 'object' && 'code' in error && error.code === 11000;
}
