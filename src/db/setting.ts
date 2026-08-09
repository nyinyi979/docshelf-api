import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  key: varchar({ length: 100 }).primaryKey(),
  value: jsonb().$type<unknown>().notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
