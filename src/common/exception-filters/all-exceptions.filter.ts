import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { CodeErrorException } from "../exceptions/code-error.exception";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = !(exception instanceof HttpException)
      ? CodeErrorException.internal(null, exception)
      : exception;

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      Logger.error(error.message, error.stack);
    }

    httpAdapter.setHeader(response, "Content-Type", "application/json");
    httpAdapter.reply(response, error.getResponse(), httpStatus);
  }
}
