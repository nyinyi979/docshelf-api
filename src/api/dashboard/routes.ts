import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authenticateAdmin } from "../../utils/auth";
import { handleDashboard } from "./handlers";
const routes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "",
    {
      preHandler: authenticateAdmin,
      schema: {
        tags: ["Dashboard"],
        summary: "Get dashboard metrics",
        security: [{ accessToken: [] }],
      },
    },
    handleDashboard,
  );
};
export default routes;
