export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, readonly extra: Record<string, unknown> = {}) {
    super(code.replaceAll('_', ' '));
  }

  get body(): Record<string, unknown> {
    return {
      type: `urn:angry-dad:problem:${this.code}`,
      title: this.message,
      status: this.status,
      ...this.extra,
    };
  }

  static invalidRequest(): ApiError {
    return new ApiError(400, 'validation_failed');
  }

  static unauthorized(): ApiError {
    return new ApiError(401, 'unauthorized');
  }

  static notFound(): ApiError {
    return new ApiError(404, 'not_found');
  }
}
