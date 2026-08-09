"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const handlers_1 = require("../auth/handlers");
const schemas_1 = require("../auth/schemas");
const schemas_2 = require("../schemas");
const routes = async (app) => {
    const auth = { preHandler: (0, auth_1.authorizePermission)("manage_users") };
    app.get("", {
        ...auth,
        schema: {
            tags: ["Users"],
            summary: "List users",
            security: [{ accessToken: [] }],
            querystring: schemas_1.userQuerySchema,
        },
    }, handlers_1.handleGetUsers);
    app.get("/:id", {
        ...auth,
        schema: {
            tags: ["Users"],
            summary: "Get a user",
            security: [{ accessToken: [] }],
            params: schemas_2.idParamsSchema,
        },
    }, handlers_1.handleGetUserById);
    app.put("", {
        ...auth,
        schema: {
            tags: ["Users"],
            summary: "Update a user",
            security: [{ accessToken: [] }],
            body: schemas_1.updateUserBodySchema,
        },
    }, handlers_1.handleUpdateUser);
    app.delete("/:id", {
        ...auth,
        schema: {
            tags: ["Users"],
            summary: "Delete a user",
            security: [{ accessToken: [] }],
            params: schemas_2.idParamsSchema,
        },
    }, handlers_1.handleDeleteAdmin);
};
exports.default = routes;
