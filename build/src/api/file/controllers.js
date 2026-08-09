"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = exports.createBatchFiles = exports.createFile = void 0;
const file_1 = require("../../utils/file");
const createFile = async (data) => {
    return await (0, file_1.saveFileToTmp)(data);
};
exports.createFile = createFile;
const createBatchFiles = async (data) => {
    return await Promise.all(data.map((item) => (0, file_1.saveFileToTmp)(item)));
};
exports.createBatchFiles = createBatchFiles;
const uploadFile = async (data) => {
    return await (0, file_1.uploadFile)(data);
};
exports.uploadFile = uploadFile;
const deleteFile = async (filePath) => {
    return (0, file_1.removeTemporaryFile)(filePath);
};
exports.deleteFile = deleteFile;
