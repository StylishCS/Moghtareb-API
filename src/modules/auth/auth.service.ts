import { randomInt } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash, verify } from "@node-rs/argon2";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { CodeErrorException } from "../../common/exceptions/code-error.exception";
import { sessions, type Session } from "../drizzle/drizzle.schema";
import { SessionType } from "../drizzle/enums/session.enum";
import { IDrizzleService } from "../drizzle/drizzle.service";
import { authConstants } from "./constants";
import { IConfig } from "../../config/config.interface";

export abstract class IAuthService {
  abstract generateSessionToken(): Promise<string>;
  abstract generateOtp(): string;
  abstract createSession(
    userId: number,
    type: SessionType
  ): Promise<{ session: Session; token: string }>;
  abstract validateSessionToken(token: string): Promise<Session>;
  abstract invalidateSession(sessionToken: string): Promise<void>;
  abstract hash(password: string): Promise<string>;
  abstract verifyHash(hash: string, password: string): Promise<boolean>;
  abstract setSessionTokenCookie(
    ctx: Context,
    session: Session,
    token: string
  ): void;
  abstract deleteSessionTokenCookie(ctx: Context): void;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly drizzle: IDrizzleService,
    private readonly jwtService: JwtService,
    private readonly config: IConfig
  ) {}

  /**
   * Generates a random 20-byte session token as a base32 lowercase string without padding.
   * @returns The generated session token.
   */
  generateSessionToken(): Promise<string> {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    const token = encodeBase32LowerCaseNoPadding(bytes);

    return this.jwtService.signAsync({ sessionToken: token });
  }

  /**
   * Generates a random one-time password (OTP) as a string.
   * The OTP is a 6-digit number.
   * @returns The generated OTP.
   */
  generateOtp(): string {
    return randomInt(100000, 1000000).toString();
  }

  /**
   * Creates a session and stores it in the database.
   * @param token The session token to create a session for.
   * @param userId The id of the user to associate the session with.
   * @returns The created session.
   */
  async createSession(
    userId: number,
    type: SessionType
  ): Promise<{ session: Session; token: string }> {
    const token = await this.generateSessionToken();
    const sessionToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );

    const [session] = await this.drizzle.db
      .insert(sessions)
      .values({
        token: sessionToken,
        userId,
        type: type,
        expiresAt:
          type === SessionType.ADMIN
            ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 1)
            : new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      })
      .returning();

    return { session, token };
  }

  /**
   * Validates a session token.
   * @param token The session token to validate.
   * @returns An object containing the session and user if the session is valid, or an object with null session and user if the session is invalid.
   * Session tokens are deleted after 30 days of inactivity and extended every 15 days if active.
   */
  async validateSessionToken(token: string): Promise<Session> {
    try {
      await this.jwtService.verifyAsync(token);
    } catch (e) {
      Logger.log(e);
      throw CodeErrorException.unauthorized(
        "InvalidToken",
        "Invalid session token"
      );
    }

    const sessionToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const [session] = await this.drizzle.db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken));

    if (!session) {
      throw CodeErrorException.unauthorized(
        "InvalidToken",
        "Invalid session token"
      );
    }

    if (Date.now() >= session.expiresAt.getTime()) {
      await this.drizzle.db.delete(sessions).where(eq(sessions.id, session.id));
      throw CodeErrorException.unauthorized("TokenExpired", "Session expired");
    }

    // Active sessions will be extended every 15 days, and non active sessions will be deleted after 30 days
    if (
      session.type === SessionType.ADMIN &&
      Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15
    ) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      await this.drizzle.db
        .update(sessions)
        .set({
          expiresAt: session.expiresAt,
        })
        .where(eq(sessions.id, session.id));
    }

    return session;
  }

  /**
   * Invalidates a session by deleting it from the database.
   * @param sessionToken The session to invalidate.
   * @returns A promise that resolves when the session is invalidated.
   */
  async invalidateSession(sessionToken: string): Promise<void> {
    await this.drizzle.db
      .delete(sessions)
      .where(eq(sessions.token, sessionToken));
  }

  /**
   * Hashes a password using the Argon2 password hashing algorithm.
   * @param password The password to hash.
   * @returns A promise that resolves to the hashed password as a hexadecimal string.
   */
  async hash(password: string): Promise<string> {
    return await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
      secret: Buffer.from(this.config.jwt.secret),
    });
  }

  /**
   * Verifies a password against a hash using the Argon2 password hashing
   * algorithm.
   *
   * @param hash - The hash to verify against.
   * @param password - The password to verify.
   * @returns A promise that resolves to true if the password matches the
   *          hash, and false if it does not.
   */
  async verifyHash(hash: string, password: string): Promise<boolean> {
    return await verify(hash, password, {
      secret: Buffer.from(this.config.jwt.secret),
    });
  }

  /**
   * Sends a one-time password (OTP) to a user by generating it, hashing it,
   * and storing it in the database with an expiration time.
   *
   * @param userId - The ID of the user to send the OTP to.
   * @param type - The type of OTP being sent (e.g., SIGN_IN, SIGN_UP).
   *
   * @returns An object containing the generated OTP.
   */

  setSessionTokenCookie(ctx: Context, session: Session, token: string) {
    setCookie(ctx, authConstants.sessionCookie, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      expires: session.expiresAt,
      path: "/",
    });
  }

  deleteSessionTokenCookie(ctx: Context) {
    deleteCookie(ctx, authConstants.sessionCookie, {
      path: "/",
      maxAge: 0,
      sameSite: "Lax",
      httpOnly: true,
    });
  }
}

export type SessionValidationResult = { session: Session } | { session: null };
