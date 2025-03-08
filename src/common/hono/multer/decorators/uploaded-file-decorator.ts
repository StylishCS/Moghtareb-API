import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { getMultipartRequest } from '../multipart/request';
import type { StorageFile } from '../storage/storage';

export const UploadedFile = createParamDecorator(
  // deno-lint-ignore require-await
  async (_data, ctx: ExecutionContext): Promise<StorageFile | undefined> => {
    const req = getMultipartRequest(ctx.switchToHttp());

    return req?.storageFile;
  },
);
