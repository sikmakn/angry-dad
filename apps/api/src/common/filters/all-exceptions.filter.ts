import { ArgumentsHost, Catch, HttpException, Injectable } from '@nestjs/common';
import type { ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiError } from '../errors/api-error';
@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    let problem: Record<string, unknown>;
    let status: number;
    if (error instanceof ApiError) {
      status = error.status;
      problem = error.body;
    } else if (error instanceof HttpException && [400, 401, 404].includes(error.getStatus())) {
      status = error.getStatus();
      problem = new ApiError(status, ({
        400: 'validation_failed',
        401: 'unauthorized',
        404: 'not_found',
      })[status] ?? 'internal_error').body;
    } else {
      console.error(request.method, request.path, error instanceof Error ? error.name : 'Unknown error');
      status = 500;
      problem = {
        type: 'urn:angry-dad:problem:internal_error',
        title: 'Internal server error',
        status,
      };
    }
    response.status(status).type('application/problem+json').json(problem);
  }
}
