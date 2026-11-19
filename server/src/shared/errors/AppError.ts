export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class QueueError extends AppError {
  constructor(message: string) {
    super(message, 502);
  }
}
