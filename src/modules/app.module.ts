import { Module, type DynamicModule } from "@nestjs/common";
import { RedisModule, RedisService } from "@liaoliaots/nestjs-redis";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";
import { ThrottlerModule } from "@nestjs/throttler";
import { IConfig } from "../config/config.interface";
import { AppController } from "./app.controller";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { GlobalModule } from "./global.module";
import { AuthModule } from "./auth/auth.module";

@Module({})
export class AppModule {
  static register({ config }: { config: IConfig }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DrizzleModule,
        AuthModule.register({ config }),
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
                  limit: 10, // Default throttler limit
                  ttl: 60, // Default throttler TTL (in seconds)
                },
                {
                  name: "auth",
                  limit: 3, // Allow 3 requests
                  ttl: 3600, // 1 hour
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
