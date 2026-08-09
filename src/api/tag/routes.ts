import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authenticateUser, authorizePermission } from "../../utils/auth";
import { idParamsSchema } from "../schemas";
import * as h from "./handlers";
import { tagBodySchema, tagQuerySchema, updateTagBodySchema } from "./schemas";
const routes: FastifyPluginAsyncTypebox = async (app) => {
  const auth = { preHandler: authorizePermission("manage_categories") };
  const readable = { preHandler: authenticateUser };
  app.get(
    "",
    {
      ...readable,
      schema: {
        tags: ["Tags"],
        summary: "List tags",
        security: [{ accessToken: [] }],
        querystring: tagQuerySchema,
      },
    },
    h.handleList,
  );
  app.get(
    "/all",
    {
      ...readable,
      schema: {
        tags: ["Tags"],
        summary: "List all tag options",
        security: [{ accessToken: [] }],
      },
    },
    h.handleAll,
  );
  app.post(
    "",
    {
      ...auth,
      schema: {
        tags: ["Tags"],
        summary: "Create a tag",
        security: [{ accessToken: [] }],
        body: tagBodySchema,
      },
    },
    h.handleCreate,
  );
  app.put(
    "",
    {
      ...auth,
      schema: {
        tags: ["Tags"],
        summary: "Update a tag",
        security: [{ accessToken: [] }],
        body: updateTagBodySchema,
      },
    },
    h.handleUpdate,
  );
  app.delete(
    "/:id",
    {
      ...auth,
      schema: {
        tags: ["Tags"],
        summary: "Delete a tag",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
      },
    },
    h.handleDelete,
  );
};
export default routes;
