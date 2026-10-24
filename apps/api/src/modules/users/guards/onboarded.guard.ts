import { UsersError } from '../users.errors';
import { Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { AuthRequest } from './telegram-auth.guard';
@Injectable()
export class OnboardedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.switchToHttp().getRequest<AuthRequest>().user.onboarding !== 'done') {
      throw new UsersError(403, 'onboarding_required');
    }
    return true;
  }
}
