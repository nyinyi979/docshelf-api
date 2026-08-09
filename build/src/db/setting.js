"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.settingsTable = (0, pg_core_1.pgTable)("settings", {
    key: (0, pg_core_1.varchar)({ length: 100 }).primaryKey(),
    value: (0, pg_core_1.jsonb)().$type().notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
});
