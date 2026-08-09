"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.getAllTags = exports.getTags = exports.createTag = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../db"));
const document_1 = require("../../db/document");
const tag_1 = require("../../db/tag");
const errors_1 = require("../../utils/errors");
const selection = {
    id: tag_1.tagsTable.id,
    name: tag_1.tagsTable.name,
    slug: tag_1.tagsTable.slug,
    createdAt: tag_1.tagsTable.createdAt,
    documentCount: (0, drizzle_orm_1.sql) `count(${document_1.documentTagsTable.documentId})::int`,
};
const createTag = async (data) => (await db_1.default.insert(tag_1.tagsTable).values(data).returning())[0];
exports.createTag = createTag;
const getTags = async (query) => {
    const where = query.query
        ? (0, drizzle_orm_1.ilike)(tag_1.tagsTable.name, `%${query.query}%`)
        : undefined;
    const [data, [{ total }]] = await Promise.all([
        db_1.default
            .select(selection)
            .from(tag_1.tagsTable)
            .leftJoin(document_1.documentTagsTable, (0, drizzle_orm_1.eq)(document_1.documentTagsTable.tagId, tag_1.tagsTable.id))
            .where(where)
            .groupBy(tag_1.tagsTable.id)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(${document_1.documentTagsTable.documentId})`), (0, drizzle_orm_1.asc)(tag_1.tagsTable.name))
            .limit(query.perPage)
            .offset(query.page * query.perPage),
        db_1.default
            .select({ total: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(tag_1.tagsTable)
            .where(where),
    ]);
    return { data, total };
};
exports.getTags = getTags;
const getAllTags = () => db_1.default
    .select(selection)
    .from(tag_1.tagsTable)
    .leftJoin(document_1.documentTagsTable, (0, drizzle_orm_1.eq)(document_1.documentTagsTable.tagId, tag_1.tagsTable.id))
    .groupBy(tag_1.tagsTable.id)
    .orderBy((0, drizzle_orm_1.asc)(tag_1.tagsTable.name));
exports.getAllTags = getAllTags;
const updateTag = async ({ id, ...data }) => {
    const row = (await db_1.default
        .update(tag_1.tagsTable)
        .set({ ...data, updatedAt: new Date() })
        .where((0, drizzle_orm_1.eq)(tag_1.tagsTable.id, id))
        .returning())[0];
    if (!row)
        throw new errors_1.NotFoundError("Tag not found");
    return row;
};
exports.updateTag = updateTag;
const deleteTag = async (id) => {
    const row = (await db_1.default.delete(tag_1.tagsTable).where((0, drizzle_orm_1.eq)(tag_1.tagsTable.id, id)).returning())[0];
    if (!row)
        throw new errors_1.NotFoundError("Tag not found");
    return row;
};
exports.deleteTag = deleteTag;
