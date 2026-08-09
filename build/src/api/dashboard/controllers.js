"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../db"));
const document_1 = require("../../db/document");
const user_1 = require("../../db/user");
const getDashboard = async () => {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    const [[stats], monthly, recentDocuments, recentUsers] = await Promise.all([
        db_1.default
            .select({
            totalDocuments: (0, drizzle_orm_1.sql) `count(distinct ${document_1.documentsTable.id})::int`,
            storageUsedBytes: (0, drizzle_orm_1.sql) `coalesce(sum(${document_1.documentsTable.sizeBytes}), 0)::bigint`,
            totalUsers: (0, drizzle_orm_1.sql) `(select count(*) from ${user_1.usersTable})::int`,
            uploadsThisMonth: (0, drizzle_orm_1.sql) `count(*) filter (where ${document_1.documentsTable.createdAt} >= ${monthStart})::int`,
        })
            .from(document_1.documentsTable),
        db_1.default
            .select({
            month: (0, drizzle_orm_1.sql) `to_char(date_trunc('month', ${document_1.documentsTable.createdAt}), 'Mon')`,
            uploads: (0, drizzle_orm_1.sql) `count(*)::int`,
            monthDate: (0, drizzle_orm_1.sql) `date_trunc('month', ${document_1.documentsTable.createdAt})`,
        })
            .from(document_1.documentsTable)
            .where((0, drizzle_orm_1.gte)(document_1.documentsTable.createdAt, yearStart))
            .groupBy((0, drizzle_orm_1.sql) `date_trunc('month', ${document_1.documentsTable.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `date_trunc('month', ${document_1.documentsTable.createdAt})`),
        db_1.default
            .select({
            id: document_1.documentsTable.id,
            title: document_1.documentsTable.title,
            fileType: document_1.documentsTable.fileType,
            sizeBytes: document_1.documentsTable.sizeBytes,
            status: document_1.documentsTable.status,
            createdAt: document_1.documentsTable.createdAt,
            uploadedBy: user_1.usersTable.username,
        })
            .from(document_1.documentsTable)
            .innerJoin(user_1.usersTable, (0, drizzle_orm_1.eq)(document_1.documentsTable.uploadedById, user_1.usersTable.id))
            .orderBy((0, drizzle_orm_1.desc)(document_1.documentsTable.createdAt))
            .limit(5),
        db_1.default
            .select({
            id: user_1.usersTable.id,
            username: user_1.usersTable.username,
            email: user_1.usersTable.email,
            role: user_1.usersTable.role,
            active: user_1.usersTable.active,
            createdAt: user_1.usersTable.createdAt,
        })
            .from(user_1.usersTable)
            .orderBy((0, drizzle_orm_1.desc)(user_1.usersTable.createdAt))
            .limit(5),
    ]);
    return {
        ...stats,
        storageTotalBytes: 500 * 1024 ** 3,
        uploadsPerMonth: monthly.map(({ month, uploads }) => ({ month, uploads })),
        recentDocuments,
        recentUsers,
    };
};
exports.getDashboard = getDashboard;
