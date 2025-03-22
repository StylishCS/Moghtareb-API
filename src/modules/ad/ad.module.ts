import { Module, type DynamicModule } from "@nestjs/common";
import { AdService, IAdService } from "./ad.service";
import { AdController } from "./ad.controller";
import { AdDAO, IAdDAO } from "./ad.dao";
import { AuthModule } from "../auth/auth.module";
import { AuthService, IAuthService } from "../auth/auth.service";

@Module({})
export class AdModule {
  static register(): DynamicModule {
    return {
      module: AdModule,
      imports: [AuthModule],
      providers: [
        {
          provide: IAuthService,
          useClass: AuthService,
        },
        {
          provide: IAdService,
          useClass: AdService,
        },
        {
          provide: IAdDAO,
          useClass: AdDAO,
        },
      ],
      controllers: [AdController],
      exports: [IAdService],
    };
  }
}
