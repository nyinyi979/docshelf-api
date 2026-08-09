"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeleteOwnAccount = exports.handleUpdateProfile = exports.handleDeleteAdmin = exports.handleUpdateUser = exports.handleGetUserByToken = exports.handleGetUserById = exports.handleGetUsers = exports.handleLogin = exports.handleSignup = void 0;
const messages_1 = require("../messages");
const controllers_1 = require("./controllers");
const auth_1 = require("../../utils/auth");
const handleSignup = async (req, res) => {
    try {
        const data = await (0, controllers_1.signup)(req.body);
        if (!data)
            return res.status(409).send({ ...messages_1.messages.duplicateEmail });
        return res.status(201).send({ ...messages_1.messages.createOk, data });
    }
    catch (err) {
        throw err;
    }
};
exports.handleSignup = handleSignup;
const handleLogin = async (req, res) => {
    try {
        const data = await (0, controllers_1.login)(req.body);
        res.code(200).send({ ...messages_1.messages.verifyOk, ...data });
    }
    catch (err) {
        throw err;
    }
};
exports.handleLogin = handleLogin;
const handleGetUsers = async (req, res) => {
    try {
        const params = req.query;
        const response = await (0, controllers_1.getUsers)(params);
        res.code(200).send({ ...messages_1.messages.verifyOk, ...response });
    }
    catch (err) {
        throw err;
    }
};
exports.handleGetUsers = handleGetUsers;
const handleGetUserById = async (req, res) => {
    try {
        const params = req.params;
        const response = await (0, controllers_1.getUserById)(params.id);
        res.code(200).send({ ...messages_1.messages.verifyOk, data: response });
    }
    catch (err) {
        throw err;
    }
};
exports.handleGetUserById = handleGetUserById;
const handleGetUserByToken = async (req, res) => {
    try {
        const data = await (0, auth_1.authenticate)(req, res);
        if (!data)
            return;
        res.code(200).send({ ...messages_1.messages.verifyOk, data });
    }
    catch (err) {
        throw err;
    }
};
exports.handleGetUserByToken = handleGetUserByToken;
const handleUpdateUser = async (req, res) => {
    try {
        const data = await (0, controllers_1.updateUser)(req.body);
        res.code(200).send({ ...messages_1.messages.verifyOk, data });
    }
    catch (err) {
        throw err;
    }
};
exports.handleUpdateUser = handleUpdateUser;
const handleDeleteAdmin = async (req, res) => {
    try {
        const params = req.params;
        const data = await (0, controllers_1.deleteUser)(params.id);
        res.code(200).send({ ...messages_1.messages.verifyOk, data });
    }
    catch (err) {
        throw err;
    }
};
exports.handleDeleteAdmin = handleDeleteAdmin;
const handleUpdateProfile = async (req, res) => {
    const user = await (0, auth_1.authenticate)(req, res);
    return res.send({
        ...messages_1.messages.updateOk,
        data: await (0, controllers_1.updateProfile)(user.id, req.body),
    });
};
exports.handleUpdateProfile = handleUpdateProfile;
const handleDeleteOwnAccount = async (req, res) => {
    const user = await (0, auth_1.authenticate)(req, res);
    return res.send({
        ...messages_1.messages.deleteOk,
        data: await (0, controllers_1.deleteOwnAccount)(user.id, req.body.password),
    });
};
exports.handleDeleteOwnAccount = handleDeleteOwnAccount;
