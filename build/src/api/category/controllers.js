"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getAllCategories = exports.getCategories = exports.createCategory = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../db"));
const category_1 = require("../../db/category");
const document_1 = require("../../db/document");
const errors_1 = require("../../utils/errors");
const categorySelection = {
    id: category_1.categoriesTable.id,
    name: category_1.categoriesTable.name,
    slug: category_1.categoriesTable.slug,
    description: category_1.categoriesTable.description,
    createdAt: category_1.categoriesTable.createdAt,
    updatedAt: category_1.categoriesTable.updatedAt,
    documentCount: (0, drizzle_orm_1.sql) `count(${document_1.documentsTable.id})::int`,
};
const createCategory = async (data) => (await db_1.default.insert(category_1.categoriesTable).values(data).returning())[0];
exports.createCategory = createCategory;
const getCategories = async (query) => {
    const where = query.query
        ? (0, drizzle_orm_1.ilike)(category_1.categoriesTable.name, `%${query.query}%`)
        : undefined;
    const sort = query.sortBy === "name"
        ? category_1.categoriesTable.name
        : query.sortBy === "documentCount"
            ? (0, drizzle_orm_1.sql) `count(${document_1.documentsTable.id})`
            : category_1.categoriesTable.createdAt;
    const order = query.orderBy === "asc" ? (0, drizzle_orm_1.asc)(sort) : (0, drizzle_orm_1.desc)(sort);
    const [data, [{ total }]] = await Promise.all([
        db_1.default
            .select(categorySelection)
            .from(category_1.categoriesTable)
            .leftJoin(document_1.documentsTable, (0, drizzle_orm_1.eq)(document_1.documentsTable.categoryId, category_1.categoriesTable.id))
            .where(where)
            .groupBy(category_1.categoriesTable.id)
            .orderBy(order)
            .limit(query.perPage)
            .offset(query.page * query.perPage),
        db_1.default
            .select({ total: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(category_1.categoriesTable)
            .where(where),
    ]);
    return { data, total };
};
exports.getCategories = getCategories;
const getAllCategories = async () => db_1.default
    .select(categorySelection)
    .from(category_1.categoriesTable)
    .leftJoin(document_1.documentsTable, (0, drizzle_orm_1.eq)(document_1.documentsTable.categoryId, category_1.categoriesTable.id))
    .groupBy(category_1.categoriesTable.id)
    .orderBy((0, drizzle_orm_1.asc)(category_1.categoriesTable.name));
exports.getAllCategories = getAllCategories;
const updateCategory = async ({ id, ...data }) => {
    const result = await db_1.default
        .update(category_1.categoriesTable)
        .set({ ...data, updatedAt: new Date() })
        .where((0, drizzle_orm_1.eq)(category_1.categoriesTable.id, id))
        .returning();
    if (!result[0])
        throw new errors_1.NotFoundError("Category not found");
    return result[0];
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    const used = await db_1.default.$count(document_1.documentsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(document_1.documentsTable.categoryId, id)));
    if (used)
        throw new errors_1.ConflictError("Move or delete the documents in this category first.");
    const result = await db_1.default
        .delete(category_1.categoriesTable)
        .where((0, drizzle_orm_1.eq)(category_1.categoriesTable.id, id))
        .returning();
    if (!result[0])
        throw new errors_1.NotFoundError("Category not found");
    return result[0];
};
exports.deleteCategory = deleteCategory;
