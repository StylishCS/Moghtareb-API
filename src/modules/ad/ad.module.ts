import { Module, type DynamicModule } from "@nestjs/common";
import { AdService, IAdService } from "./ad.service";
import { AdController } from "./ad.controller";

@Module({})
export class AdModule {
  static register(): DynamicModule {
    return {
      module: AdModule,
      imports: [],
      providers: [
        {
          provide: IAdService,
          useClass: AdService,
        },
      ],
      controllers: [AdController],
      exports: [IAdService],
    };
  }
}
