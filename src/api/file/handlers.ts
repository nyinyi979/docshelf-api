import { FastifyReply, FastifyRequest } from "fastify";
import {
  createBatchFiles,
  createFile,
  deleteFile,
  uploadFile,
} from "./controllers";
import { messages } from "../messages";
import handleFormData from "../../utils/handleFormData";
import { duplicateFileS3, TFile } from "../../utils/file";
import { TypeBoxRequest } from "../request";
import { fileUrlBodySchema, fileUrlQuerySchema } from "./schemas";
import { getSettings } from "../setting/controllers";
import { BadRequestError } from "../../utils/errors";

const validateFile = async (file: TFile) => {
  const settings = await getSettings();
  const extension = file.filename.split(".").pop()?.toLowerCase() ?? "";
  const allowed = settings.storage.allowedExtensions.map((item) =>
    item.replace(/^\./, "").toLowerCase(),
  );
  if (!allowed.includes(extension)) {
    throw new BadRequestError(
      `Files with the .${extension || "unknown"} extension are not allowed.`,
    );
  }
  if (file.buffer.byteLength > settings.storage.maxFileSizeMb * 1024 * 1024) {
    throw new BadRequestError(
      `Files must be ${settings.storage.maxFileSizeMb} MB or smaller.`,
    );
  }
};

export const handleFileUploadTmp = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    const parts = req.parts();
    const { imageBuffer, body } = await handleFormData(parts);
    if (!imageBuffer) {
      return res
        .status(400)
        .send({ ...messages.schemaError, message: "File is required." });
    }
    const file = {
      buffer: imageBuffer,
      filename: body.image.filename,
    };
    await validateFile(file);
    const result = await createFile(file);
    return res.code(201).send({
      ...messages.createOk,
      data: { url: result, filename: body.image.filename },
    });
  } catch (err) {
    throw err;
  }
};

export const handleCreateBatchFiles = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    const parts = req.parts();
    const files: TFile[] = [];
    for await (const part of parts) {
      if (part.type === "file" && part.fieldname === "file") {
        const imageBuffer = await part.toBuffer();
        files.push({
          filename: part.filename,
          buffer: imageBuffer,
        });
      }
    }
    await Promise.all(files.map(validateFile));
    const result = await createBatchFiles(files);
    return res.code(201).send({ ...messages.createOk, data: result });
  } catch (err) {
    throw err;
  }
};

export const handleUploadFile = async (
  req: TypeBoxRequest<{ body: typeof fileUrlBodySchema }>,
  res: FastifyReply,
) => {
  try {
    const body = req.body;
    const result = await uploadFile(body.url);
    return res.code(201).send({
      ...messages.createOk,
      data: { url: result },
    });
  } catch (err) {
    throw err;
  }
};
export const handleRemoveFile = async (
  req: TypeBoxRequest<{ querystring: typeof fileUrlQuerySchema }>,
  res: FastifyReply,
) => {
  try {
    const { url } = req.query;
    if (!url)
      return res
        .code(400)
        .send({ ...messages.schemaError, message: "URL is required." });
    const result = await deleteFile(url);
    return res.code(200).send({ ...messages.verifyOk, data: result });
  } catch (err) {
    throw err;
  }
};

export const handleDuplicateFile = async (
  req: TypeBoxRequest<{ querystring: typeof fileUrlQuerySchema }>,
  _res: FastifyReply,
) => {
  const url = req.query;
  const result = await duplicateFileS3(url.url);
  return result;
};
