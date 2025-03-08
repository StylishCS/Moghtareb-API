import { Body, Controller, Post, Response } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IAuthService } from "./auth.service";
import {
  CreateUserDto,
  SignInDto,
  VerifyOtpDto,
} from "./strategy/dto/user.dto";
import { type Context } from "hono";
import { DocOperation } from "../../common/swagger/api-operation.decorator";
import { IUserStrategy } from "./strategy/user.strategy";
import type { SignOutDto } from "./auth.dto";

@ApiTags("auth")
@Controller("auth/user")
export class AuthController {
  constructor(
    private readonly authService: IAuthService,
    private readonly userStrategy: IUserStrategy
  ) {}

  @Post("sign-in")
  @DocOperation({
    summary: "Sign in as a user",
  })
  async signIn(@Body() body: SignInDto) {
    return await this.userStrategy.signIn(body);
  }

  @Post("sign-up")
  @DocOperation({
    summary: "Sign up as a user",
  })
  async signUp(@Body() body: CreateUserDto) {
    const { otp, user } = await this.userStrategy.signUp(body);

    return { otp, user };
  }

  @Post("sign-out")
  @DocOperation({
    summary: "Sign out as a user",
  })
  async signOut(@Body() body: SignOutDto, @Response() ctx: Context) {
    this.userStrategy.signOut(body);
    this.authService.deleteSessionTokenCookie(ctx);
    return;
  }

  @Post("verify-otp")
  @DocOperation({
    summary: "Verify one-time password for a user",
  })
  async verifyOtp(@Response() ctx: Context, @Body() body: VerifyOtpDto) {
    const { session, token, user } = await this.userStrategy.verifyOtp(body);
    this.authService.setSessionTokenCookie(ctx, session, token);
    return ctx.set("body", { token, user });
  }
}
