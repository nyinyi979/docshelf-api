import { FastifyReply, FastifyRequest } from "fastify";
import { messages } from "../messages";
import {
  signup,
  login,
  deleteOwnAccount,
  getUsers,
  getUserById,
  updateProfile,
  updateUser,
  deleteUser,
} from "./controllers";
import { authenticate } from "../../utils/auth";
import { TypeBoxRequest } from "../request";
import {
  deleteAccountBodySchema,
  loginBodySchema,
  profileBodySchema,
  signupBodySchema,
  updateUserBodySchema,
} from "./schemas";
import { idParamsSchema } from "../schemas";
import { userQuerySchema } from "./schemas";

export const handleSignup = async (
  req: TypeBoxRequest<{ body: typeof signupBodySchema }>,
  res: FastifyReply,
) => {
  try {
    const data = await signup(req.body);
    if (!data) return res.status(409).send({ ...messages.duplicateEmail });
    return res.status(201).send({ ...messages.createOk, data });
  } catch (err) {
    throw err;
  }
};

export const handleLogin = async (
  req: TypeBoxRequest<{ body: typeof loginBodySchema }>,
  res: FastifyReply,
) => {
  try {
    const data = await login(req.body);
    res.code(200).send({ ...messages.verifyOk, ...data });
  } catch (err) {
    throw err;
  }
};

export const handleGetUsers = async (
  req: TypeBoxRequest<{ querystring: typeof userQuerySchema }>,
  res: FastifyReply,
) => {
  try {
    const params = req.query;
    const response = await getUsers(params);
    res.code(200).send({ ...messages.verifyOk, ...response });
  } catch (err) {
    throw err;
  }
};

export const handleGetUserById = async (
  req: TypeBoxRequest<{ params: typeof idParamsSchema }>,
  res: FastifyReply,
) => {
  try {
    const params = req.params;
    const response = await getUserById(params.id);
    res.code(200).send({ ...messages.verifyOk, data: response });
  } catch (err) {
    throw err;
  }
};

export const handleGetUserByToken = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    const data = await authenticate(req, res);
    if (!data) return;
    res.code(200).send({ ...messages.verifyOk, data });
  } catch (err) {
    throw err;
  }
};

export const handleUpdateUser = async (
  req: TypeBoxRequest<{ body: typeof updateUserBodySchema }>,
  res: FastifyReply,
) => {
  try {
    const data = await updateUser(req.body);
    res.code(200).send({ ...messages.verifyOk, data });
  } catch (err) {
    throw err;
  }
};

export const handleDeleteAdmin = async (
  req: TypeBoxRequest<{ params: typeof idParamsSchema }>,
  res: FastifyReply,
) => {
  try {
    const params = req.params;
    const data = await deleteUser(params.id);
    res.code(200).send({ ...messages.verifyOk, data });
  } catch (err) {
    throw err;
  }
};

export const handleUpdateProfile = async (
  req: TypeBoxRequest<{ body: typeof profileBodySchema }>,
  res: FastifyReply,
) => {
  const user = await authenticate(req, res);
  return res.send({
    ...messages.updateOk,
    data: await updateProfile(user.id, req.body),
  });
};

export const handleDeleteOwnAccount = async (
  req: TypeBoxRequest<{ body: typeof deleteAccountBodySchema }>,
  res: FastifyReply,
) => {
  const user = await authenticate(req, res);
  return res.send({
    ...messages.deleteOk,
    data: await deleteOwnAccount(user.id, req.body.password),
  });
};
