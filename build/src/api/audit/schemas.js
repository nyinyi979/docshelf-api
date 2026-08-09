"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityQuerySchema = exports.actionSchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const schemas_1 = require("../schemas");
exports.actionSchema = type_provider_typebox_1.Type.Union([
    type_provider_typebox_1.Type.Literal("upload"),
    type_provider_typebox_1.Type.Literal("delete"),
    type_provider_typebox_1.Type.Literal("share"),
    type_provider_typebox_1.Type.Literal("login"),
    type_provider_typebox_1.Type.Literal("version"),
]);
exports.activityQuerySchema = type_provider_typebox_1.Type.Object({
    ...schemas_1.paginationProperties,
    userId: type_provider_typebox_1.Type.Optional(schemas_1.uuidSchema),
    action: type_provider_typebox_1.Type.Optional(exports.actionSchema),
    from: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ format: "date" })),
    to: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ format: "date" })),
});
