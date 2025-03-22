import { ApiProperty } from "@nestjs/swagger";
import { MultiLanguageDto } from "../../../common/dto/multi-language.dto";
import { CreateAdBedroomDto, GeometryPointDto } from "../dto/create-ad.dto";
import { FileDto } from "../../storage/dto/file.dto";

export class AdEntity {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: GeometryPointDto })
  location: GeometryPointDto;

  @ApiProperty({ type: MultiLanguageDto })
  addressDetails: MultiLanguageDto;

  @ApiProperty({ type: MultiLanguageDto })
  apartmentType: MultiLanguageDto;

  @ApiProperty({ type: Boolean })
  isFurnished: boolean;

  @ApiProperty({ type: MultiLanguageDto })
  occupierCategory: MultiLanguageDto;

  @ApiProperty({ type: MultiLanguageDto })
  level: MultiLanguageDto;

  @ApiProperty({ type: MultiLanguageDto })
  amenities: MultiLanguageDto;

  @ApiProperty({ type: Number })
  bathroomCount: number;

  @ApiProperty({ type: MultiLanguageDto })
  rateIncludes: MultiLanguageDto;

  @ApiProperty({ type: Number })
  administrativeFees: number;

  @ApiProperty({ type: Number })
  insurance: number;

  @ApiProperty({ type: Number })
  rate: number;

  @ApiProperty({ nullable: true })
  additionalDetails?: string;

  @ApiProperty({ type: FileDto })
  images: FileDto[];

  @ApiProperty({ type: CreateAdBedroomDto })
  adBedrooms: CreateAdBedroomDto[];
}
