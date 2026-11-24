import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      let message = exception.message;

      if (typeof body === "object" && body !== null && "message" in body) {
        const rawMessage = (body as { message: string | string[] }).message;
        message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage;
      }

      response.status(status).json({
        success: false,
        error: message,
      });
      return;
    }

    console.error("[ServerError]:", exception);
    const errorMessage =
      exception instanceof Error ? exception.message : "Internal Server Error";
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: errorMessage,
    });
  }
}
