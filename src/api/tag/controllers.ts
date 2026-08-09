import { asc, desc, eq, ilike, sql } from "drizzle-orm";
import db from "../../db";
import { documentTagsTable } from "../../db/document";
import { tagsTable } from "../../db/tag";
import { NotFoundError } from "../../utils/errors";
import type { TagCreate, TagQuery, TagUpdate } from "./schemas";
const selection = {
  id: tagsTable.id,
  name: tagsTable.name,
  slug: tagsTable.slug,
  createdAt: tagsTable.createdAt,
  documentCount: sql<number>`count(${documentTagsTable.documentId})::int`,
};
export const createTag = async (data: TagCreate) =>
  (await db.insert(tagsTable).values(data).returning())[0];
export const getTags = async (query: TagQuery) => {
  const where = query.query
    ? ilike(tagsTable.name, `%${query.query}%`)
    : undefined;
  const [data, [{ total }]] = await Promise.all([
    db
      .select(selection)
      .from(tagsTable)
      .leftJoin(documentTagsTable, eq(documentTagsTable.tagId, tagsTable.id))
      .where(where)
      .groupBy(tagsTable.id)
      .orderBy(
        desc(sql`count(${documentTagsTable.documentId})`),
        asc(tagsTable.name),
      )
      .limit(query.perPage)
      .offset(query.page * query.perPage),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(tagsTable)
      .where(where),
  ]);
  return { data, total };
};
export const getAllTags = () =>
  db
    .select(selection)
    .from(tagsTable)
    .leftJoin(documentTagsTable, eq(documentTagsTable.tagId, tagsTable.id))
    .groupBy(tagsTable.id)
    .orderBy(asc(tagsTable.name));
export const updateTag = async ({ id, ...data }: TagUpdate) => {
  const row = (
    await db
      .update(tagsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tagsTable.id, id))
      .returning()
  )[0];
  if (!row) throw new NotFoundError("Tag not found");
  return row;
};
export const deleteTag = async (id: string) => {
  const row = (
    await db.delete(tagsTable).where(eq(tagsTable.id, id)).returning()
  )[0];
  if (!row) throw new NotFoundError("Tag not found");
  return row;
};
