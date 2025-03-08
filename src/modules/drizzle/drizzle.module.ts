import { Global, Module } from "@nestjs/common";
import { DrizzleService, IDrizzleService } from "./drizzle.service";

@Global()
@Module({
  providers: [
    {
      provide: IDrizzleService,
      useClass: DrizzleService,
    },
  ],
  exports: [IDrizzleService],
})
export class DrizzleModule {}
