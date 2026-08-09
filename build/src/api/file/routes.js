"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = require("./handlers");
const schemas_1 = require("./schemas");
const auth_1 = require("../../utils/auth");
const fileRoutes = async (app) => {
    const canUpload = (0, auth_1.authorizePermission)("upload");
    app.post("/", {
        preHandler: canUpload,
        schema: { tags: ["Files"], summary: "Upload a temporary file" },
        handler: handlers_1.handleFileUploadTmp,
    });
    app.post("/batch", {
        preHandler: canUpload,
        schema: { tags: ["Files"], summary: "Upload temporary files" },
        handler: handlers_1.handleCreateBatchFiles,
    });
    app.delete("/", {
        preHandler: canUpload,
        schema: {
            tags: ["Files"],
            summary: "Discard a temporary file",
            querystring: schemas_1.fileUrlQuerySchema,
        },
        handler: handlers_1.handleRemoveFile,
    });
    app.post("/upload", {
        preHandler: canUpload,
        schema: {
            tags: ["Files"],
            summary: "Move a temporary file to permanent storage",
            body: schemas_1.fileUrlBodySchema,
        },
        handler: handlers_1.handleUploadFile,
    });
};
exports.default = fileRoutes;
