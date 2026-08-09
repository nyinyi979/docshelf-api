"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdate = exports.handleGetRuntime = exports.handleGet = void 0;
const messages_1 = require("../messages");
const controllers_1 = require("./controllers");
const controllers_2 = require("./controllers");
const auth_1 = require("../../utils/auth");
const handleGet = async (_req, res) => res.send({ ...messages_1.messages.verifyOk, data: await (0, controllers_1.getSettings)() });
exports.handleGet = handleGet;
const handleGetRuntime = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.verifyOk,
        data: await (0, controllers_2.getRuntimeSettings)(user.role),
    });
};
exports.handleGetRuntime = handleGetRuntime;
const handleUpdate = async (req, res) => res.send({ ...messages_1.messages.updateOk, data: await (0, controllers_1.updateSettings)(req.body) });
exports.handleUpdate = handleUpdate;
