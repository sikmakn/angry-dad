import { Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '../../../database/schemas/user.schema';
import { UsersService } from '../users.service';
import { TelegramAuthService } from '../services/telegram-auth.service';
export interface AuthRequest extends Request {
  user: User;
}
@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly auth: TelegramAuthService, private readonly users: UsersService) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    request.user = await this.users.authenticate(this.auth.verify(request.headers.authorization));
    return true;
  }
}
