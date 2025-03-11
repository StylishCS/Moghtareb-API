import type { Config } from "drizzle-kit";
import process from "node:process";

export default {
  dialect: "postgresql",
  schema: "./src/modules/drizzle/drizzle.schema.ts",
  out: "./drizzle",
  migrations: {
    schema: process.env.MIGRATION_SCHEMA,
  },
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  casing: "snake_case",
  extensionsFilters: ["postgis"],
} satisfies Config;
