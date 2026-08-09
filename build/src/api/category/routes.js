"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
const schemas_1 = require("../schemas");
const handlers = __importStar(require("./handlers"));
const schemas_2 = require("./schemas");
const routes = async (app) => {
    const readable = { preHandler: auth_1.authenticateUser };
    const secured = { preHandler: (0, auth_1.authorizePermission)("manage_categories") };
    app.get("", {
        ...readable,
        schema: {
            tags: ["Categories"],
            summary: "List categories",
            security: [{ accessToken: [] }],
            querystring: schemas_2.categoryQuerySchema,
        },
    }, handlers.handleGetCategories);
    app.get("/all", {
        ...readable,
        schema: {
            tags: ["Categories"],
            summary: "List all category options",
            security: [{ accessToken: [] }],
        },
    }, handlers.handleGetAllCategories);
    app.post("", {
        ...secured,
        schema: {
            tags: ["Categories"],
            summary: "Create a category",
            security: [{ accessToken: [] }],
            body: schemas_2.categoryBodySchema,
        },
    }, handlers.handleCreateCategory);
    app.put("", {
        ...secured,
        schema: {
            tags: ["Categories"],
            summary: "Update a category",
            security: [{ accessToken: [] }],
            body: schemas_2.updateCategoryBodySchema,
        },
    }, handlers.handleUpdateCategory);
    app.delete("/:id", {
        ...secured,
        schema: {
            tags: ["Categories"],
            summary: "Delete a category",
            security: [{ accessToken: [] }],
            params: schemas_1.idParamsSchema,
        },
    }, handlers.handleDeleteCategory);
};
exports.default = routes;
