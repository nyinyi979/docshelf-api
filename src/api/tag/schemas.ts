import { Static, Type } from "@fastify/type-provider-typebox";
import { paginationProperties, uuidSchema } from "../schemas";
export const tagQuerySchema = Type.Object({
  ...paginationProperties,
  query: Type.Optional(Type.String({ maxLength: 60 })),
});
export const tagBodySchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 60 }),
  slug: Type.String({
    minLength: 1,
    maxLength: 80,
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  }),
});
export const updateTagBodySchema = Type.Intersect([
  Type.Object({ id: uuidSchema }),
  Type.Partial(tagBodySchema),
]);
export type TagQuery = Static<typeof tagQuerySchema>;
export type TagCreate = Static<typeof tagBodySchema>;
export type TagUpdate = Static<typeof updateTagBodySchema>;
