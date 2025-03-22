import { relations } from "drizzle-orm";
import { ads, adsBedRooms, users } from "./drizzle.schema";

export const adsRelations = relations(ads, ({ one, many }) => ({
  user: one(users, {
    fields: [ads.userId],
    references: [users.id],
  }),
  bedrooms: many(adsBedRooms),
}));

export const usersRelations = relations(users, ({ many }) => ({
  ads: many(ads),
}));

export const adBedRoomRelations = relations(adsBedRooms, ({ one }) => ({
  ad: one(ads, {
    fields: [adsBedRooms.adId],
    references: [ads.id],
  }),
}));
