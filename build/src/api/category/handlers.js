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
exports.handleDeleteCategory = exports.handleUpdateCategory = exports.handleGetAllCategories = exports.handleGetCategories = exports.handleCreateCategory = void 0;
const messages_1 = require("../messages");
const controller = __importStar(require("./controllers"));
const handleCreateCategory = async (req, res) => res.code(201).send({
    ...messages_1.messages.createOk,
    data: await controller.createCategory(req.body),
});
exports.handleCreateCategory = handleCreateCategory;
const handleGetCategories = async (req, res) => res.send({
    ...messages_1.messages.verifyOk,
    ...(await controller.getCategories(req.query)),
    ...req.query,
});
exports.handleGetCategories = handleGetCategories;
const handleGetAllCategories = async (_req, res) => res.send({ ...messages_1.messages.verifyOk, data: await controller.getAllCategories() });
exports.handleGetAllCategories = handleGetAllCategories;
const handleUpdateCategory = async (req, res) => res.send({
    ...messages_1.messages.updateOk,
    data: await controller.updateCategory(req.body),
});
exports.handleUpdateCategory = handleUpdateCategory;
const handleDeleteCategory = async (req, res) => res.send({
    ...messages_1.messages.deleteOk,
    data: await controller.deleteCategory(req.params.id),
});
exports.handleDeleteCategory = handleDeleteCategory;
