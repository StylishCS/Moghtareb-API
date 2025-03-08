import type { HonoRequest as Request } from 'hono';

export type HonoRequest = Request & {
  headers?: Record<string, string>;
};
