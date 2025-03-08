import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Context } from 'hono';

export const User = createParamDecorator((field: string, req: ExecutionContext) => {
  const ctx = req.switchToHttp().getResponse() as Context;
  const user = ctx.get('user');
  if (!user) {
    throw new Error("User does not exist within the request, please ensure you're placing the auth decorator");
  }
  return field ? user[field] : user;
});
