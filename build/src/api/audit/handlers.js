"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMyActivity = exports.handleList = void 0;
const messages_1 = require("../messages");
const controllers_1 = require("./controllers");
const auth_1 = require("../../utils/auth");
const handleList = async (req, res) => res.send({
    ...messages_1.messages.verifyOk,
    ...(await (0, controllers_1.getActivities)(req.query)),
    ...req.query,
});
exports.handleList = handleList;
const handleMyActivity = async (req, res) => {
    const user = await (0, auth_1.authenticateUser)(req, res);
    return res.send({
        ...messages_1.messages.verifyOk,
        ...(await (0, controllers_1.getActivities)({ ...req.query, userId: user.id })),
        ...req.query,
    });
};
exports.handleMyActivity = handleMyActivity;
