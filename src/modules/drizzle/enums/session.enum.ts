import { pgEnum } from "drizzle-orm/pg-core";
import { enumToPgEnum } from "../drizzle.utils";

export enum SessionType {
  ADMIN = 'ADMIN',
  CONSUMER = 'CONSUMER',
  SELLER = 'SELLER',
}

export const sessionTypeEnum = pgEnum(
  "session_type",
  enumToPgEnum(SessionType)
);
