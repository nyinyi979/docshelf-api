"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersTable = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userRoleEnum = (0, pg_core_1.pgEnum)("user_role", ["admin", "member"]);
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)().defaultRandom().primaryKey(),
    username: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 100 }).notNull().unique(),
    password: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    role: (0, exports.userRoleEnum)().notNull().default("member"),
    active: (0, pg_core_1.boolean)().notNull().default(true),
    storageLimitMb: (0, pg_core_1.integer)().notNull().default(5120),
    lastActiveAt: (0, pg_core_1.timestamp)({ withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)({ withTimezone: true }).notNull().defaultNow(),
});
