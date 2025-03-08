import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { UploadType } from '../enums/upload-type.enum';
import { IsEnum, IsInt, IsNumber, IsPositive, Max, Min } from 'class-validator';
import { SupportedMime } from '../enums/supported-mime.enum';

/**
 * A request to create a presigned URL for uploading.
 */
@ApiSchema({
  name: 'CreatePresignedUrlRequest',
})
export class CreatePresignedUrlDto {
  /**
   * The type of upload, e.g., whether it is an image, video, etc.
   */
  @ApiProperty({
    description: 'The type of upload, e.g., whether it is an image, video, etc.',
    enum: UploadType,
  })
  @IsEnum(UploadType)
  type: UploadType;

  /**
   * The MIME type of the file being uploaded (e.g., image/png, video/mp4).
   */
  @ApiProperty({
    description: 'The MIME type of the file being uploaded (e.g., image/png, video/mp4).',
    enum: SupportedMime,
  })
  @IsEnum(SupportedMime)
  mime: SupportedMime;

  /**
   * The size of the file in bytes. Must be a positive integer and not exceed 15 MB.
   */
  @ApiProperty({
    description: 'The size of the file in bytes. Must be a positive integer and not exceed 15 MB.',
    example: 1048576, // Example value: 1 MB
  })
  @IsNumber()
  @IsPositive()
  @IsInt()
  @Max(15 * 1024 * 1024) // Max 15 MB
  size: number;
}

export class CreatePresignUrlWithStorageTypeDto extends CreatePresignedUrlDto {
  /**
   * The storage type of the file being uploaded.
   */
  @ApiProperty({
    description: 'The storage type of the file being uploaded.',
    enum: UploadType,
  })
  @IsEnum(UploadType)
  storageType: UploadType;
}
