import { UsersError } from '../users.errors';
import { Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import type { AuthRequest } from './telegram-auth.guard';
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) { }
  canActivate(context: ExecutionContext): boolean {
    if (context.switchToHttp().getRequest<AuthRequest>().user.telegramId !== this.config.ownerId) {
      throw new UsersError(403, 'owner_only');
    }
    return true;
  }
}
