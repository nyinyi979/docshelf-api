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
exports.handleAccessUrl = exports.handleBookmark = exports.handleBookmarks = exports.handleBulkDelete = exports.handleDelete = exports.handleVersion = exports.handleUpdate = exports.handleGet = exports.handleList = exports.handleCreate = void 0;
const auth_1 = require("../../utils/auth");
const messages_1 = require("../messages");
const controller = __importStar(require("./controllers"));
const ip = (req) => req.ip;
const handleCreate = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.code(201).send({
        ...messages_1.messages.createOk,
        data: await controller.createDocument(req.body, user.id, ip(req)),
    });
};
exports.handleCreate = handleCreate;
const handleList = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.verifyOk,
        ...(await controller.getDocuments(req.query, user)),
        ...req.query,
    });
};
exports.handleList = handleList;
const handleGet = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.verifyOk,
        data: await controller.getDocument(req.params.id, user),
    });
};
exports.handleGet = handleGet;
const handleUpdate = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.updateOk,
        data: await controller.updateDocument(req.body, user),
    });
};
exports.handleUpdate = handleUpdate;
const handleVersion = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.code(201).send({
        ...messages_1.messages.createOk,
        data: await controller.addVersion(req.params.id, req.body, user, ip(req)),
    });
};
exports.handleVersion = handleVersion;
const handleDelete = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.deleteOk,
        data: await controller.deleteDocuments([req.params.id], user, ip(req)),
    });
};
exports.handleDelete = handleDelete;
const handleBulkDelete = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.deleteOk,
        data: await controller.deleteDocuments(req.body.ids, user, ip(req)),
    });
};
exports.handleBulkDelete = handleBulkDelete;
const handleBookmarks = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.verifyOk,
        ...(await controller.getBookmarkedDocuments(req.query, user)),
        ...req.query,
    });
};
exports.handleBookmarks = handleBookmarks;
const handleBookmark = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.updateOk,
        data: await controller.setBookmark(req.params.id, req.body.bookmarked, user),
    });
};
exports.handleBookmark = handleBookmark;
const handleAccessUrl = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.verifyOk,
        data: await controller.getFileAccess(req.params.id, user, req.query.versionId),
    });
};
exports.handleAccessUrl = handleAccessUrl;
