"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const handlers_1 = require("./handlers");
const routes = async (app) => {
    app.get("", {
        preHandler: auth_1.authenticateAdmin,
        schema: {
            tags: ["Dashboard"],
            summary: "Get dashboard metrics",
            security: [{ accessToken: [] }],
        },
    }, handlers_1.handleDashboard);
};
exports.default = routes;
