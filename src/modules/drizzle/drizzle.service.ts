import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./drizzle.schema";
import * as relations from "./drizzle.relations";
import { Injectable } from "@nestjs/common";
import { IConfig } from "../../config/config.interface";

const schemaWithRelations = {
  ...schema,
  ...relations,
} as const;

export abstract class IDrizzleService {
  abstract db: ReturnType<typeof initDrizzle>;
}

@Injectable()
export class DrizzleService implements IDrizzleService {
  constructor(private readonly config: IConfig) {
    this.db = initDrizzle(this.config);
  }
  public db: ReturnType<typeof initDrizzle>;
}

function initDrizzle(config: IConfig) {
  return drizzle(config.databaseUrl, {
    schema: { ...schemaWithRelations },
    casing: "snake_case",
  });
}
