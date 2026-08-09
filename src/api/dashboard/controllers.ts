import { desc, eq, gte, sql } from "drizzle-orm";
import db from "../../db";
import { documentsTable } from "../../db/document";
import { usersTable } from "../../db/user";

export const getDashboard = async () => {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const yearStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
  );
  const [[stats], monthly, recentDocuments, recentUsers] = await Promise.all([
    db
      .select({
        totalDocuments: sql<number>`count(distinct ${documentsTable.id})::int`,
        storageUsedBytes: sql<number>`coalesce(sum(${documentsTable.sizeBytes}), 0)::bigint`,
        totalUsers: sql<number>`(select count(*) from ${usersTable})::int`,
        uploadsThisMonth: sql<number>`count(*) filter (where ${documentsTable.createdAt} >= ${monthStart})::int`,
      })
      .from(documentsTable),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${documentsTable.createdAt}), 'Mon')`,
        uploads: sql<number>`count(*)::int`,
        monthDate: sql<Date>`date_trunc('month', ${documentsTable.createdAt})`,
      })
      .from(documentsTable)
      .where(gte(documentsTable.createdAt, yearStart))
      .groupBy(sql`date_trunc('month', ${documentsTable.createdAt})`)
      .orderBy(sql`date_trunc('month', ${documentsTable.createdAt})`),
    db
      .select({
        id: documentsTable.id,
        title: documentsTable.title,
        fileType: documentsTable.fileType,
        sizeBytes: documentsTable.sizeBytes,
        status: documentsTable.status,
        createdAt: documentsTable.createdAt,
        uploadedBy: usersTable.username,
      })
      .from(documentsTable)
      .innerJoin(usersTable, eq(documentsTable.uploadedById, usersTable.id))
      .orderBy(desc(documentsTable.createdAt))
      .limit(5),
    db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        active: usersTable.active,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
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
