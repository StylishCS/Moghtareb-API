import { pgEnum } from "drizzle-orm/pg-core";
import { enumToPgEnum } from "../drizzle.utils";

export enum AdTypeEnum {
  APARTMENT = "APARTMENT",
  STUDIO = "STUDIO",
}

export enum OccupierCategoryEnum {
  YOUTH = "YOUTH",
  GIRLS = "GIRLS",
  FAMILY = "FAMILY",
}

export enum AdReportSubjectEnum {
  WRONG_INFO = "WRONG_INFO",
  SPAM = "SPAM",
  INAPPROPRIATE = "INAPPROPRIATE",
  OTHER = "OTHER",
}

export enum AdViewTypeEnum {
  PHONE = "PHONE",
  WHATSAPP = "WHATSAPP",
  AD = "AD",
}

export const adTypeEnum = pgEnum("ad_type", enumToPgEnum(AdTypeEnum));
export const occupierCategoryEnum = pgEnum(
  "occupier_category",
  enumToPgEnum(OccupierCategoryEnum)
);
export const adReportSubjectEnum = pgEnum(
  "ad_report_subject",
  enumToPgEnum(AdReportSubjectEnum)
);
export const adViewTypeEnum = pgEnum(
  "ad_view_type",
  enumToPgEnum(AdViewTypeEnum)
);
