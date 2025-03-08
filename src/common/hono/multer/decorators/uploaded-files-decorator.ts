// deno-lint-ignore-file no-explicit-any

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { getMultipartRequest } from '../multipart/request';
import type { StorageFile } from '../storage/storage';

export const UploadedFiles = createParamDecorator(
  // deno-lint-ignore require-await
  async (_data: any, ctx: ExecutionContext): Promise<Record<string, StorageFile[]> | StorageFile[] | undefined> => {
    const req = getMultipartRequest(ctx.switchToHttp());

    return req?.storageFiles;
  },
);
