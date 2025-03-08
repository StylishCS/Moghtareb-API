import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CodeErrorException } from '../exceptions/code-error.exception';

export const ApiCodeError = (c: CodeErrorException) => {
  return applyDecorators(
    ApiResponse({
      status: c.getStatus(),
      type: CodeErrorException,
      example: c.getResponse(),
      examples: {},
    })
  );
};

export const ApiCodeErrors = (
  examples: {
    name: string;
    summary: string;
    value: CodeErrorException;
  }[],
) => {
  return applyDecorators(
    ApiResponse({
      status: examples[0].value.getStatus(),
      type: CodeErrorException,
      examples: Object.fromEntries(examples.map((i) => [i.name, { summary: i.summary, value: i.value.getResponse() }])),
    }),
  );
};

export const ApiNotFound = (...which: string[]) => {
  return applyDecorators(
    ApiCodeErrors(which.map((i) => ({ name: i, summary: `${i} not found`, value: CodeErrorException.notFound(i) }))),
  );
};

export const ApiInvalid = (...which: string[]) => {
  return applyDecorators(
    ApiCodeErrors(which.map((i) => ({ name: i, summary: `Invalid: ${i}`, value: CodeErrorException.invalid(i) }))),
  );
};

export const ApiUniqueConstraintViolation = (...which: string[]) => {
  return applyDecorators(
    ApiCodeErrors(
      which.map((i) => ({ name: i, summary: `${i} already exist`, value: CodeErrorException.uniqueConstraintViolation(i) })),
    ),
  );
}