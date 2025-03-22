import {
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { Redis } from "ioredis";
import { IUploadingImage } from "./interfaces/uploading-image.interface";
import { Effect } from "effect";
import {
  IStorage,
  VerifyFileUploadError,
} from "./interfaces/storage.interface";
import { CreatePresignedUrlDto } from "./dto/create-presigned-url.dto";
import { randomUUID } from "node:crypto";
import mime from "mime";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { VerifyFileDto } from "./dto/file.dto";
import { IConfig } from "../../config/config.interface";

@Injectable()
export class S3Service implements IStorage {
  private redis: Redis;
  private bucketName: string = this.config.s3.bucketName;
  private client = new S3Client({
    endpoint: this.config.s3.endpoint,
    region: this.config.s3.region,
    forcePathStyle: this.config.s3.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: this.config.s3.accessKey,
      secretAccessKey: this.config.s3.secretKey,
    },
  });

  constructor(
    private redisService: RedisService,
    private readonly config: IConfig
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  /**
   * Verifies if a file has been uploaded to S3.
   *
   * @param file - The file details used to verify the file upload.
   * @returns An effect that resolves if the file exists and the type matches;
   * otherwise, it rejects with an error if the file does not exist or the type does not match.
   */
  verifyFileUpload(file: VerifyFileDto) {
    return Effect.gen(this, function* () {
      const uploadedFile = yield* Effect.tryPromise(() =>
        this.getUploadingImage(file.path)
      );
      if (!uploadedFile)
        return yield* Effect.fail(VerifyFileUploadError.NotFound);
      if (uploadedFile.type !== file.uploadType)
        return yield* Effect.fail(VerifyFileUploadError.InvalidType);

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: file.path,
      });

      return yield* Effect.tryPromise({
        try: (abortSignal) => this.client.send(command, { abortSignal }),
        catch: (cause) =>
          cause instanceof NotFound
            ? VerifyFileUploadError.NotFound
            : (cause as S3ServiceException),
      });
    });
  }

  /**
   * Generates a presigned URL for uploading a file to AWS S3.
   *
   * @param file - The file details used to generate the presigned URL.
   * @returns An effect that resolves to the presigned URL and the path of the file.
   */
  createPresignedUrl(file: CreatePresignedUrlDto) {
    return Effect.gen(this, function* () {
      const id = randomUUID().replace(/-/g, "");
      const path = `${file.type}/${id}.${mime.getExtension(file.mime)}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: path,
        ContentType: file.mime,
        ContentLength: file.size,
      });

      const presignedUrl = yield* Effect.tryPromise(() =>
        getSignedUrl(this.client, command, {
          expiresIn: 1 * 60 * 60,
        })
      );

      const uploadingImage: IUploadingImage = {
        type: file.type,
        mime: file.mime,
      };

      yield* Effect.tryPromise(() =>
        this.setUploadingImage(path, uploadingImage)
      );

      return {
        url: presignedUrl,
        path,
      };
    });
  }

  /**
   * Retrieves the uploading image details from Redis for the given ID.
   *
   * @param id - The unique identifier of the image.
   * @returns A promise that resolves to the uploading image details if found;
   *          otherwise, returns null.
   */
  async getUploadingImage(id: string): Promise<IUploadingImage | null> {
    const json = await this.redis.get(this.uploadingFileNs(id));
    return JSON.parse(json as string) ?? null;
  }

  /**
   * Stores the uploading image details in Redis.
   *
   * @param id - The unique identifier of the image.
   * @param file - The uploading image details to be stored.
   */

  async setUploadingImage(id: string, file: IUploadingImage) {
    await this.redis.set(
      this.uploadingFileNs(id),
      JSON.stringify(file),
      "EX",
      60 * 60
    );
  }

  /**
   * Creates a Redis namespace string for storing uploading file details.
   *
   * @param id - The unique identifier of the image.
   * @returns A Redis namespace string.
   */
  private uploadingFileNs(id: string) {
    return `s3-uploading-file:${id}`;
  }
}
