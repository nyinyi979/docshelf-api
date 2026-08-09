import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authorizePermission } from "../../utils/auth";
import {
  handleDeleteAdmin,
  handleGetUserById,
  handleGetUsers,
  handleUpdateUser,
} from "../auth/handlers";
import { updateUserBodySchema, userQuerySchema } from "../auth/schemas";
import { idParamsSchema } from "../schemas";
const routes: FastifyPluginAsyncTypebox = async (app) => {
  const auth = { preHandler: authorizePermission("manage_users") };
  app.get(
    "",
    {
      ...auth,
      schema: {
        tags: ["Users"],
        summary: "List users",
        security: [{ accessToken: [] }],
        querystring: userQuerySchema,
      },
    },
    handleGetUsers,
  );
  app.get(
    "/:id",
    {
      ...auth,
      schema: {
        tags: ["Users"],
        summary: "Get a user",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
      },
    },
    handleGetUserById,
  );
  app.put(
    "",
    {
      ...auth,
      schema: {
        tags: ["Users"],
        summary: "Update a user",
        security: [{ accessToken: [] }],
        body: updateUserBodySchema,
      },
    },
    handleUpdateUser,
  );
  app.delete(
    "/:id",
    {
      ...auth,
      schema: {
        tags: ["Users"],
        summary: "Delete a user",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
      },
    },
    handleDeleteAdmin,
  );
};
export default routes;
