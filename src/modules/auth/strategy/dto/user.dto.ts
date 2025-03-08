import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { OtpType } from "../user.strategy";
import { UserSubType, UserType } from "../../../drizzle/enums/user.enum";
import { MultiLanguageDto } from "../../../../common/dto/multi-language.dto";

export class SignInDto {
  @ApiProperty()
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @ApiProperty()
  code: string;

  @IsEnum(OtpType)
  @ApiProperty({ enum: OtpType })
  type: OtpType;

  @IsNumber()
  @ApiProperty()
  userId: number;
}

export class CreateUserDto {
  @IsNumber()
  @ApiProperty({ type: Number })
  universityId: number;

  @IsEnum(UserType)
  @ApiProperty({ enum: UserType })
  type: UserType;

  @IsEnum(UserSubType)
  @ApiProperty({ enum: UserSubType })
  @IsOptional()
  subType?: UserSubType;

  @Type(() => MultiLanguageDto)
  @ValidateNested()
  @ApiProperty({ type: MultiLanguageDto })
  name: MultiLanguageDto;

  @Matches(/^(?:\+201|01)\d{9}$/, {
    message: "Phone number must be a valid Egyptian phone number",
  })
  @IsString()
  @ApiProperty()
  phone: string;
}
