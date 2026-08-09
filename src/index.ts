import cors from "@fastify/cors";
import formBody from "@fastify/formbody";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import activityRoutes from "./api/audit/routes";
import authRoutes from "./api/auth/routes";
import categoryRoutes from "./api/category/routes";
import dashboardRoutes from "./api/dashboard/routes";
import documentRoutes from "./api/document/routes";
import fileRoutes from "./api/file/routes";
import { messages } from "./api/messages";
import settingRoutes from "./api/setting/routes";
import tagRoutes from "./api/tag/routes";
import userRoutes from "./api/user/routes";
import { handleApiError } from "./utils/errorHandler";

let cachedApp: FastifyInstance | null = null;
export async function buildApp(): Promise<FastifyInstance> {
  if (cachedApp) return cachedApp;
  const app = Fastify({ logger: true });
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "DocShelf API",
        description:
          "Document management, versioning, taxonomy, users, and audit API for DocShelf.",
        version: "1.0.0",
      },
      tags: [
        { name: "Health", description: "Service health" },
        { name: "Authentication", description: "Account access" },
        { name: "Users", description: "User administration" },
        { name: "Documents", description: "Documents and versions" },
        { name: "Categories", description: "Document categories" },
        { name: "Tags", description: "Document tags" },
        { name: "Activity", description: "Audit log" },
        { name: "Dashboard", description: "Admin metrics" },
        { name: "Settings", description: "Application settings" },
        { name: "Files", description: "File uploads" },
      ],
      components: {
        securitySchemes: {
          accessToken: {
            type: "apiKey",
            in: "header",
            name: "x-access-token",
            description: "JWT returned by login.",
          },
        },
      },
    },
  });
  await app.register(swaggerUi, {
    routePrefix: "/documentation",
    staticCSP: true,
    uiConfig: {
      deepLinking: true,
      docExpansion: "list",
      persistAuthorization: true,
    },
  });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(sensible);
  app.register(cors, {
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
  });
  await app.register(rateLimit, { max: 60, timeWindow: "1 minute" });
  await app.register(multipart, {
    // Runtime settings enforce the actual limit. This is the validated ceiling.
    limits: { fileSize: 100 * 1024 * 1024, files: 10 },
  });
  await app.register(formBody);
  app.setErrorHandler(handleApiError);
  app.setNotFoundHandler((_req, res) =>
    res.status(404).send({ ...messages.notFound }),
  );
  app.get(
    "/api",
    { schema: { tags: ["Health"], summary: "Check API availability" } },
    (_req, res) =>
      res.send({ statusCode: 200, message: "DocShelf API is available." }),
  );
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(userRoutes, { prefix: "/api/users" });
  app.register(documentRoutes, { prefix: "/api/documents" });
  app.register(categoryRoutes, { prefix: "/api/categories" });
  app.register(tagRoutes, { prefix: "/api/tags" });
  app.register(activityRoutes, { prefix: "/api/activity" });
  app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  app.register(settingRoutes, { prefix: "/api/settings" });
  app.register(fileRoutes, { prefix: "/api/files" });
  await app.ready();
  cachedApp = app;
  return app;
}
if (require.main === module)
  buildApp().then((app) =>
    app
      .listen({ port: Number(process.env.DEV_PORT) || 7000, host: "127.0.0.1" })
      .catch((error) => {
        app.log.error(error);
        process.exit(1);
      }),
  );
const handler = async (req: FastifyRequest, res: FastifyReply) => {
  const app = await buildApp();
  app.server.emit("request", req, res);
};
module.exports = handler;
module.exports.buildApp = buildApp;
