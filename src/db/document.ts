import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { categoriesTable } from "./category";
import { tagsTable } from "./tag";
import { usersTable } from "./user";

export const documentFileTypeEnum = pgEnum("document_file_type", [
  "pdf",
  "doc",
  "xlsx",
  "ppt",
  "img",
]);
export const documentVisibilityEnum = pgEnum("document_visibility", [
  "public",
  "private",
]);
export const documentStatusEnum = pgEnum("document_status", [
  "active",
  "processing",
  "archived",
]);

export const documentsTable = pgTable("documents", {
  id: uuid().defaultRandom().primaryKey(),
  title: varchar({ length: 200 }).notNull(),
  description: text().notNull().default(""),
  categoryId: uuid()
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "restrict" }),
  uploadedById: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  fileUrl: text().notNull(),
  fileKey: text().notNull(),
  fileName: varchar({ length: 255 }).notNull(),
  mimeType: varchar({ length: 120 }).notNull(),
  fileType: documentFileTypeEnum().notNull(),
  sizeBytes: bigint({ mode: "number" }).notNull(),
  visibility: documentVisibilityEnum().notNull().default("private"),
  status: documentStatusEnum().notNull().default("active"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const documentVersionsTable = pgTable("document_versions", {
  id: uuid().defaultRandom().primaryKey(),
  documentId: uuid()
    .notNull()
    .references(() => documentsTable.id, { onDelete: "cascade" }),
  versionNumber: integer().notNull(),
  fileUrl: text().notNull(),
  fileKey: text().notNull(),
  fileName: varchar({ length: 255 }).notNull(),
  mimeType: varchar({ length: 120 }).notNull(),
  sizeBytes: bigint({ mode: "number" }).notNull(),
  uploadedById: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const documentTagsTable = pgTable(
  "document_tags",
  {
    documentId: uuid()
      .notNull()
      .references(() => documentsTable.id, { onDelete: "cascade" }),
    tagId: uuid()
      .notNull()
      .references(() => tagsTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.documentId, table.tagId] })],
);

export const bookmarksTable = pgTable(
  "bookmarks",
  {
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    documentId: uuid()
      .notNull()
      .references(() => documentsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    active: boolean().notNull().default(true),
  },
  (table) => [primaryKey({ columns: [table.userId, table.documentId] })],
);

export const documentsRelations = relations(
  documentsTable,
  ({ one, many }) => ({
    category: one(categoriesTable, {
      fields: [documentsTable.categoryId],
      references: [categoriesTable.id],
    }),
    uploadedBy: one(usersTable, {
      fields: [documentsTable.uploadedById],
      references: [usersTable.id],
    }),
    versions: many(documentVersionsTable),
    documentTags: many(documentTagsTable),
    bookmarks: many(bookmarksTable),
  }),
);
export const documentVersionsRelations = relations(
  documentVersionsTable,
  ({ one }) => ({
    document: one(documentsTable, {
      fields: [documentVersionsTable.documentId],
      references: [documentsTable.id],
    }),
    uploadedBy: one(usersTable, {
      fields: [documentVersionsTable.uploadedById],
      references: [usersTable.id],
    }),
  }),
);
export const documentTagsRelations = relations(
  documentTagsTable,
  ({ one }) => ({
    document: one(documentsTable, {
      fields: [documentTagsTable.documentId],
      references: [documentsTable.id],
    }),
    tag: one(tagsTable, {
      fields: [documentTagsTable.tagId],
      references: [tagsTable.id],
    }),
  }),
);
export const bookmarksRelations = relations(bookmarksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [bookmarksTable.userId],
    references: [usersTable.id],
  }),
  document: one(documentsTable, {
    fields: [bookmarksTable.documentId],
    references: [documentsTable.id],
  }),
}));
