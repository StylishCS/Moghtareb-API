// @deno-types="@types/busboy"
import type busboy from 'busboy';

import { DiskStorage, MemoryStorage, type Storage } from '../storage';
import type { UploadFilterHandler } from './filter';

export type UploadOptions = busboy.BusboyConfig & {
  dest?: string;
  storage?: Storage;
  filter?: UploadFilterHandler;
};

export const DEFAULT_UPLOAD_OPTIONS: Partial<UploadOptions> = {
  storage: new MemoryStorage(),
};

export const transformUploadOptions = (opts?: UploadOptions): UploadOptions => {
  if (opts == null) return DEFAULT_UPLOAD_OPTIONS;

  if (opts.dest != null) {
    return {
      ...opts,
      storage: new DiskStorage({
        dest: opts.dest,
        ...opts.storage?.options,
      }),
    };
  }

  return { ...DEFAULT_UPLOAD_OPTIONS, ...opts };
};
