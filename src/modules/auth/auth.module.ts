import { Module, type DynamicModule } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { IConfig } from "../../config/config.interface";
import { AuthService, IAuthService } from "./auth.service";
import { IUserStrategy, UserStrategy } from "./strategy/user.strategy";
import { AuthController } from "./auth.controller";

@Module({})
export class AuthModule {
  static register({ config }: { config: IConfig }): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        JwtModule.register({
          global: true,
          secret: config.jwt.secret,
          signOptions: { expiresIn: config.jwt.expiresIn },
        }),
      ],
      providers: [
        {
          provide: IAuthService,
          useClass: AuthService,
        },
        {
          provide: IUserStrategy,
          useClass: UserStrategy,
        },
      ],
      controllers: [AuthController],
      exports: [IAuthService],
    };
  }
}
