import { ApiError } from '../errors/api-error';
export function decodeCursor(cursor?: string): string | undefined {
  if (cursor === undefined) {
    return undefined;
  }
  try {
    const value = Buffer.from(cursor, 'base64url').toString();
    if (!/^[\w.:-]{1,160}$/.test(value)) {
      throw new Error('cursor');
    }
    return value;
  } catch {
    throw ApiError.invalidRequest();
  }
}
export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64url');
}
