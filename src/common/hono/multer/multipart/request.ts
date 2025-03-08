// deno-lint-ignore-file no-explicit-any

import { BadRequestException } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';

import type { StorageFile } from '../storage';
import type { HonoRequest } from '../../interfaces';
import type { MultipartFile } from './file';
import type { UploadOptions } from './options';

export type THonoRequest = HonoRequest & {
  files: Record<string, File[]>;
  body: Record<string, any>;
  storageFile?: StorageFile;
  storageFiles?: StorageFile[] | Record<string, StorageFile[]>;
};

export const getMultipartRequest = (ctx: HttpArgumentsHost) => {
  const req = ctx.getRequest<THonoRequest>();

  return req;
};

export const getParts = (req: THonoRequest, options: UploadOptions) => {
  const parts = req.body;

  for (const [key, file] of Object.entries(parts)) {
    if (file instanceof File && options?.limits?.fileSize && file.size > options.limits.fileSize) {
      throw new BadRequestException(`File ${key} is too large. Maximum size is ${options.limits.fileSize} bytes`);
    }
  }

  return parts;
};

export type MultipartsIterator = AsyncIterableIterator<MultipartFile>;
