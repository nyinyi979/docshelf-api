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
exports.handleDelete = exports.handleUpdate = exports.handleAll = exports.handleList = exports.handleCreate = void 0;
const messages_1 = require("../messages");
const controller = __importStar(require("./controllers"));
const handleCreate = async (req, res) => res
    .code(201)
    .send({ ...messages_1.messages.createOk, data: await controller.createTag(req.body) });
exports.handleCreate = handleCreate;
const handleList = async (req, res) => res.send({
    ...messages_1.messages.verifyOk,
    ...(await controller.getTags(req.query)),
    ...req.query,
});
exports.handleList = handleList;
const handleAll = async (_req, res) => res.send({ ...messages_1.messages.verifyOk, data: await controller.getAllTags() });
exports.handleAll = handleAll;
const handleUpdate = async (req, res) => res.send({
    ...messages_1.messages.updateOk,
    data: await controller.updateTag(req.body),
});
exports.handleUpdate = handleUpdate;
const handleDelete = async (req, res) => res.send({
    ...messages_1.messages.deleteOk,
    data: await controller.deleteTag(req.params.id),
});
exports.handleDelete = handleDelete;
