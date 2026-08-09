import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authenticateAdmin, authenticateUser } from "../../utils/auth";
import { handleList, handleMyActivity } from "./handlers";
import { activityQuerySchema } from "./schemas";
const routes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "/me",
    {
      preHandler: authenticateUser,
      schema: {
        tags: ["Activity"],
        summary: "List the current user's activity",
        security: [{ accessToken: [] }],
        querystring: activityQuerySchema,
      },
    },
    handleMyActivity,
  );
  app.get(
    "",
    {
      preHandler: authenticateAdmin,
      schema: {
        tags: ["Activity"],
        summary: "List audit activity",
        security: [{ accessToken: [] }],
        querystring: activityQuerySchema,
      },
    },
    handleList,
  );
};
export default routes;
