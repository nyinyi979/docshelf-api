import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import db from "../../db";
import { categoriesTable } from "../../db/category";
import { documentsTable } from "../../db/document";
import { ConflictError, NotFoundError } from "../../utils/errors";
import type { CategoryCreate, CategoryQuery, CategoryUpdate } from "./schemas";

const categorySelection = {
  id: categoriesTable.id,
  name: categoriesTable.name,
  slug: categoriesTable.slug,
  description: categoriesTable.description,
  createdAt: categoriesTable.createdAt,
  updatedAt: categoriesTable.updatedAt,
  documentCount: sql<number>`count(${documentsTable.id})::int`,
};

export const createCategory = async (data: CategoryCreate) =>
  (await db.insert(categoriesTable).values(data).returning())[0];

export const getCategories = async (query: CategoryQuery) => {
  const where = query.query
    ? ilike(categoriesTable.name, `%${query.query}%`)
    : undefined;
  const sort =
    query.sortBy === "name"
      ? categoriesTable.name
      : query.sortBy === "documentCount"
        ? sql`count(${documentsTable.id})`
        : categoriesTable.createdAt;
  const order = query.orderBy === "asc" ? asc(sort) : desc(sort);
  const [data, [{ total }]] = await Promise.all([
    db
      .select(categorySelection)
      .from(categoriesTable)
      .leftJoin(
        documentsTable,
        eq(documentsTable.categoryId, categoriesTable.id),
      )
      .where(where)
      .groupBy(categoriesTable.id)
      .orderBy(order)
      .limit(query.perPage)
      .offset(query.page * query.perPage),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(categoriesTable)
      .where(where),
  ]);
  return { data, total };
};

export const getAllCategories = async () =>
  db
    .select(categorySelection)
    .from(categoriesTable)
    .leftJoin(documentsTable, eq(documentsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(asc(categoriesTable.name));

export const updateCategory = async ({ id, ...data }: CategoryUpdate) => {
  const result = await db
    .update(categoriesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categoriesTable.id, id))
    .returning();
  if (!result[0]) throw new NotFoundError("Category not found");
  return result[0];
};

export const deleteCategory = async (id: string) => {
  const used = await db.$count(
    documentsTable,
    and(eq(documentsTable.categoryId, id)),
  );
  if (used)
    throw new ConflictError(
      "Move or delete the documents in this category first.",
    );
  const result = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .returning();
  if (!result[0]) throw new NotFoundError("Category not found");
  return result[0];
};
