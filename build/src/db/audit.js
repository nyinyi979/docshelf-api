"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activitiesTable = exports.activityActionEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const document_1 = require("./document");
const user_1 = require("./user");
exports.activityActionEnum = (0, pg_core_1.pgEnum)("activity_action", [
    "upload",
    "delete",
    "share",
    "login",
    "version",
]);
exports.activitiesTable = (0, pg_core_1.pgTable)("activities", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)().references(() => user_1.usersTable.id, { onDelete: "set null" }),
    documentId: (0, pg_core_1.uuid)().references(() => document_1.documentsTable.id, {
        onDelete: "set null",
    }),
    action: (0, exports.activityActionEnum)().notNull(),
    description: (0, pg_core_1.text)().notNull(),
    detail: (0, pg_core_1.text)().notNull().default(""),
    ip: (0, pg_core_1.varchar)({ length: 64 }),
    metadata: (0, pg_core_1.jsonb)().$type().notNull().default({}),
    createdAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
});
