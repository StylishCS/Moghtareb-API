import { ApiProperty } from '@nestjs/swagger';

/**
 * Presigned url to upload a file
 */
export class PresignedUrl {
  /**
   * The path of the file, its a string with the type and mime of the file
   * @example /image.png
   */
  @ApiProperty({
    description: 'The path of the file',
    example: '/type/image.png',
  })
  path: string;

  /**
   * The url to upload the file
   */
  @ApiProperty({
    description: 'The url to upload the file',
  })
  url: string;
}
