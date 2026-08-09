import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authenticateUser, authorizePermission } from "../../utils/auth";
import { idParamsSchema } from "../schemas";
import * as h from "./handlers";
import {
  bulkDeleteBodySchema,
  bookmarkBodySchema,
  documentBodySchema,
  documentQuerySchema,
  accessUrlQuerySchema,
  updateDocumentBodySchema,
  versionBodySchema,
} from "./schemas";
const routes: FastifyPluginAsyncTypebox = async (app) => {
  const auth = { preHandler: authenticateUser };
  const canUpload = { preHandler: authorizePermission("upload") };
  app.get(
    "/bookmarks",
    {
      ...auth,
      schema: {
        tags: ["Documents"],
        summary: "List the current user's bookmarked documents",
        security: [{ accessToken: [] }],
        querystring: documentQuerySchema,
      },
    },
    h.handleBookmarks,
  );
  app.get(
    "",
    {
      ...auth,
      schema: {
        tags: ["Documents"],
        summary: "List and search documents",
        security: [{ accessToken: [] }],
        querystring: documentQuerySchema,
      },
    },
    h.handleList,
  );
  app.get(
    "/:id",
    {
      ...auth,
      schema: {
        tags: ["Documents"],
        summary: "Get a document and its versions",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
      },
    },
    h.handleGet,
  );
  app.post(
    "",
    {
      ...canUpload,
      schema: {
        tags: ["Documents"],
        summary: "Create a document",
        security: [{ accessToken: [] }],
        body: documentBodySchema,
      },
    },
    h.handleCreate,
  );
  app.put(
    "/:id/bookmark",
    {
      ...auth,
      schema: {
        tags: ["Documents"],
        summary: "Set the current user's bookmark state",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
        body: bookmarkBodySchema,
      },
    },
    h.handleBookmark,
  );
  app.get(
    "/:id/access-url",
    {
      ...auth,
      schema: {
        tags: ["Documents"],
        summary: "Create a two-hour presigned file URL",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
        querystring: accessUrlQuerySchema,
      },
    },
    h.handleAccessUrl,
  );
  app.put(
    "",
    {
      ...auth,
      schema: {
        tags: ["Documents"],
        summary: "Update document metadata",
        security: [{ accessToken: [] }],
        body: updateDocumentBodySchema,
      },
    },
    h.handleUpdate,
  );
  app.post(
    "/:id/versions",
    {
      ...canUpload,
      schema: {
        tags: ["Documents"],
        summary: "Upload a new document version",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
        body: versionBodySchema,
      },
    },
    h.handleVersion,
  );
  app.delete(
    "/:id",
    {
      ...auth,
      schema: {
        tags: ["Documents"],
        summary: "Delete a document",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
      },
    },
    h.handleDelete,
  );
  app.post(
    "/bulk-delete",
    {
      ...auth,
      schema: {
        tags: ["Documents"],
        summary: "Delete documents in bulk",
        security: [{ accessToken: [] }],
        body: bulkDeleteBodySchema,
      },
    },
    h.handleBulkDelete,
  );
};
export default routes;
