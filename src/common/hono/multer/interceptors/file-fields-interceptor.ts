// deno-lint-ignore-file no-explicit-any

import { type Observable, tap } from 'rxjs';
import { type CallHandler, type ExecutionContext, mixin, type NestInterceptor, type Type } from '@nestjs/common';

import { getMultipartRequest } from '../multipart/request';
import { transformUploadOptions, type UploadOptions } from '../multipart/options';
import {
  handleMultipartFileFields,
  type UploadField,
  type UploadFieldMapEntry,
  uploadFieldsToMap,
} from '../multipart/handlers/file-fields';

export function FileFieldsInterceptor(uploadFields: UploadField[], options?: UploadOptions): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    private readonly options: UploadOptions;

    private readonly fieldsMap: Map<string, UploadFieldMapEntry>;

    constructor() {
      this.options = transformUploadOptions(options);
      this.fieldsMap = uploadFieldsToMap(uploadFields);
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const req = getMultipartRequest(ctx);

      if (!req.header('content-type')?.startsWith('multipart/form-data')) {
        return next.handle();
      }

      const { body, files, remove } = await handleMultipartFileFields(req, this.fieldsMap, this.options);

      req.body = body;
      req.storageFiles = files;

      return next.handle().pipe(tap(remove));
    }
  }

  const Interceptor = mixin(MixinInterceptor);

  return Interceptor;
}
