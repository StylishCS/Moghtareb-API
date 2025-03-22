import { ApiProperty } from "@nestjs/swagger";
import { MultiLanguageDto } from "../../../common/dto/multi-language.dto";
import { FileDto } from "../../storage/dto/file.dto";
import { Exclude, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateAdBedroomDto {
  @Type(() => MultiLanguageDto)
  @ValidateNested()
  @ApiProperty({ type: MultiLanguageDto })
  occupancy: MultiLanguageDto;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  rate: number;

  @Exclude()
  adId: number;
}
export class GeometryPointDto {
  @ApiProperty()
  @IsNumber()
  x: number;
  @ApiProperty()
  @IsNumber()
  y: number;
}

export class CreateAdDto {
  @ApiProperty({ type: GeometryPointDto })
  @ValidateNested()
  @Type(() => GeometryPointDto)
  location: GeometryPointDto;

  @Type(() => MultiLanguageDto)
  @ValidateNested()
  @ApiProperty({ type: MultiLanguageDto })
  addressDetails: MultiLanguageDto;

  @Type(() => MultiLanguageDto)
  @ValidateNested()
  @ApiProperty({ type: MultiLanguageDto })
  apartmentType: MultiLanguageDto;

  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  isFurnished: boolean;

  @Type(() => MultiLanguageDto)
  @ValidateNested()
  @ApiProperty({ type: MultiLanguageDto })
  occupierCategory: MultiLanguageDto;

  @Type(() => MultiLanguageDto)
  @ValidateNested()
  @ApiProperty({ type: MultiLanguageDto })
  level: MultiLanguageDto;

  @Type(() => MultiLanguageDto)
  @ValidateNested()
  @ApiProperty({ type: MultiLanguageDto })
  amenities: MultiLanguageDto;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  bathroomCount: number;

  @Type(() => MultiLanguageDto)
  @ValidateNested()
  @ApiProperty({ type: MultiLanguageDto })
  rateIncludes: MultiLanguageDto;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  administrativeFees: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  insurance: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  rate: number;

  @Type(() => MultiLanguageDto)
  @ApiProperty({ type: MultiLanguageDto, nullable: true })
  @ValidateNested()
  @IsOptional()
  additionalDetails?: MultiLanguageDto;

  @Type(() => FileDto)
  @ApiProperty({ type: FileDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  images: FileDto[];

  @Type(() => CreateAdBedroomDto)
  @ApiProperty({ type: CreateAdBedroomDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  adBedrooms: CreateAdBedroomDto[];
}
