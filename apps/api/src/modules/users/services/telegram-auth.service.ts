import { UsersError } from '../users.errors';
import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AppConfigService } from '../../../config/app-config.service';
import { ApiError } from '../../../common/errors/api-error';
export interface TelegramIdentity {
  id: number;
  username?: string;
  first_name?: string;
}
@Injectable()
export class TelegramAuthService {
  constructor(private readonly config: AppConfigService) { }
  verify(header?: string): TelegramIdentity {
    if (!header?.startsWith('tma ')) {
      throw ApiError.unauthorized();
    }
    const params = new URLSearchParams(header.slice(4));
    const hash = params.get('hash');
    if (!hash || !/^[a-f0-9]{64}$/i.test(hash) || new Set(params.keys()).size !== [...params.keys()].length) {
      throw ApiError.unauthorized();
    }
    params.delete('hash');
    const secret = createHmac('sha256', 'WebAppData').update(this.config.botToken).digest();
    const expected = createHmac('sha256', secret).update([...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n')).digest();
    if (!timingSafeEqual(expected, Buffer.from(hash, 'hex'))) {
      throw ApiError.unauthorized();
    }
    const age = Date.now() / 1000 - Number(params.get('auth_date'));
    if (!Number.isFinite(age) || age < -30 || age > this.config.authMaxAge) {
      throw new UsersError(401, 'init_data_expired');
    }
    try {
      const user = JSON.parse(params.get('user') ?? '') as TelegramIdentity;
      if (!Number.isSafeInteger(user.id) || user.id <= 0 || (user.username !== undefined && typeof user.username !== 'string') || (user.first_name !== undefined && typeof user.first_name !== 'string')) {
        throw new Error('identity');
      }
      return user;
    } catch {
      throw ApiError.unauthorized();
    }
  }
}
