"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryBodySchema = exports.categoryBodySchema = exports.categoryQuerySchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const schemas_1 = require("../schemas");
exports.categoryQuerySchema = type_provider_typebox_1.Type.Object({
    ...schemas_1.paginationProperties,
    query: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ maxLength: 100 })),
    sortBy: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Union([
        type_provider_typebox_1.Type.Literal("name"),
        type_provider_typebox_1.Type.Literal("createdAt"),
        type_provider_typebox_1.Type.Literal("documentCount"),
    ])),
    orderBy: type_provider_typebox_1.Type.Optional(schemas_1.orderBySchema),
});
exports.categoryBodySchema = type_provider_typebox_1.Type.Object({
    name: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 100 }),
    slug: type_provider_typebox_1.Type.String({
        minLength: 1,
        maxLength: 120,
        pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    }),
    description: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ maxLength: 2000 })),
});
exports.updateCategoryBodySchema = type_provider_typebox_1.Type.Object({
    id: schemas_1.uuidSchema,
    name: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 100 })),
    slug: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({
        minLength: 1,
        maxLength: 120,
        pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    })),
    description: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ maxLength: 2000 })),
}, { minProperties: 2 });
