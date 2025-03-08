import { type ArgumentsHost, Catch, type ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { capitalize } from 'lodash-es';
import { DatabaseError } from 'pg';
import { singular } from 'pluralize';
import { CodeErrorException } from '../exceptions/code-error.exception';

@Catch(DatabaseError)
export class DatabaseExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: DatabaseError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let codeError: CodeErrorException = CodeErrorException.internal(
      null,
      exception
    );
    switch (exception.code) {
      case '23505': {
        const facility = exception.constraint || '';
        codeError = CodeErrorException.uniqueConstraintViolation(
          capitalize(singular(facility))
        );
        break;
      }
      case '23503':
        {
          const regex = /table\s"([^"]+)"/;
          const match = exception.detail?.match(regex)?.[1] || '';
          codeError = CodeErrorException.notFound(capitalize(singular(match)));
        }
        break;
      default:
        Logger.error({ ...exception });
        codeError = CodeErrorException.internal(null, exception);
        break;
    }
    httpAdapter.setHeader(response, 'Content-Type', 'application/json');
    httpAdapter.reply(response, codeError.getResponse(), codeError.getStatus());
  }
}
