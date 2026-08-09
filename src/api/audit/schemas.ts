import { Static, Type } from "@fastify/type-provider-typebox";
import { paginationProperties, uuidSchema } from "../schemas";
export const actionSchema = Type.Union([
  Type.Literal("upload"),
  Type.Literal("delete"),
  Type.Literal("share"),
  Type.Literal("login"),
  Type.Literal("version"),
]);
export const activityQuerySchema = Type.Object({
  ...paginationProperties,
  userId: Type.Optional(uuidSchema),
  action: Type.Optional(actionSchema),
  from: Type.Optional(Type.String({ format: "date" })),
  to: Type.Optional(Type.String({ format: "date" })),
});
export type ActivityQuery = Static<typeof activityQuerySchema>;
