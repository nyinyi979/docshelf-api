import { FastifyReply } from "fastify";
import { messages } from "../messages";
import { TypeBoxRequest } from "../request";
import { idParamsSchema } from "../schemas";
import * as controller from "./controllers";
import { tagBodySchema, tagQuerySchema, updateTagBodySchema } from "./schemas";
export const handleCreate = async (
  req: TypeBoxRequest<{ body: typeof tagBodySchema }>,
  res: FastifyReply,
) =>
  res
    .code(201)
    .send({ ...messages.createOk, data: await controller.createTag(req.body) });
export const handleList = async (
  req: TypeBoxRequest<{ querystring: typeof tagQuerySchema }>,
  res: FastifyReply,
) =>
  res.send({
    ...messages.verifyOk,
    ...(await controller.getTags(req.query)),
    ...req.query,
  });
export const handleAll = async (_req: unknown, res: FastifyReply) =>
  res.send({ ...messages.verifyOk, data: await controller.getAllTags() });
export const handleUpdate = async (
  req: TypeBoxRequest<{ body: typeof updateTagBodySchema }>,
  res: FastifyReply,
) =>
  res.send({
    ...messages.updateOk,
    data: await controller.updateTag(req.body),
  });
export const handleDelete = async (
  req: TypeBoxRequest<{ params: typeof idParamsSchema }>,
  res: FastifyReply,
) =>
  res.send({
    ...messages.deleteOk,
    data: await controller.deleteTag(req.params.id),
  });
