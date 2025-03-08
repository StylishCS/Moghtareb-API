import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { UploadType } from '../enums/upload-type.enum';

export enum StorageType {
  S3 = 'S3',
}

/**
 * Data transfer object representing a file.
 */
export class FileDto {
  /**
   * The path of the file in the storage.
   */
  @ApiProperty({ description: 'The path of the file in the storage.' })
  @IsString()
  public path: string;

  /**
   * The type of storage where the file is stored.
   */
  @ApiProperty({ enum: StorageType, description: 'The type of storage where the file is stored' })
  @IsEnum(StorageType)
  public storageType: StorageType;
}

/**
 * Data transfer object for verifying a file upload.
 */
export class VerifyFileDto {
  /**
   * The path of the file to verify.
   */
  @ApiProperty({ description: 'The path of the file to verify' })
  @IsString()
  public path: string;

  /**
   * The upload type of the file to verify.
   */
  @ApiProperty({ enum: StorageType, description: 'The upload type of the file to verify' })
  @IsEnum(StorageType)
  public uploadType: UploadType;
}
