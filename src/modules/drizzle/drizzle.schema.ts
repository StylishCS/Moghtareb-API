import {
  integer,
  pgTable,
  text,
  boolean,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
  timestamp,
  point,
} from "drizzle-orm/pg-core";
import {
  createdAtColumn,
  fileColumn,
  multiLanguageColumn,
  nullableReferences,
  references,
} from "./drizzle.columns";
import type { InferSelectModel } from "drizzle-orm";
import {
  adReportSubjectEnum,
  adViewTypeEnum,
  sessionTypeEnum,
  userDocumentTypeEnum,
  userSubTypeEnum,
  userTypeEnum,
} from "./enums";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: userTypeEnum().notNull(),
  subType: userSubTypeEnum(),
  name: multiLanguageColumn().notNull(),
  email: text().unique("user_email"),
  phone: text().unique("phone").notNull(),
  image: fileColumn(),
  whatsapp: text(),
  universityId: nullableReferences(() => universities.id),
  isDeleted: boolean().default(false),
  isPremium: boolean().default(false),
  isVerified: boolean().default(false),
  isSuspended: boolean().default(false),
  createdAt: createdAtColumn,
});

export const usersDocuments = pgTable("users_documents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: references(() => users.id),
  type: userDocumentTypeEnum().notNull(),
  document: fileColumn().notNull(),
  createdAt: createdAtColumn,
});

export const admins = pgTable("admins", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  superId: nullableReferences((): AnyPgColumn => admins.id),
  name: multiLanguageColumn().notNull(),
  email: text().unique("admin_email").notNull(),
  password: text().notNull(),
  createdAt: createdAtColumn,
});

export const ads = pgTable("ads", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: references(() => users.id),
  location: point({ mode: "xy" }).notNull(),
  addressDetails: multiLanguageColumn().notNull(),
  apartmentType: multiLanguageColumn().notNull(), // enum APARTMENT | STUDIO
  isFurnished: boolean().notNull(),
  occupierCategory: multiLanguageColumn().notNull(), // enum YOUTH | GIRLS | FAMILY
  level: multiLanguageColumn().notNull(),
  amenities: multiLanguageColumn().notNull(),
  bathrooms: integer().notNull(),
  rateIncludes: multiLanguageColumn(),
  administrativeFees: integer().notNull(),
  insurance: integer().notNull(),
  rate: integer().notNull(),
  additionalNotes: text(),
  images: fileColumn().array(),
  isAccepted: boolean().default(false),
  isDeleted: boolean().default(false),
  isSponsored: boolean().default(false),
  createdAt: createdAtColumn,
});

export const adsBedRooms = pgTable("ads_bed_rooms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  adId: references(() => ads.id),
  occupancy: multiLanguageColumn().notNull(), // enum SINGLE | DOUBLE | TRIPLE | QUAD
  rate: integer().notNull(),
});

export const adsReports = pgTable(
  "ads_reports",
  {
    sessionId: integer().notNull(),
    adId: references(() => ads.id),
    subject: adReportSubjectEnum().notNull(),
    description: text(),
    createdAt: createdAtColumn,
  },
  (table) => [
    uniqueIndex("unique_session_report").on(table.sessionId, table.adId),
  ]
);

export const universities = pgTable("universities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: multiLanguageColumn().notNull(),
  logo: fileColumn(),
});

export const feedbacks = pgTable(
  "feedbacks",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: references(() => users.id),
    rating: integer().notNull(),
    comment: text(),
    createdAt: createdAtColumn,
  },
  (table) => [uniqueIndex("unique_user_feedback").on(table.id, table.userId)]
);

export const adUserViews = pgTable(
  "ad_user_views",
  {
    adId: references(() => ads.id),
    userId: references(() => users.id),
    type: adViewTypeEnum().notNull(),
    createdAt: createdAtColumn,
  },
  (table) => [
    uniqueIndex("unique_user_ad_view").on(table.adId, table.userId, table.type),
  ]
);

export const userWishlists = pgTable(
  "user_wishlists",
  {
    adId: references(() => ads.id),
    userId: references(() => users.id),
    createdAt: createdAtColumn,
  },
  (table) => [
    uniqueIndex("unique_user_ad_wishlist").on(table.adId, table.userId),
  ]
);

export const sessions = pgTable("session", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer().notNull(),
  type: sessionTypeEnum().notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type User = InferSelectModel<typeof users>;
export type UserDocument = InferSelectModel<typeof usersDocuments>;
export type Admin = InferSelectModel<typeof admins>;
export type Ad = InferSelectModel<typeof ads>;
export type AdBedRoom = InferSelectModel<typeof adsBedRooms>;
export type AdReport = InferSelectModel<typeof adsReports>;
export type University = InferSelectModel<typeof universities>;
export type Feedback = InferSelectModel<typeof feedbacks>;
export type AdUserView = InferSelectModel<typeof adUserViews>;
export type UserWishlist = InferSelectModel<typeof userWishlists>;
export type Session = InferSelectModel<typeof sessions>;

export * from "./enums";
