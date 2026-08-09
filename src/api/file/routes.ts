import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  handleCreateBatchFiles,
  handleFileUploadTmp,
  handleRemoveFile,
  handleUploadFile,
} from "./handlers";
import { fileUrlBodySchema, fileUrlQuerySchema } from "./schemas";
import { authorizePermission } from "../../utils/auth";

const fileRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const canUpload = authorizePermission("upload");
  app.post("/", {
    preHandler: canUpload,
    schema: { tags: ["Files"], summary: "Upload a temporary file" },
    handler: handleFileUploadTmp,
  });
  app.post("/batch", {
    preHandler: canUpload,
    schema: { tags: ["Files"], summary: "Upload temporary files" },
    handler: handleCreateBatchFiles,
  });
  app.delete("/", {
    preHandler: canUpload,
    schema: {
      tags: ["Files"],
      summary: "Discard a temporary file",
      querystring: fileUrlQuerySchema,
    },
    handler: handleRemoveFile,
  });
  app.post("/upload", {
    preHandler: canUpload,
    schema: {
      tags: ["Files"],
      summary: "Move a temporary file to permanent storage",
      body: fileUrlBodySchema,
    },
    handler: handleUploadFile,
  });
};

export default fileRoutes;
