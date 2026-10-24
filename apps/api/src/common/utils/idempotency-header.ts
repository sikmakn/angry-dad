import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { ApiError } from '../errors/api-error';
export const IdempotencyHeader = createParamDecorator((_data: unknown, context: ExecutionContext): {
  key?: string;
} => {
  const key = context.switchToHttp().getRequest<Request>().header('Idempotency-Key');
  if (key !== undefined && (key.length < 8 || key.length > 64)) {
    throw ApiError.invalidRequest();
  }
  return { key };
});
