import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SignOutDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  sessionToken: string;
}
