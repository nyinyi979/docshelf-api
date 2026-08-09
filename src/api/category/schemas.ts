import { Static, Type } from "@fastify/type-provider-typebox";
import { paginationProperties, orderBySchema, uuidSchema } from "../schemas";

export const categoryQuerySchema = Type.Object({
  ...paginationProperties,
  query: Type.Optional(Type.String({ maxLength: 100 })),
  sortBy: Type.Optional(
    Type.Union([
      Type.Literal("name"),
      Type.Literal("createdAt"),
      Type.Literal("documentCount"),
    ]),
  ),
  orderBy: Type.Optional(orderBySchema),
});
export const categoryBodySchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  slug: Type.String({
    minLength: 1,
    maxLength: 120,
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  }),
  description: Type.Optional(Type.String({ maxLength: 2000 })),
});
export const updateCategoryBodySchema = Type.Object(
  {
    id: uuidSchema,
    name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    slug: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 120,
        pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      }),
    ),
    description: Type.Optional(Type.String({ maxLength: 2000 })),
  },
  { minProperties: 2 },
);
export type CategoryQuery = Static<typeof categoryQuerySchema>;
export type CategoryCreate = Static<typeof categoryBodySchema>;
export type CategoryUpdate = Static<typeof updateCategoryBodySchema>;
