"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTagBodySchema = exports.tagBodySchema = exports.tagQuerySchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const schemas_1 = require("../schemas");
exports.tagQuerySchema = type_provider_typebox_1.Type.Object({
    ...schemas_1.paginationProperties,
    query: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ maxLength: 60 })),
});
exports.tagBodySchema = type_provider_typebox_1.Type.Object({
    name: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 60 }),
    slug: type_provider_typebox_1.Type.String({
        minLength: 1,
        maxLength: 80,
        pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    }),
});
exports.updateTagBodySchema = type_provider_typebox_1.Type.Intersect([
    type_provider_typebox_1.Type.Object({ id: schemas_1.uuidSchema }),
    type_provider_typebox_1.Type.Partial(exports.tagBodySchema),
]);
