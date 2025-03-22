import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';
import { IStorage } from './interfaces/storage.interface';

import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';
import { UploadType } from './enums/upload-type.enum';
import { FileDto, StorageType } from './dto/file.dto';

@Injectable()
export class StorageService {
  storages: Record<StorageType, IStorage>;
  constructor(s3: S3Service) {
    this.storages = {
      [StorageType.S3]: s3,
    };
  }

  /**
   * Verifies if a file has been uploaded to the specified storage service.
   *
   * @param file - The file details used to verify the file upload.

   * @param storageType - The type of storage service to use for verification.
   * @returns An effect that resolves to the file path of the uploaded file if it exists
   * and the type matches; otherwise, it rejects with an error if the file does not
   * exist or the type does not match.
   */

  verifyFileUpload(file: FileDto, uploadFileType: UploadType) {
    return this.getStorage(file.storageType).verifyFileUpload({ path: file.path, uploadType: uploadFileType });
  }

  /**
   * Generates a presigned URL for uploading a file to the specified storage type.
   *
   * @param file - The details of the file for which to generate the presigned URL.
   * @param storageType - The type of storage service to use for uploading the file.
   * @returns An effect that resolves to the presigned URL.
   */

  createPresignedUrl(file: CreatePresignedUrlDto, storageType: StorageType) {
    return this.getStorage(storageType).createPresignedUrl(file);
  }

  /**
   * Retrieves the storage service for the given type.
   *
   * @param type - The type of storage to retrieve.
   * @returns The storage service for the given type.
   */
  getStorage(type: StorageType): IStorage {
    return this.storages[type];
  }
}
