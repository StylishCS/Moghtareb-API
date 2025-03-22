import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { IAdService } from "./ad.service";
import { CreateAdDto } from "./dto/create-ad.dto";
import type { Ad, User } from "../drizzle/drizzle.schema";
import { Auth } from "../auth/decorators/auth.decorators";
import { User as UserDecorator } from "../auth/decorators/user.decorator";
import { DocOperation } from "../../common/swagger/api-operation.decorator";
import { AdEntity } from "./entity/ad.entity";

@ApiTags("ad")
@Controller("ad")
export class AdController {
  constructor(@Inject(IAdService) private readonly adService: IAdService) {}

  @DocOperation({ summary: "Create an ad" })
  @ApiCreatedResponse({ type: AdEntity })
  @ApiBody({ type: CreateAdDto })
  @Post("create")
  @Auth()
  async createAd(
    @Body() createAdDto: CreateAdDto,
    @UserDecorator() user: User
  ): Promise<Ad> {
    return this.adService.create(createAdDto, user);
  }

  @DocOperation({ summary: "Find all ads" })
  @ApiCreatedResponse({ type: [AdEntity] })
  @Post("find-many")
  async findMany(): Promise<Ad[]> {
    return this.adService.findMany();
  }
}
