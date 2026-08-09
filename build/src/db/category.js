"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRelations = exports.categoriesTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const document_1 = require("./document");
exports.categoriesTable = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    slug: (0, pg_core_1.varchar)({ length: 120 }).notNull(),
    description: (0, pg_core_1.text)().notNull().default(""),
    createdAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [(0, pg_core_1.uniqueIndex)("categories_slug_idx").on(table.slug)]);
exports.categoriesRelations = (0, drizzle_orm_1.relations)(exports.categoriesTable, ({ many }) => ({
    documents: many(document_1.documentsTable),
}));
