import { Static, Type } from "@fastify/type-provider-typebox";
export const settingsBodySchema = Type.Object({
  general: Type.Optional(
    Type.Object({
      siteName: Type.Optional(Type.String({ maxLength: 100 })),
      supportEmail: Type.Optional(Type.String({ format: "email" })),
      defaultVisibility: Type.Optional(
        Type.Union([Type.Literal("public"), Type.Literal("private")]),
      ),
    }),
  ),
  storage: Type.Optional(
    Type.Object({
      maxFileSizeMb: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
      allowedExtensions: Type.Optional(
        Type.Array(Type.String({ maxLength: 12 }), { maxItems: 30 }),
      ),
    }),
  ),
  email: Type.Optional(
    Type.Object({
      uploadNotifications: Type.Optional(Type.Boolean()),
      weeklyDigest: Type.Optional(Type.Boolean()),
    }),
  ),
  permissions: Type.Optional(
    Type.Record(Type.String(), Type.Record(Type.String(), Type.Boolean())),
  ),
});
export type SettingsInput = Static<typeof settingsBodySchema>;
