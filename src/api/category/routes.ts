import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authenticateUser, authorizePermission } from "../../utils/auth";
import { idParamsSchema } from "../schemas";
import * as handlers from "./handlers";
import {
  categoryBodySchema,
  categoryQuerySchema,
  updateCategoryBodySchema,
} from "./schemas";

const routes: FastifyPluginAsyncTypebox = async (app) => {
  const readable = { preHandler: authenticateUser };
  const secured = { preHandler: authorizePermission("manage_categories") };
  app.get(
    "",
    {
      ...readable,
      schema: {
        tags: ["Categories"],
        summary: "List categories",
        security: [{ accessToken: [] }],
        querystring: categoryQuerySchema,
      },
    },
    handlers.handleGetCategories,
  );
  app.get(
    "/all",
    {
      ...readable,
      schema: {
        tags: ["Categories"],
        summary: "List all category options",
        security: [{ accessToken: [] }],
      },
    },
    handlers.handleGetAllCategories,
  );
  app.post(
    "",
    {
      ...secured,
      schema: {
        tags: ["Categories"],
        summary: "Create a category",
        security: [{ accessToken: [] }],
        body: categoryBodySchema,
      },
    },
    handlers.handleCreateCategory,
  );
  app.put(
    "",
    {
      ...secured,
      schema: {
        tags: ["Categories"],
        summary: "Update a category",
        security: [{ accessToken: [] }],
        body: updateCategoryBodySchema,
      },
    },
    handlers.handleUpdateCategory,
  );
  app.delete(
    "/:id",
    {
      ...secured,
      schema: {
        tags: ["Categories"],
        summary: "Delete a category",
        security: [{ accessToken: [] }],
        params: idParamsSchema,
      },
    },
    handlers.handleDeleteCategory,
  );
};
export default routes;
