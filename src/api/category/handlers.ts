import { FastifyReply } from "fastify";
import { TypeBoxRequest } from "../request";
import { idParamsSchema } from "../schemas";
import { messages } from "../messages";
import {
  categoryBodySchema,
  categoryQuerySchema,
  updateCategoryBodySchema,
} from "./schemas";
import * as controller from "./controllers";

export const handleCreateCategory = async (
  req: TypeBoxRequest<{ body: typeof categoryBodySchema }>,
  res: FastifyReply,
) =>
  res.code(201).send({
    ...messages.createOk,
    data: await controller.createCategory(req.body),
  });
export const handleGetCategories = async (
  req: TypeBoxRequest<{ querystring: typeof categoryQuerySchema }>,
  res: FastifyReply,
) =>
  res.send({
    ...messages.verifyOk,
    ...(await controller.getCategories(req.query)),
    ...req.query,
  });
export const handleGetAllCategories = async (
  _req: unknown,
  res: FastifyReply,
) =>
  res.send({ ...messages.verifyOk, data: await controller.getAllCategories() });
export const handleUpdateCategory = async (
  req: TypeBoxRequest<{ body: typeof updateCategoryBodySchema }>,
  res: FastifyReply,
) =>
  res.send({
    ...messages.updateOk,
    data: await controller.updateCategory(req.body),
  });
export const handleDeleteCategory = async (
  req: TypeBoxRequest<{ params: typeof idParamsSchema }>,
  res: FastifyReply,
) =>
  res.send({
    ...messages.deleteOk,
    data: await controller.deleteCategory(req.params.id),
  });
