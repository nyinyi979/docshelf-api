"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsBodySchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
exports.settingsBodySchema = type_provider_typebox_1.Type.Object({
    general: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Object({
        siteName: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ maxLength: 100 })),
        supportEmail: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String({ format: "email" })),
        defaultVisibility: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Union([type_provider_typebox_1.Type.Literal("public"), type_provider_typebox_1.Type.Literal("private")])),
    })),
    storage: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Object({
        maxFileSizeMb: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Integer({ minimum: 1, maximum: 100 })),
        allowedExtensions: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Array(type_provider_typebox_1.Type.String({ maxLength: 12 }), { maxItems: 30 })),
    })),
    email: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Object({
        uploadNotifications: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Boolean()),
        weeklyDigest: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Boolean()),
    })),
    permissions: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.Record(type_provider_typebox_1.Type.String(), type_provider_typebox_1.Type.Record(type_provider_typebox_1.Type.String(), type_provider_typebox_1.Type.Boolean()))),
});
