import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import db from "../../db";
import { activitiesTable } from "../../db/audit";
import { documentsTable } from "../../db/document";
import { usersTable } from "../../db/user";
import type { ActivityQuery } from "./schemas";
export const getActivities = async (query: ActivityQuery) => {
  const where = and(
    query.userId ? eq(activitiesTable.userId, query.userId) : undefined,
    query.action ? eq(activitiesTable.action, query.action) : undefined,
    query.from
      ? gte(activitiesTable.createdAt, new Date(`${query.from}T00:00:00Z`))
      : undefined,
    query.to
      ? lte(activitiesTable.createdAt, new Date(`${query.to}T23:59:59.999Z`))
      : undefined,
  );
  const [data, [{ total }]] = await Promise.all([
    db
      .select({
        id: activitiesTable.id,
        userId: activitiesTable.userId,
        userName: usersTable.username,
        userEmail: usersTable.email,
        action: activitiesTable.action,
        description: activitiesTable.description,
        detail: activitiesTable.detail,
        ip: activitiesTable.ip,
        metadata: activitiesTable.metadata,
        timestamp: activitiesTable.createdAt,
        targetId: activitiesTable.documentId,
        targetTitle: documentsTable.title,
      })
      .from(activitiesTable)
      .leftJoin(usersTable, eq(activitiesTable.userId, usersTable.id))
      .leftJoin(
        documentsTable,
        eq(activitiesTable.documentId, documentsTable.id),
      )
      .where(where)
      .orderBy(desc(activitiesTable.createdAt))
      .limit(query.perPage)
      .offset(query.page * query.perPage),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(activitiesTable)
      .where(where),
  ]);
  return { data, total };
};
