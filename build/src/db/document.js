"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookmarksRelations = exports.documentTagsRelations = exports.documentVersionsRelations = exports.documentsRelations = exports.bookmarksTable = exports.documentTagsTable = exports.documentVersionsTable = exports.documentsTable = exports.documentStatusEnum = exports.documentVisibilityEnum = exports.documentFileTypeEnum = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const category_1 = require("./category");
const tag_1 = require("./tag");
const user_1 = require("./user");
exports.documentFileTypeEnum = (0, pg_core_1.pgEnum)("document_file_type", [
    "pdf",
    "doc",
    "xlsx",
    "ppt",
    "img",
]);
exports.documentVisibilityEnum = (0, pg_core_1.pgEnum)("document_visibility", [
    "public",
    "private",
]);
exports.documentStatusEnum = (0, pg_core_1.pgEnum)("document_status", [
    "active",
    "processing",
    "archived",
]);
exports.documentsTable = (0, pg_core_1.pgTable)("documents", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey(),
    title: (0, pg_core_1.varchar)({ length: 200 }).notNull(),
    description: (0, pg_core_1.text)().notNull().default(""),
    categoryId: (0, pg_core_1.uuid)()
        .notNull()
        .references(() => category_1.categoriesTable.id, { onDelete: "restrict" }),
    uploadedById: (0, pg_core_1.uuid)()
        .notNull()
        .references(() => user_1.usersTable.id, { onDelete: "restrict" }),
    fileUrl: (0, pg_core_1.text)().notNull(),
    fileKey: (0, pg_core_1.text)().notNull(),
    fileName: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    mimeType: (0, pg_core_1.varchar)({ length: 120 }).notNull(),
    fileType: (0, exports.documentFileTypeEnum)().notNull(),
    sizeBytes: (0, pg_core_1.bigint)({ mode: "number" }).notNull(),
    visibility: (0, exports.documentVisibilityEnum)().notNull().default("private"),
    status: (0, exports.documentStatusEnum)().notNull().default("active"),
    createdAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
});
exports.documentVersionsTable = (0, pg_core_1.pgTable)("document_versions", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey(),
    documentId: (0, pg_core_1.uuid)()
        .notNull()
        .references(() => exports.documentsTable.id, { onDelete: "cascade" }),
    versionNumber: (0, pg_core_1.integer)().notNull(),
    fileUrl: (0, pg_core_1.text)().notNull(),
    fileKey: (0, pg_core_1.text)().notNull(),
    fileName: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    mimeType: (0, pg_core_1.varchar)({ length: 120 }).notNull(),
    sizeBytes: (0, pg_core_1.bigint)({ mode: "number" }).notNull(),
    uploadedById: (0, pg_core_1.uuid)()
        .notNull()
        .references(() => user_1.usersTable.id, { onDelete: "restrict" }),
    createdAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
});
exports.documentTagsTable = (0, pg_core_1.pgTable)("document_tags", {
    documentId: (0, pg_core_1.uuid)()
        .notNull()
        .references(() => exports.documentsTable.id, { onDelete: "cascade" }),
    tagId: (0, pg_core_1.uuid)()
        .notNull()
        .references(() => tag_1.tagsTable.id, { onDelete: "cascade" }),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.documentId, table.tagId] })]);
exports.bookmarksTable = (0, pg_core_1.pgTable)("bookmarks", {
    userId: (0, pg_core_1.uuid)()
        .notNull()
        .references(() => user_1.usersTable.id, { onDelete: "cascade" }),
    documentId: (0, pg_core_1.uuid)()
        .notNull()
        .references(() => exports.documentsTable.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
    active: (0, pg_core_1.boolean)().notNull().default(true),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.userId, table.documentId] })]);
exports.documentsRelations = (0, drizzle_orm_1.relations)(exports.documentsTable, ({ one, many }) => ({
    category: one(category_1.categoriesTable, {
        fields: [exports.documentsTable.categoryId],
        references: [category_1.categoriesTable.id],
    }),
    uploadedBy: one(user_1.usersTable, {
        fields: [exports.documentsTable.uploadedById],
        references: [user_1.usersTable.id],
    }),
    versions: many(exports.documentVersionsTable),
    documentTags: many(exports.documentTagsTable),
    bookmarks: many(exports.bookmarksTable),
}));
exports.documentVersionsRelations = (0, drizzle_orm_1.relations)(exports.documentVersionsTable, ({ one }) => ({
    document: one(exports.documentsTable, {
        fields: [exports.documentVersionsTable.documentId],
        references: [exports.documentsTable.id],
    }),
    uploadedBy: one(user_1.usersTable, {
        fields: [exports.documentVersionsTable.uploadedById],
        references: [user_1.usersTable.id],
    }),
}));
exports.documentTagsRelations = (0, drizzle_orm_1.relations)(exports.documentTagsTable, ({ one }) => ({
    document: one(exports.documentsTable, {
        fields: [exports.documentTagsTable.documentId],
        references: [exports.documentsTable.id],
    }),
    tag: one(tag_1.tagsTable, {
        fields: [exports.documentTagsTable.tagId],
        references: [tag_1.tagsTable.id],
    }),
}));
exports.bookmarksRelations = (0, drizzle_orm_1.relations)(exports.bookmarksTable, ({ one }) => ({
    user: one(user_1.usersTable, {
        fields: [exports.bookmarksTable.userId],
        references: [user_1.usersTable.id],
    }),
    document: one(exports.documentsTable, {
        fields: [exports.bookmarksTable.documentId],
        references: [exports.documentsTable.id],
    }),
}));
