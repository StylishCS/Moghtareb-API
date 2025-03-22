import { Module, type DynamicModule } from "@nestjs/common";
import { RedisModule, RedisService } from "@liaoliaots/nestjs-redis";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";
import { ThrottlerModule } from "@nestjs/throttler";
import { IConfig } from "../config/config.interface";
import { AppController } from "./app.controller";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { GlobalModule } from "./global.module";
import { AuthModule } from "./auth/auth.module";
import { AdModule } from "./ad/ad.module";
import { StorageModule } from "./storage/storage.module";

@Module({})
export class AppModule {
  static register({ config }: { config: IConfig }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DrizzleModule,
        // StorageModule.register({ config }),
        AuthModule.register({ config }),
        AdModule.register(),
        GlobalModule.register({
          providers: [
            {
              provide: IConfig,
              useValue: config,
            },
          ],
          exports: [IConfig],
        }),
        RedisModule.forRoot({
          config: {
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
          },
        }),
        ThrottlerModule.forRootAsync({
          useFactory(redisService: RedisService) {
            const redis = redisService.getOrThrow();
            return {
              throttlers: [
                {
                  name: "default",
                  limit: 10,
                  ttl: 60,
                },
                {
                  name: "auth",
                  limit: 3,
                  ttl: 3600,
                },
              ],
              ttl: 60,
              limit: 600,
              storage: new ThrottlerStorageRedisService(redis),
            };
          },
          inject: [RedisService],
        }),
      ],
      controllers: [AppController],
    };
  }
}
