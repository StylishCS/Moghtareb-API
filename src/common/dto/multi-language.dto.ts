import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MultiLanguageDto {
  @ApiProperty()
  @IsString()
  ar: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  en?: string;
}