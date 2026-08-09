"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const handlers_1 = require("./handlers");
const schemas_1 = require("./schemas");
const routes = async (app) => {
    const auth = { preHandler: auth_1.authenticateAdmin };
    app.get("/runtime", {
        preHandler: auth_1.authenticateUser,
        schema: {
            tags: ["Settings"],
            summary: "Get settings that apply to the current user",
            security: [{ accessToken: [] }],
        },
    }, handlers_1.handleGetRuntime);
    app.get("", {
        ...auth,
        schema: {
            tags: ["Settings"],
            summary: "Get application settings",
            security: [{ accessToken: [] }],
        },
    }, handlers_1.handleGet);
    app.put("", {
        ...auth,
        schema: {
            tags: ["Settings"],
            summary: "Update application settings",
            security: [{ accessToken: [] }],
            body: schemas_1.settingsBodySchema,
        },
    }, handlers_1.handleUpdate);
};
exports.default = routes;
