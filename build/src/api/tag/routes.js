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
    const auth = { preHandler: (0, auth_1.authorizePermission)("manage_categories") };
    const readable = { preHandler: auth_1.authenticateUser };
    app.get("", {
        ...readable,
        schema: {
            tags: ["Tags"],
            summary: "List tags",
            security: [{ accessToken: [] }],
            querystring: schemas_2.tagQuerySchema,
        },
    }, h.handleList);
    app.get("/all", {
        ...readable,
        schema: {
            tags: ["Tags"],
            summary: "List all tag options",
            security: [{ accessToken: [] }],
        },
    }, h.handleAll);
    app.post("", {
        ...auth,
        schema: {
            tags: ["Tags"],
            summary: "Create a tag",
            security: [{ accessToken: [] }],
            body: schemas_2.tagBodySchema,
        },
    }, h.handleCreate);
    app.put("", {
        ...auth,
        schema: {
            tags: ["Tags"],
            summary: "Update a tag",
            security: [{ accessToken: [] }],
            body: schemas_2.updateTagBodySchema,
        },
    }, h.handleUpdate);
    app.delete("/:id", {
        ...auth,
        schema: {
            tags: ["Tags"],
            summary: "Delete a tag",
            security: [{ accessToken: [] }],
            params: schemas_1.idParamsSchema,
        },
    }, h.handleDelete);
};
exports.default = routes;
