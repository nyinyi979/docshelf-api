import { Static, Type } from "@fastify/type-provider-typebox";
import { orderBySchema, paginationProperties, uuidSchema } from "../schemas";
export const fileTypeSchema = Type.Union([
  Type.Literal("pdf"),
  Type.Literal("doc"),
  Type.Literal("xlsx"),
  Type.Literal("ppt"),
  Type.Literal("img"),
]);
export const visibilitySchema = Type.Union([
  Type.Literal("public"),
  Type.Literal("private"),
]);
export const statusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("processing"),
  Type.Literal("archived"),
]);
export const documentQuerySchema = Type.Object({
  ...paginationProperties,
  query: Type.Optional(Type.String({ maxLength: 200 })),
  categoryId: Type.Optional(uuidSchema),
  fileType: Type.Optional(fileTypeSchema),
  visibility: Type.Optional(visibilitySchema),
  status: Type.Optional(statusSchema),
  uploadedById: Type.Optional(uuidSchema),
  sortBy: Type.Optional(
    Type.Union([
      Type.Literal("title"),
      Type.Literal("sizeBytes"),
      Type.Literal("createdAt"),
    ]),
  ),
  orderBy: Type.Optional(orderBySchema),
});
export const documentBodySchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
  description: Type.Optional(Type.String({ maxLength: 10000 })),
  categoryId: uuidSchema,
  tagIds: Type.Optional(
    Type.Array(uuidSchema, { uniqueItems: true, maxItems: 30 }),
  ),
  temporaryFileUrl: Type.Optional(
    Type.String({ minLength: 1, maxLength: 2048 }),
  ),
  fileUrl: Type.Optional(Type.String({ minLength: 1, maxLength: 2048 })),
  fileKey: Type.Optional(Type.String({ minLength: 1, maxLength: 2048 })),
  fileName: Type.String({ minLength: 1, maxLength: 255 }),
  mimeType: Type.String({ minLength: 1, maxLength: 120 }),
  fileType: fileTypeSchema,
  sizeBytes: Type.Integer({ minimum: 1, maximum: 104857600 }),
  visibility: Type.Optional(visibilitySchema),
  status: Type.Optional(statusSchema),
});
export const updateDocumentBodySchema = Type.Intersect([
  Type.Object({ id: uuidSchema }),
  Type.Partial(
    Type.Omit(documentBodySchema, [
      "fileUrl",
      "fileKey",
      "temporaryFileUrl",
      "fileName",
      "mimeType",
      "fileType",
      "sizeBytes",
    ]),
  ),
]);
export const versionBodySchema = Type.Object({
  fileUrl: Type.String({ minLength: 1, maxLength: 2048 }),
  fileKey: Type.String({ minLength: 1, maxLength: 2048 }),
  fileName: Type.String({ minLength: 1, maxLength: 255 }),
  mimeType: Type.String({ minLength: 1, maxLength: 120 }),
  fileType: fileTypeSchema,
  sizeBytes: Type.Integer({ minimum: 1, maximum: 104857600 }),
});
export const bulkDeleteBodySchema = Type.Object({
  ids: Type.Array(uuidSchema, {
    minItems: 1,
    maxItems: 100,
    uniqueItems: true,
  }),
});
export const bookmarkBodySchema = Type.Object({ bookmarked: Type.Boolean() });
export const accessUrlQuerySchema = Type.Object({
  versionId: Type.Optional(uuidSchema),
});
export type DocumentQuery = Static<typeof documentQuerySchema>;
export type DocumentCreate = Static<typeof documentBodySchema>;
export type DocumentUpdate = Static<typeof updateDocumentBodySchema>;
export type VersionCreate = Static<typeof versionBodySchema>;
