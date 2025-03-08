export abstract class IConfig {
  port: number;
  databaseUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
  s3: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucketName: string;
    region: string;
    S3_FORCE_PATH_STYLE: boolean;
  };
}
