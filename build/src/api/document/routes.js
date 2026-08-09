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
const h = __importStar(require("./handlers"));
const schemas_2 = require("./schemas");
const routes = async (app) => {
    const auth = { preHandler: auth_1.authenticateUser };
    const canUpload = { preHandler: (0, auth_1.authorizePermission)("upload") };
    app.get("/bookmarks", {
        ...auth,
        schema: {
            tags: ["Documents"],
            summary: "List the current user's bookmarked documents",
            security: [{ accessToken: [] }],
            querystring: schemas_2.documentQuerySchema,
        },
    }, h.handleBookmarks);
    app.get("", {
        ...auth,
        schema: {
            tags: ["Documents"],
            summary: "List and search documents",
            security: [{ accessToken: [] }],
            querystring: schemas_2.documentQuerySchema,
        },
    }, h.handleList);
    app.get("/:id", {
        ...auth,
        schema: {
            tags: ["Documents"],
            summary: "Get a document and its versions",
            security: [{ accessToken: [] }],
            params: schemas_1.idParamsSchema,
        },
    }, h.handleGet);
    app.post("", {
        ...canUpload,
        schema: {
            tags: ["Documents"],
            summary: "Create a document",
            security: [{ accessToken: [] }],
            body: schemas_2.documentBodySchema,
        },
    }, h.handleCreate);
    app.put("/:id/bookmark", {
        ...auth,
        schema: {
            tags: ["Documents"],
            summary: "Set the current user's bookmark state",
            security: [{ accessToken: [] }],
            params: schemas_1.idParamsSchema,
            body: schemas_2.bookmarkBodySchema,
        },
    }, h.handleBookmark);
    app.get("/:id/access-url", {
        ...auth,
        schema: {
            tags: ["Documents"],
            summary: "Create a two-hour presigned file URL",
            security: [{ accessToken: [] }],
            params: schemas_1.idParamsSchema,
            querystring: schemas_2.accessUrlQuerySchema,
        },
    }, h.handleAccessUrl);
    app.put("", {
        ...auth,
        schema: {
            tags: ["Documents"],
            summary: "Update document metadata",
            security: [{ accessToken: [] }],
            body: schemas_2.updateDocumentBodySchema,
        },
    }, h.handleUpdate);
    app.post("/:id/versions", {
        ...canUpload,
        schema: {
            tags: ["Documents"],
            summary: "Upload a new document version",
            security: [{ accessToken: [] }],
            params: schemas_1.idParamsSchema,
            body: schemas_2.versionBodySchema,
        },
    }, h.handleVersion);
    app.delete("/:id", {
        ...auth,
        schema: {
            tags: ["Documents"],
            summary: "Delete a document",
            security: [{ accessToken: [] }],
            params: schemas_1.idParamsSchema,
        },
    }, h.handleDelete);
    app.post("/bulk-delete", {
        ...auth,
        schema: {
            tags: ["Documents"],
            summary: "Delete documents in bulk",
            security: [{ accessToken: [] }],
            body: schemas_2.bulkDeleteBodySchema,
        },
    }, h.handleBulkDelete);
};
exports.default = routes;
