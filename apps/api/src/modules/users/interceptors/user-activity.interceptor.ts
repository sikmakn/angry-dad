import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { AuthRequest } from '../guards/telegram-auth.guard';
import { UsersService } from '../users.service';
@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(private readonly users: UsersService) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const at = new Date();
    const request = context.switchToHttp().getRequest<Partial<AuthRequest>>();
    const path = (request.route as { path?: string } | undefined)?.path ?? '';
    const route = path.startsWith('/api/') ? path.slice(4) : path;
    const opening = request.method === 'GET' && route === '/me';
    const mutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method ?? '')
      && route !== '/owner' && !route.startsWith('/owner/')
      && !(request.method === 'DELETE' && route === '/me');
    if (request.user && (opening || mutation)) {
      await this.users.observeActivity(request.user._id, true, at);
    }
    return next.handle();
  }
}
