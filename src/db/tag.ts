import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { documentTagsTable } from "./document";

export const tagsTable = pgTable(
  "tags",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 60 }).notNull(),
    slug: varchar({ length: 80 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("tags_slug_idx").on(table.slug)],
);

export const tagsRelations = relations(tagsTable, ({ many }) => ({
  documentTags: many(documentTagsTable),
}));
