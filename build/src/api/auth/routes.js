"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const handlers_1 = require("./handlers");
const schemas_1 = require("./schemas");
const routes = async (app) => {
    app.post("/login", {
        schema: {
            tags: ["Authentication"],
            summary: "Log in",
            body: schemas_1.loginBodySchema,
        },
    }, handlers_1.handleLogin);
    app.post("/register", {
        schema: {
            tags: ["Authentication"],
            summary: "Create a member account",
            body: schemas_1.signupBodySchema,
        },
    }, handlers_1.handleSignup);
    app.get("/me", {
        preHandler: auth_1.authenticate,
        schema: {
            tags: ["Authentication"],
            summary: "Get the current user",
            security: [{ accessToken: [] }],
        },
    }, handlers_1.handleGetUserByToken);
    app.put("/me", {
        preHandler: auth_1.authenticate,
        schema: {
            tags: ["Authentication"],
            summary: "Update the current user's profile",
            security: [{ accessToken: [] }],
            body: schemas_1.profileBodySchema,
        },
    }, handlers_1.handleUpdateProfile);
    app.delete("/me", {
        preHandler: auth_1.authenticate,
        schema: {
            tags: ["Authentication"],
            summary: "Delete the current user's account",
            security: [{ accessToken: [] }],
            body: schemas_1.deleteAccountBodySchema,
        },
    }, handlers_1.handleDeleteOwnAccount);
};
exports.default = routes;
