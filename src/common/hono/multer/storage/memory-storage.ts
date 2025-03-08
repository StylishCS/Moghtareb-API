import type { Storage, StorageFile } from './storage';
import type { HonoRequest } from '../../interfaces';
import { Buffer } from 'node:buffer';

export interface MemoryStorageFile extends StorageFile {
  buffer: Buffer;
}

export class MemoryStorage implements Storage<MemoryStorageFile> {
  public async handleFile(file: File, _req: HonoRequest, fieldName: string) {
    const buffer = await file.arrayBuffer().then(Buffer.from);

    return {
      buffer,
      size: buffer.length,
      encoding: 'utf-8',
      mimetype: file.type,
      fieldname: fieldName,
      originalFilename: file.name,
    };
  }

  public removeFile(file: MemoryStorageFile) {
    file.buffer = Buffer.alloc(0);
  }
}
