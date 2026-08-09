"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserBodySchema = exports.signupBodySchema = exports.deleteAccountBodySchema = exports.profileBodySchema = exports.inviteBodySchema = exports.userQuerySchema = exports.loginBodySchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const schemas_1 = require("../schemas");
exports.loginBodySchema = type_provider_typebox_1.Type.Object({
    email: type_provider_typebox_1.Type.String({ format: "email" }),
    password: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 255 }),
});
exports.userQuerySchema = type_provider_typebox_1.Type.Object({
    ...schemas_1.paginationQuerySchema.properties,
    query: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ maxLength: 100 })),
    role: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Union([type_provider_typebox_1.Type.Literal("admin"), type_provider_typebox_1.Type.Literal("member")])),
    active: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Boolean()),
    joinedAfter: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ format: "date" })),
});
exports.inviteBodySchema = type_provider_typebox_1.Type.Object({
    email: type_provider_typebox_1.Type.String({ format: "email", maxLength: 100 }),
    role: type_provider_typebox_1.Type.Union([type_provider_typebox_1.Type.Literal("admin"), type_provider_typebox_1.Type.Literal("member")]),
});
exports.profileBodySchema = type_provider_typebox_1.Type.Object({
    username: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 100 })),
    currentPassword: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 255 })),
    newPassword: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ minLength: 8, maxLength: 255 })),
}, { minProperties: 1 });
exports.deleteAccountBodySchema = type_provider_typebox_1.Type.Object({
    password: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 255 }),
});
exports.signupBodySchema = type_provider_typebox_1.Type.Object({
    username: type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 100 }),
    email: type_provider_typebox_1.Type.String({ format: "email", maxLength: 100 }),
    password: type_provider_typebox_1.Type.String({ minLength: 8, maxLength: 255 }),
});
exports.updateUserBodySchema = type_provider_typebox_1.Type.Object({
    id: type_provider_typebox_1.Type.String({ format: "uuid" }),
    username: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ minLength: 1, maxLength: 100 })),
    email: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ format: "email", maxLength: 100 })),
    password: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Union([type_provider_typebox_1.Type.String({ minLength: 8, maxLength: 255 }), type_provider_typebox_1.Type.Null()])),
    role: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Union([type_provider_typebox_1.Type.Literal("admin"), type_provider_typebox_1.Type.Literal("member")])),
    active: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Boolean()),
}, { minProperties: 2 });
