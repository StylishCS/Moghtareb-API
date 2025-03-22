import { HeadObjectOutput, S3ServiceException } from '@aws-sdk/client-s3';
import { CreatePresignedUrlDto } from '../dto/create-presigned-url.dto';
import { Cause, Effect } from 'effect';
import { PresignedUrl } from '../entities/presigned-url.entity';
import { VerifyFileDto } from '../dto/file.dto';

export enum VerifyFileUploadError {
  NotFound = 0,
  InvalidType = 1,
}

export type FilePath = string & {};

/**
 * Interface representing storage operations.
 */
export interface IStorage {
  /**
   * Verifies if a file has been uploaded to the storage service.
   *
   * @param file - The file details used to verify the file upload.
   * @returns An effect that resolves to the file path of the uploaded file if it exists and the type matches;
   * otherwise, it rejects with an error if the file does not exist or the type does not match.
   */
  verifyFileUpload(
    file: VerifyFileDto,
  ): Effect.Effect<HeadObjectOutput, VerifyFileUploadError | S3ServiceException | Cause.UnknownException>;

  /**
   * Generates a presigned URL for uploading a file to AWS S3.
   *
   * @param file - The file details used to generate the presigned URL.
   * @returns An effect that resolves to the presigned URL.
   */
  createPresignedUrl(file: CreatePresignedUrlDto): Effect.Effect<PresignedUrl, Cause.UnknownException>;
}
