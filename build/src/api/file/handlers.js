"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateFile = exports.handleRemoveFile = exports.handleUploadFile = exports.handleCreateBatchFiles = exports.handleFileUploadTmp = void 0;
const controllers_1 = require("./controllers");
const messages_1 = require("../messages");
const handleFormData_1 = __importDefault(require("../../utils/handleFormData"));
const file_1 = require("../../utils/file");
const controllers_2 = require("../setting/controllers");
const errors_1 = require("../../utils/errors");
const validateFile = async (file) => {
    var _a, _b;
    const settings = await (0, controllers_2.getSettings)();
    const extension = (_b = (_a = file.filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "";
    const allowed = settings.storage.allowedExtensions.map((item) => item.replace(/^\./, "").toLowerCase());
    if (!allowed.includes(extension)) {
        throw new errors_1.BadRequestError(`Files with the .${extension || "unknown"} extension are not allowed.`);
    }
    if (file.buffer.byteLength > settings.storage.maxFileSizeMb * 1024 * 1024) {
        throw new errors_1.BadRequestError(`Files must be ${settings.storage.maxFileSizeMb} MB or smaller.`);
    }
};
const handleFileUploadTmp = async (req, res) => {
    try {
        const parts = req.parts();
        const { imageBuffer, body } = await (0, handleFormData_1.default)(parts);
        if (!imageBuffer) {
            return res
                .status(400)
                .send({ ...messages_1.messages.schemaError, message: "File is required." });
        }
        const file = {
            buffer: imageBuffer,
            filename: body.image.filename,
        };
        await validateFile(file);
        const result = await (0, controllers_1.createFile)(file);
        return res.code(201).send({
            ...messages_1.messages.createOk,
            data: { url: result, filename: body.image.filename },
        });
    }
    catch (err) {
        throw err;
    }
};
exports.handleFileUploadTmp = handleFileUploadTmp;
const handleCreateBatchFiles = async (req, res) => {
    try {
        const parts = req.parts();
        const files = [];
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
        const result = await (0, controllers_1.createBatchFiles)(files);
        return res.code(201).send({ ...messages_1.messages.createOk, data: result });
    }
    catch (err) {
        throw err;
    }
};
exports.handleCreateBatchFiles = handleCreateBatchFiles;
const handleUploadFile = async (req, res) => {
    try {
        const body = req.body;
        const result = await (0, controllers_1.uploadFile)(body.url);
        return res.code(201).send({
            ...messages_1.messages.createOk,
            data: { url: result },
        });
    }
    catch (err) {
        throw err;
    }
};
exports.handleUploadFile = handleUploadFile;
const handleRemoveFile = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url)
            return res
                .code(400)
                .send({ ...messages_1.messages.schemaError, message: "URL is required." });
        const result = await (0, controllers_1.deleteFile)(url);
        return res.code(200).send({ ...messages_1.messages.verifyOk, data: result });
    }
    catch (err) {
        throw err;
    }
};
exports.handleRemoveFile = handleRemoveFile;
const handleDuplicateFile = async (req, _res) => {
    const url = req.query;
    const result = await (0, file_1.duplicateFileS3)(url.url);
    return result;
};
exports.handleDuplicateFile = handleDuplicateFile;
