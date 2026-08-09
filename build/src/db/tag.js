"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsRelations = exports.tagsTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const document_1 = require("./document");
exports.tagsTable = (0, pg_core_1.pgTable)("tags", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 60 }).notNull(),
    slug: (0, pg_core_1.varchar)({ length: 80 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [(0, pg_core_1.uniqueIndex)("tags_slug_idx").on(table.slug)]);
exports.tagsRelations = (0, drizzle_orm_1.relations)(exports.tagsTable, ({ many }) => ({
    documentTags: many(document_1.documentTagsTable),
}));
