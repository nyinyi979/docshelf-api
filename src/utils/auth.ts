import { FastifyReply, FastifyRequest } from "fastify";
import { getUserByToken } from "../api/auth/controllers";
import { AppError, ForbiddenError, UnauthorizedError } from "./errors";
import { hasPermission, type PermissionKey } from "../api/setting/controllers";

const getAccessToken = (req: FastifyRequest) => {
  const token = req.headers["x-access-token"];
  if (!token || typeof token !== "string") throw new UnauthorizedError();
  return token;
};

const rethrowServerError = (error: unknown) => {
  if (error instanceof AppError && error.statusCode >= 500) throw error;
};

export const authenticate = async function (
  req: FastifyRequest,
  _res: FastifyReply,
) {
  try {
    return await getUserByToken(getAccessToken(req));
  } catch (error) {
    rethrowServerError(error);
    throw new UnauthorizedError();
  }
};

export const authenticateAdmin = async function (
  req: FastifyRequest,
  _res: FastifyReply,
) {
  try {
    const user = await getUserByToken(getAccessToken(req));
    if (user.role !== "admin") throw new ForbiddenError();
    return user;
  } catch (error) {
    rethrowServerError(error);
    if (error instanceof ForbiddenError) throw error;
    throw new UnauthorizedError();
  }
};

export const authenticateUser = async function (
  req: FastifyRequest,
  _res: FastifyReply,
) {
  try {
    return await getUserByToken(getAccessToken(req));
  } catch (error) {
    rethrowServerError(error);
    throw new UnauthorizedError();
  }
};

export const authorizePermission = (permission: PermissionKey) =>
  async function (req: FastifyRequest, res: FastifyReply) {
    const user = await authenticateUser(req, res);
    if (!(await hasPermission(user.role, permission))) {
      throw new ForbiddenError();
    }
    return user;
  };
