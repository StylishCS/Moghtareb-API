import {
  type ReferenceConfig,
  integer,
  jsonb,
  numeric,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { assign } from "lodash-es";
import { MultiLanguageDto } from "../../common/dto/multi-language.dto";
import { FileDto } from "../storage/dto/file.dto";

export const createdAtColumn = timestamp({
  withTimezone: true,
})
  .notNull()
  .defaultNow();

export function priceColumn<const T extends string>(name?: T) {
  const column = name
    ? numeric(name, { precision: 10, scale: 2 })
    : numeric({ precision: 10, scale: 2 });
  return column;
}

export function fileColumn<const T extends string>(name?: T) {
  const column = name ? jsonb(name) : jsonb();
  return column.$type<FileDto>();
}

export function multiLanguageColumn<const T extends string>(name?: T) {
  const column = name ? jsonb(name) : jsonb();
  return column.$type<MultiLanguageDto>();
}

export const cascade = {
  onDelete: "cascade",
  onUpdate: "cascade",
} satisfies ReferenceConfig["actions"];

export const setNullActions = {
  onDelete: "set null",
  onUpdate: "set null",
} satisfies ReferenceConfig["actions"];

export const references = (
  ref: ReferenceConfig["ref"],
  actions?: ReferenceConfig["actions"]
) =>
  integer()
    .notNull()
    .references(
      ref,
      assign({ onUpdate: "cascade", onDelete: "cascade" }, actions)
    );
export const nullableReferences = (
  ref: ReferenceConfig["ref"],
  actions?: ReferenceConfig["actions"]
) =>
  integer().references(
    ref,
    assign({ onUpdate: "set null", onDelete: "set null" }, actions)
  );

export const uuidNullableReferences = (
  ref: ReferenceConfig["ref"],
  actions?: ReferenceConfig["actions"]
) =>
  uuid().references(
    ref,
    assign({ onUpdate: "set null", onDelete: "set null" }, actions)
  );
