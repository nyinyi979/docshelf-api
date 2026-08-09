"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const handlers_1 = require("./handlers");
const schemas_1 = require("./schemas");
const routes = async (app) => {
    app.get("/me", {
        preHandler: auth_1.authenticateUser,
        schema: {
            tags: ["Activity"],
            summary: "List the current user's activity",
            security: [{ accessToken: [] }],
            querystring: schemas_1.activityQuerySchema,
        },
    }, handlers_1.handleMyActivity);
    app.get("", {
        preHandler: auth_1.authenticateAdmin,
        schema: {
            tags: ["Activity"],
            summary: "List audit activity",
            security: [{ accessToken: [] }],
            querystring: schemas_1.activityQuerySchema,
        },
    }, handlers_1.handleList);
};
exports.default = routes;
