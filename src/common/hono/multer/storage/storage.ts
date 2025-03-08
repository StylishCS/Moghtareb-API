import type { HonoRequest } from '../../interfaces';

export interface StorageFile {
  size: number;
  fieldname: string;
  encoding: string;
  mimetype: string;
  originalFilename: string;
}

export interface Storage<T extends StorageFile = StorageFile, K = object> {
  handleFile: (file: File, req: HonoRequest, fieldName: string) => Promise<T>;
  removeFile: (file: T, force?: boolean) => Promise<void> | void;
  options?: K;
}
