import { RedisService } from "@liaoliaots/nestjs-redis";
import { Injectable, Logger } from "@nestjs/common";
import { eq } from "drizzle-orm";
import Redis from "ioredis";
import { IAuthService } from "../auth.service";
import { authConstants } from "../constants";
import { CreateUserDto, SignInDto, VerifyOtpDto } from "./dto/user.dto";
import { users, type Session, type User } from "../../drizzle/drizzle.schema";
import { IDrizzleService } from "../../drizzle/drizzle.service";
import { CodeErrorException } from "../../../common/exceptions/code-error.exception";
import { SessionType } from "../../drizzle/enums/session.enum";
import { SignOutDto } from "../auth.dto";

export enum OtpType {
  SIGN_IN = "SIGN_IN",
  SIGN_UP = "SIGN_UP",
}

export abstract class IUserStrategy {
  abstract sendOtp({
    userId,
    type,
  }: {
    userId: number;
    type: OtpType;
  }): Promise<{ code: String; expiresAt: Date; type: OtpType }>;
  abstract verifyOtp({
    code,
    userId,
    type,
  }: VerifyOtpDto): Promise<{ session: Session; token: string; user: User }>;
  abstract signIn({ phone }: SignInDto): Promise<{
    otp: { code: string; expiresAt: Date; type: OtpType };
    userId: number;
  }>;
  abstract signUp(createUserDto: CreateUserDto): Promise<{
    user: User;
    otp: { code: string; expiresAt: Date; type: OtpType };
  }>;
  abstract signOut({ sessionToken }: SignOutDto): void;
}

@Injectable()
export class UserStrategy implements IUserStrategy {
  private readonly redis: Redis;
  constructor(
    private readonly authService: IAuthService,
    private readonly redisService: RedisService,
    private readonly drizzle: IDrizzleService
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  generateOtpId({
    userId,
    type,
    code,
  }: {
    userId: number;
    type: OtpType;
    code: string;
  }) {
    return `otp:${userId}:${type}:${code}`;
  }

  async sendOtp({
    userId,
    type,
  }: {
    userId: number;
    type: OtpType;
  }): Promise<{ code: string; expiresAt: Date; type: OtpType }> {
    const code = this.authService.generateOtp();

    await this.redis.setex(
      this.generateOtpId({ code, type, userId }),
      authConstants.otpTtl,
      code
    );

    return {
      code,
      expiresAt: new Date(Date.now() + authConstants.otpTtl * 1000),
      type,
    };
  }

  async verifyOtp({
    code,
    userId,
    type,
  }: VerifyOtpDto): Promise<{ session: Session; token: string; user: User }> {
    const otpId = this.generateOtpId({ code, type, userId });
    const otpQuery = await this.redis.get(otpId);

    if (!otpQuery) {
      throw CodeErrorException.notFound("OTP");
    }

    const isValid = otpQuery === code;

    if (!isValid) {
      throw CodeErrorException.unauthorized("OTP");
    }

    await this.redis.del(otpId);

    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw CodeErrorException.notFound("User");
    }

    const { session, token } = await this.authService.createSession(
      userId,
      SessionType.CONSUMER
    );

    return { session, token, user };
  }

  /**
   * Signs in a user by verifying their password and phone number, and then
   * sending a one-time password (OTP) to the user.
   *
   * @param phoneNumber - The phone number of the user to sign in.
   * @param password - The password of the user to sign in.
   *
   * @returns An object containing the signed-in user and the sent OTP.
   *
   * @throws An error if the user is not found or the password is invalid.
   */
  async signIn({ phone }: SignInDto): Promise<{
    otp: { code: string; expiresAt: Date; type: OtpType };
    userId: number;
  }> {
    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (!user) {
      throw CodeErrorException.unauthorized("Invalid phone number");
    }

    const otp = await this.sendOtp({ userId: user.id, type: OtpType.SIGN_IN });

    return { otp, userId: user.id };
  }

  /**
   * Invalidates a session by deleting it from the database.
   * @param token The session token to invalidate.
   * @returns A promise that resolves when the session is invalidated.
   */
  async signOut({ sessionToken }: SignOutDto) {
    return await this.authService.invalidateSession(sessionToken);
  }

  /**
   * Signs up a user by creating a new user entry in the database, hashing
   * the provided password, and then creating a new session for the user.
   * @param user - The user information to be signed up.
   * @returns A promise that resolves to an object containing the new session
   *          and user information.
   */
  async signUp(createUserDto: CreateUserDto): Promise<{
    user: User;
    otp: { code: string; expiresAt: Date; type: OtpType };
  }> {
    const [user] = await this.drizzle.db
      .insert(users)
      .values(createUserDto)
      .returning();


    const otp = await this.sendOtp({ userId: user.id, type: OtpType.SIGN_UP });

    return { user, otp };
  }
}
