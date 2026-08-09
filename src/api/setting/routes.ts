import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authenticateAdmin, authenticateUser } from "../../utils/auth";
import { handleGet, handleGetRuntime, handleUpdate } from "./handlers";
import { settingsBodySchema } from "./schemas";
const routes: FastifyPluginAsyncTypebox = async (app) => {
  const auth = { preHandler: authenticateAdmin };
  app.get(
    "/runtime",
    {
      preHandler: authenticateUser,
      schema: {
        tags: ["Settings"],
        summary: "Get settings that apply to the current user",
        security: [{ accessToken: [] }],
      },
    },
    handleGetRuntime,
  );
  app.get(
    "",
    {
      ...auth,
      schema: {
        tags: ["Settings"],
        summary: "Get application settings",
        security: [{ accessToken: [] }],
      },
    },
    handleGet,
  );
  app.put(
    "",
    {
      ...auth,
      schema: {
        tags: ["Settings"],
        summary: "Update application settings",
        security: [{ accessToken: [] }],
        body: settingsBodySchema,
      },
    },
    handleUpdate,
  );
};
export default routes;
