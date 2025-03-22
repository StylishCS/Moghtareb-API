import { Body, Controller, Param, ParseEnumPipe, Post } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';
import { ApiCreatedResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { PresignedUrl } from './entities/presigned-url.entity';
import { DocOperation } from '../../common/swagger/api-operation.decorator';
import { StorageType } from './dto/file.dto';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @DocOperation({
    summary: 'Generates a presigned URL for uploading a file to the specified storage type',
    description: `
To upload a file, follow these steps:
  1. Send a request to this endpoint with the type of upload, MIME type of the file, and size of the file in bytes.
  2. Receive a presigned URL in the response.
  3. Use the presigned URL to upload the file directly to the storage service.
  4. The path and storage type will be used to add the file to the backend.`,
  })
  @ApiParam({ name: 'storage_type', enum: StorageType })
  @ApiCreatedResponse({ type: PresignedUrl })
  @Post('presigned-url/:storage_type')
  createPresignedUrl(
    @Body() file: CreatePresignedUrlDto,
    @Param('storage_type', new ParseEnumPipe(StorageType)) type: StorageType,
  ) {
    return this.storageService.createPresignedUrl(file, type);
  }
}
