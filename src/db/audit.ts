import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { documentsTable } from "./document";
import { usersTable } from "./user";

export const activityActionEnum = pgEnum("activity_action", [
  "upload",
  "delete",
  "share",
  "login",
  "version",
]);
export const activitiesTable = pgTable("activities", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().references(() => usersTable.id, { onDelete: "set null" }),
  documentId: uuid().references(() => documentsTable.id, {
    onDelete: "set null",
  }),
  action: activityActionEnum().notNull(),
  description: text().notNull(),
  detail: text().notNull().default(""),
  ip: varchar({ length: 64 }),
  metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
