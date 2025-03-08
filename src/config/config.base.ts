import type { IConfig } from "./config.interface";
import { z } from "zod";

export class ConfigBase implements IConfig {
  redis: { host: string; port: number; password: string };
  s3: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucketName: string;
    region: string;
    S3_FORCE_PATH_STYLE: boolean;
  };
  port: number;
  databaseUrl: string;
  jwt: { secret: string; expiresIn: string };

  #envSchema = z.object({
    PORT: z.number({ coerce: true }),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.number({ coerce: true }),
    REDIS_PASSWORD: z.string().optional(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_BUCKET_NAME: z.string(),
    S3_ENDPOINT: z.string(),
    S3_REGION: z.string(),
    S3_FORCE_PATH_STYLE: z.string(),
  });

  static fromEnv() {
    const config = new ConfigBase();
    const env = process.env;
    const envVars = config.#envSchema.parse({
      PORT: env.PORT,
      DATABASE_URL: env.DATABASE_URL,
      JWT_SECRET: env.JWT_SECRET,
      JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
      REDIS_HOST: env.REDIS_HOST,
      REDIS_PORT: env.REDIS_PORT,
      REDIS_PASSWORD: env.REDIS_PASSWORD,
      S3_ACCESS_KEY: env.S3_ACCESS_KEY,
      S3_SECRET_KEY: env.S3_SECRET_KEY,
      S3_BUCKET_NAME: env.S3_BUCKET_NAME,
      S3_ENDPOINT: env.S3_ENDPOINT,
      S3_REGION: env.S3_REGION,
      S3_FORCE_PATH_STYLE: env.S3_FORCE_PATH_STYLE,
    });

    config.port = envVars.PORT;

    config.databaseUrl = envVars.DATABASE_URL;

    config.jwt = {
      secret: envVars.JWT_SECRET,
      expiresIn: envVars.JWT_EXPIRES_IN,
    };

    config.redis = {
      host: envVars.REDIS_HOST,
      port: envVars.REDIS_PORT,
      password: envVars.REDIS_PASSWORD || "",
    };

    config.s3 = {
      accessKey: envVars.S3_ACCESS_KEY,
      secretKey: envVars.S3_SECRET_KEY,
      bucketName: envVars.S3_BUCKET_NAME,
      endpoint: envVars.S3_ENDPOINT,
      region: envVars.S3_REGION,
      S3_FORCE_PATH_STYLE: envVars.S3_FORCE_PATH_STYLE === "true",
    };

    return config;
  }
}
