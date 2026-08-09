"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDashboard = void 0;
const messages_1 = require("../messages");
const controllers_1 = require("./controllers");
const handleDashboard = async (_req, res) => res.send({ ...messages_1.messages.verifyOk, data: await (0, controllers_1.getDashboard)() });
exports.handleDashboard = handleDashboard;
