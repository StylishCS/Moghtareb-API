import { pgEnum } from "drizzle-orm/pg-core";
import { enumToPgEnum } from "../drizzle.utils";

export enum UserType {
  CONSUMER = 'CONSUMER',
  SELLER = 'SELLER',
}

export enum UserSubType {
  BROKER = 'BROKER',
  OFFICE = 'OFFICE',
  OWNER = 'OWNER',
}

export const UserDocumentType = {
  IDENTITY: 'IDENTITY',
  PASSPORT: 'PASSPORT',
  TAX_REGISTER: 'TAX_REGISTER',
  COMMERCIAL_REGISTER: 'COMMERCIAL_REGISTER',
};

export const userTypeEnum = pgEnum("user_type", enumToPgEnum(UserType));
export const userSubTypeEnum = pgEnum(
  "user_sub_type",
  enumToPgEnum(UserSubType)
);
export const userDocumentTypeEnum = pgEnum(
  "user_document_type",
  enumToPgEnum(UserDocumentType)
);
