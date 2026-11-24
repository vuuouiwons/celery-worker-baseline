import { HttpException, HttpStatus } from "@nestjs/common";

export class AppException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, status);
  }
}

export class ValidationException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class QueueException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_GATEWAY);
  }
}
