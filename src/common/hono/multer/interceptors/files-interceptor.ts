// deno-lint-ignore-file no-explicit-any

import { type Observable, tap } from 'rxjs';
import { type CallHandler, type ExecutionContext, mixin, type NestInterceptor, type Type } from '@nestjs/common';

import { getMultipartRequest } from '../multipart/request';
import { transformUploadOptions, type UploadOptions } from '../multipart/options';
import { handleMultipartMultipleFiles } from '../multipart/handlers/multiple-files';

export function FilesInterceptor(fieldname: string, maxCount = 1, options?: UploadOptions): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    private readonly options: UploadOptions;

    constructor() {
      this.options = transformUploadOptions(options);
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const req = getMultipartRequest(ctx);

      if (!req.header('content-type')?.startsWith('multipart/form-data')) {
        return next.handle();
      }

      const { body, files, remove } = await handleMultipartMultipleFiles(req, fieldname, maxCount, this.options);

      req.body = body;
      req.storageFiles = files;

      return next.handle().pipe(tap(remove));
    }
  }

  const Interceptor = mixin(MixinInterceptor);

  return Interceptor;
}
