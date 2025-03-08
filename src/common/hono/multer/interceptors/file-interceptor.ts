// deno-lint-ignore-file no-explicit-any

import { type Observable, tap } from 'rxjs';
import { type CallHandler, type ExecutionContext, mixin, type NestInterceptor, type Type } from '@nestjs/common';

import { getMultipartRequest } from '../multipart/request';
import { transformUploadOptions, type UploadOptions } from '../multipart/options';
import { handleMultipartSingleFile } from '../multipart/handlers/single-file';

export function FileInterceptor(fieldname: string, options?: UploadOptions): Type<NestInterceptor> {
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

      const { file, body, remove } = await handleMultipartSingleFile(req, fieldname, this.options);

      req.body = body;
      req.storageFile = file;

      return next.handle().pipe(tap(remove));
    }
  }

  const Interceptor = mixin(MixinInterceptor);

  return Interceptor;
}
