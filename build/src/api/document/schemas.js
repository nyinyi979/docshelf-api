"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessUrlQuerySchema = exports.bookmarkBodySchema = exports.bulkDeleteBodySchema = exports.versionBodySchema = exports.updateDocumentBodySchema = exports.documentBodySchema = exports.documentQuerySchema = exports.statusSchema = exports.visibilitySchema = exports.fileTypeSchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const schemas_1 = require("../schemas");
exports.fileTypeSchema = type_provider_typebox_1.Type.Union([
    type_provider_typebox_1.Type.Literal("pdf"),
    type_provider_typebox_1.Type.Literal("doc"),
    type_provider_typebox_1.Type.Literal("xlsx"),
    type_provider_typebox_1.Type.Literal("ppt"),
    type_provider_typebox_1.Type.Literal("img"),
]);
exports.visibilitySchema = type_provider_typebox_1.Type.Union([
    type_provider_typebox_1.Type.Literal("public"),
    type_provider_typebox_1.Type.Literal("private"),
]);
exports.statusSchema = type_provider_typebox_1.Type.Union([
    type_provider_typebox_1.Type.Literal("active"),
    type_provider_typebox_1.Type.Literal("processing"),
    type_provider_typebox_1.Type.Literal("archived"),
]);
exports.documentQuerySchema = type_provider_typebox_1.Type.Object({
    ...schemas_1.paginationProperties,
    query: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ maxLength: 200 })),
    categoryId: type_provider_typebox_1.Type.Optional(schemas_1.uuidSchema),
    fileType: type_provider_typebox_1.Type.Optional(exports.fileTypeSchema),
    visibility: type_provider_typebox_1.Type.Optional(exports.visibilitySchema),
    status: type_provider_typebox_1.Type.Optional(exports.statusSchema),
    uploadedById: type_provider_typebox_1.Type.Optional(schemas_1.uuidSchema),
    sortBy: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Union([
        type_provider_typebox_1.Type.Literal("title"),
        type_provider_typebox_1.Type.Literal("sizeBytes"),
        type_provider_typebox_1.Type.Literal("createdAt"),
    ])),
    orderBy: type_provider_typebox_1.Type.Optional(schemas_1.orderBySchema),
});
exports.documentBodySchema = type_provider_typebox_1.Type.Object({
    title: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 200 }),
    description: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ maxLength: 10000 })),
    categoryId: schemas_1.uuidSchema,
    tagIds: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Array(schemas_1.uuidSchema, { uniqueItems: true, maxItems: 30 })),
    temporaryFileUrl: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 2048 })),
    fileUrl: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 2048 })),
    fileKey: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 2048 })),
    fileName: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 255 }),
    mimeType: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 120 }),
    fileType: exports.fileTypeSchema,
    sizeBytes: type_provider_typebox_1.Type.Integer({ minimum: 1, maximum: 104857600 }),
    visibility: type_provider_typebox_1.Type.Optional(exports.visibilitySchema),
    status: type_provider_typebox_1.Type.Optional(exports.statusSchema),
});
exports.updateDocumentBodySchema = type_provider_typebox_1.Type.Intersect([
    type_provider_typebox_1.Type.Object({ id: schemas_1.uuidSchema }),
    type_provider_typebox_1.Type.Partial(type_provider_typebox_1.Type.Omit(exports.documentBodySchema, [
        "fileUrl",
        "fileKey",
        "temporaryFileUrl",
        "fileName",
        "mimeType",
        "fileType",
        "sizeBytes",
    ])),
]);
exports.versionBodySchema = type_provider_typebox_1.Type.Object({
    fileUrl: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 2048 }),
    fileKey: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 2048 }),
    fileName: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 255 }),
    mimeType: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 120 }),
    fileType: exports.fileTypeSchema,
    sizeBytes: type_provider_typebox_1.Type.Integer({ minimum: 1, maximum: 104857600 }),
});
exports.bulkDeleteBodySchema = type_provider_typebox_1.Type.Object({
    ids: type_provider_typebox_1.Type.Array(schemas_1.uuidSchema, {
        minItems: 1,
        maxItems: 100,
        uniqueItems: true,
    }),
});
exports.bookmarkBodySchema = type_provider_typebox_1.Type.Object({ bookmarked: type_provider_typebox_1.Type.Boolean() });
exports.accessUrlQuerySchema = type_provider_typebox_1.Type.Object({
    versionId: type_provider_typebox_1.Type.Optional(schemas_1.uuidSchema),
});
