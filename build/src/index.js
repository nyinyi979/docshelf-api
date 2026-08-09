"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const cors_1 = __importDefault(require("@fastify/cors"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const sensible_1 = __importDefault(require("@fastify/sensible"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const fastify_1 = __importDefault(require("fastify"));
const routes_1 = __importDefault(require("./api/audit/routes"));
const routes_2 = __importDefault(require("./api/auth/routes"));
const routes_3 = __importDefault(require("./api/category/routes"));
const routes_4 = __importDefault(require("./api/dashboard/routes"));
const routes_5 = __importDefault(require("./api/document/routes"));
const routes_6 = __importDefault(require("./api/file/routes"));
const messages_1 = require("./api/messages");
const routes_7 = __importDefault(require("./api/setting/routes"));
const routes_8 = __importDefault(require("./api/tag/routes"));
const routes_9 = __importDefault(require("./api/user/routes"));
const errorHandler_1 = require("./utils/errorHandler");
let cachedApp = null;
async function buildApp() {
    if (cachedApp)
        return cachedApp;
    const app = (0, fastify_1.default)({ logger: true });
    await app.register(swagger_1.default, {
        openapi: {
            openapi: "3.0.3",
            info: {
                title: "DocShelf API",
                description: "Document management, versioning, taxonomy, users, and audit API for DocShelf.",
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
    await app.register(swagger_ui_1.default, {
        routePrefix: "/documentation",
        staticCSP: true,
        uiConfig: {
            deepLinking: true,
            docExpansion: "list",
            persistAuthorization: true,
        },
    });
    await app.register(helmet_1.default, { contentSecurityPolicy: false });
    await app.register(sensible_1.default);
    app.register(cors_1.default, {
        origin: "*",
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
    });
    await app.register(rate_limit_1.default, { max: 60, timeWindow: "1 minute" });
    await app.register(multipart_1.default, {
        // Runtime settings enforce the actual limit. This is the validated ceiling.
        limits: { fileSize: 100 * 1024 * 1024, files: 10 },
    });
    await app.register(formbody_1.default);
    app.setErrorHandler(errorHandler_1.handleApiError);
    app.setNotFoundHandler((_req, res) => res.status(404).send({ ...messages_1.messages.notFound }));
    app.get("/api", { schema: { tags: ["Health"], summary: "Check API availability" } }, (_req, res) => res.send({ statusCode: 200, message: "DocShelf API is available." }));
    app.register(routes_2.default, { prefix: "/api/auth" });
    app.register(routes_9.default, { prefix: "/api/users" });
    app.register(routes_5.default, { prefix: "/api/documents" });
    app.register(routes_3.default, { prefix: "/api/categories" });
    app.register(routes_8.default, { prefix: "/api/tags" });
    app.register(routes_1.default, { prefix: "/api/activity" });
    app.register(routes_4.default, { prefix: "/api/dashboard" });
    app.register(routes_7.default, { prefix: "/api/settings" });
    app.register(routes_6.default, { prefix: "/api/files" });
    await app.ready();
    cachedApp = app;
    return app;
}
if (require.main === module)
    buildApp().then((app) => app
        .listen({ port: Number(process.env.DEV_PORT) || 7000, host: "127.0.0.1" })
        .catch((error) => {
        app.log.error(error);
        process.exit(1);
    }));
const handler = async (req, res) => {
    const app = await buildApp();
    app.server.emit("request", req, res);
};
module.exports = handler;
module.exports.buildApp = buildApp;
