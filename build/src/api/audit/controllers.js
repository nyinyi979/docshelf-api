"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../db"));
const audit_1 = require("../../db/audit");
const document_1 = require("../../db/document");
const user_1 = require("../../db/user");
const getActivities = async (query) => {
    const where = (0, drizzle_orm_1.and)(query.userId ? (0, drizzle_orm_1.eq)(audit_1.activitiesTable.userId, query.userId) : undefined, query.action ? (0, drizzle_orm_1.eq)(audit_1.activitiesTable.action, query.action) : undefined, query.from
        ? (0, drizzle_orm_1.gte)(audit_1.activitiesTable.createdAt, new Date(`${query.from}T00:00:00Z`))
        : undefined, query.to
        ? (0, drizzle_orm_1.lte)(audit_1.activitiesTable.createdAt, new Date(`${query.to}T23:59:59.999Z`))
        : undefined);
    const [data, [{ total }]] = await Promise.all([
        db_1.default
            .select({
            id: audit_1.activitiesTable.id,
            userId: audit_1.activitiesTable.userId,
            userName: user_1.usersTable.username,
            userEmail: user_1.usersTable.email,
            action: audit_1.activitiesTable.action,
            description: audit_1.activitiesTable.description,
            detail: audit_1.activitiesTable.detail,
            ip: audit_1.activitiesTable.ip,
            metadata: audit_1.activitiesTable.metadata,
            timestamp: audit_1.activitiesTable.createdAt,
            targetId: audit_1.activitiesTable.documentId,
            targetTitle: document_1.documentsTable.title,
        })
            .from(audit_1.activitiesTable)
            .leftJoin(user_1.usersTable, (0, drizzle_orm_1.eq)(audit_1.activitiesTable.userId, user_1.usersTable.id))
            .leftJoin(document_1.documentsTable, (0, drizzle_orm_1.eq)(audit_1.activitiesTable.documentId, document_1.documentsTable.id))
            .where(where)
            .orderBy((0, drizzle_orm_1.desc)(audit_1.activitiesTable.createdAt))
            .limit(query.perPage)
            .offset(query.page * query.perPage),
        db_1.default
            .select({ total: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(audit_1.activitiesTable)
            .where(where),
    ]);
    return { data, total };
};
exports.getActivities = getActivities;
