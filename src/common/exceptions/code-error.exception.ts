// src/common/exceptions/code-error-exception.ts
import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { ErrorCode } from "./error-code.enum";

@ApiSchema({ name: "CodeError" })
export class CodeErrorException<
  const C extends ErrorCode = ErrorCode,
  const I = unknown,
  const M extends string = string
> extends HttpException {
  constructor(
    code: C,
    message: M,
    info: I,
    status: HttpStatus,
    cause?: unknown
  ) {
    super(message, status, { cause });
    this.code = code;
    this.message = message;
    this.info = info;

    if (cause instanceof Error) {
      this.stack = (cause as Error).stack;
    }
  }
  static invalid<const I, const M extends string | undefined = undefined>(
    info: I,
    message?: M
  ): CodeErrorException<
    ErrorCode.Invalid,
    I,
    M extends NonNullable<M> ? M : "Something is invalid"
  > {
    return new CodeErrorException(
      ErrorCode.Invalid,
      (message ? message : `${info} is invalid`) as never,
      info,
      HttpStatus.BAD_REQUEST
    );
  }

  static uniqueConstraintViolation<
    const I,
    const M extends string | undefined = undefined
  >(info: I, message?: M) {
    return new CodeErrorException(
      ErrorCode.UniqueConstraintViolation,
      (message ? message : `${info} already exist`) as never,
      info,
      HttpStatus.CONFLICT
    );
  }

  static internal<const I>(info: I, cause?: unknown) {
    return new CodeErrorException(
      ErrorCode.Internal,
      "An unknown error occurred",
      info,
      HttpStatus.INTERNAL_SERVER_ERROR,
      cause
    );
  }

  static notFound<
    const I extends string,
    const M extends string | undefined = undefined
  >(
    info: I,
    message?: M
  ): CodeErrorException<
    ErrorCode.NotFound,
    I,
    M extends NonNullable<M> ? M : `${I} not found`
  > {
    return new CodeErrorException(
      ErrorCode.NotFound,
      (message ? message : `${info} not found`) as never,
      info,
      HttpStatus.NOT_FOUND
    );
  }

  static unauthorized<
    const I extends string,
    const M extends string | undefined = undefined
  >(info: I, message?: M) {
    return new CodeErrorException(
      ErrorCode.Unauthorized,
      message ?? "Unauthorized",
      info,
      HttpStatus.UNAUTHORIZED
    );
  }

  override getResponse() {
    return {
      code: this.code,
      info: this.info,
      message: this.message,
    };
  }

  /**
   * The error code.
   */
  @ApiProperty({ enum: ErrorCode })
  code: C;

  /**
   * The error message.
   */
  @ApiProperty()
  message: M;

  /**
   * Additional information about the error.
   */
  @ApiProperty({ type: "object", properties: {} })
  info: I;
}
