import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { IAuthService } from "../auth.service";
import { and, eq } from "drizzle-orm";
import { CodeErrorException } from "../../../common/exceptions/code-error.exception";
import { SessionType } from "../../drizzle/enums/session.enum";
import { IDrizzleService } from "../../drizzle/drizzle.service";
import { admins, users } from "../../drizzle/drizzle.schema";
import { UserType } from "../../drizzle/enums/user.enum";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: IAuthService,
    private readonly drizzle: IDrizzleService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const c = context.switchToHttp().getResponse() as Context;
    const token = this.extractToken(c);

    if (!token) {
      throw CodeErrorException.unauthorized("InvalidToken", "Invalid token");
    }

    const session = await this.authService.validateSessionToken(token);

    switch (session.type) {
      case SessionType.ADMIN:
        {
          const admin = await this.drizzle.db.query.admins.findFirst({
            where: eq(admins.id, session.userId),
          });

          if (!admin)
            throw CodeErrorException.unauthorized(
              "InvalidToken",
              "Invalid token"
            );

          c.set("user", admin);
        }
        break;
      case SessionType.CONSUMER:
        {
          const user = await this.drizzle.db.query.users.findFirst({
            where: and(
              eq(users.id, session.userId),
              eq(users.type, UserType.CONSUMER)
            ),
          });

          if (!user)
            throw CodeErrorException.unauthorized(
              "InvalidToken",
              "Invalid token"
            );

          c.set("user", user);
        }
        break;
      case SessionType.SELLER:
        {
          const seller = await this.drizzle.db.query.users.findFirst({
            where: and(
              eq(users.id, session.userId),
              eq(users.type, UserType.SELLER)
            ),
          });

          if (!seller)
            throw CodeErrorException.unauthorized(
              "InvalidToken",
              "Invalid token"
            );

          c.set("user", seller);
        }
        break;
      default:
        throw CodeErrorException.unauthorized(
          "UnsupportedSession",
          session.type
        );
    }

    return true;
  }

  private extractToken(ctx: Context): string | undefined {
    return this.extractTokenFromHeader(ctx) ?? this.extractTokenFromCookie(ctx);
  }

  private extractTokenFromHeader(ctx: Context): string | undefined {
    const authorization = ctx.req.header("Authorization");
    const [type, token] = authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private extractTokenFromCookie(ctx: Context): string | undefined {
    const sessionCookie = getCookie(ctx, "connect.sid");
    return sessionCookie;
  }
}
