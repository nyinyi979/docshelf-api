import { FastifyReply } from "fastify";
import { authenticateUser } from "../../utils/auth";
import { messages } from "../messages";
import { TypeBoxRequest } from "../request";
import { idParamsSchema } from "../schemas";
import * as controller from "./controllers";
import {
  bulkDeleteBodySchema,
  bookmarkBodySchema,
  documentBodySchema,
  documentQuerySchema,
  accessUrlQuerySchema,
  updateDocumentBodySchema,
  versionBodySchema,
} from "./schemas";
const ip = (req: { ip: string }) => req.ip;
export const handleCreate = async (
  req: TypeBoxRequest<{ body: typeof documentBodySchema }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.code(201).send({
    ...messages.createOk,
    data: await controller.createDocument(req.body, user.id, ip(req)),
  });
};
export const handleList = async (
  req: TypeBoxRequest<{ querystring: typeof documentQuerySchema }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.verifyOk,
    ...(await controller.getDocuments(req.query, user)),
    ...req.query,
  });
};
export const handleGet = async (
  req: TypeBoxRequest<{ params: typeof idParamsSchema }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.verifyOk,
    data: await controller.getDocument(req.params.id, user),
  });
};
export const handleUpdate = async (
  req: TypeBoxRequest<{ body: typeof updateDocumentBodySchema }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.updateOk,
    data: await controller.updateDocument(req.body, user),
  });
};
export const handleVersion = async (
  req: TypeBoxRequest<{
    params: typeof idParamsSchema;
    body: typeof versionBodySchema;
  }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.code(201).send({
    ...messages.createOk,
    data: await controller.addVersion(req.params.id, req.body, user, ip(req)),
  });
};
export const handleDelete = async (
  req: TypeBoxRequest<{ params: typeof idParamsSchema }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.deleteOk,
    data: await controller.deleteDocuments([req.params.id], user, ip(req)),
  });
};
export const handleBulkDelete = async (
  req: TypeBoxRequest<{ body: typeof bulkDeleteBodySchema }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.deleteOk,
    data: await controller.deleteDocuments(req.body.ids, user, ip(req)),
  });
};

export const handleBookmarks = async (
  req: TypeBoxRequest<{ querystring: typeof documentQuerySchema }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.verifyOk,
    ...(await controller.getBookmarkedDocuments(req.query, user)),
    ...req.query,
  });
};

export const handleBookmark = async (
  req: TypeBoxRequest<{
    params: typeof idParamsSchema;
    body: typeof bookmarkBodySchema;
  }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.updateOk,
    data: await controller.setBookmark(
      req.params.id,
      req.body.bookmarked,
      user,
    ),
  });
};

export const handleAccessUrl = async (
  req: TypeBoxRequest<{
    params: typeof idParamsSchema;
    querystring: typeof accessUrlQuerySchema;
  }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.verifyOk,
    data: await controller.getFileAccess(
      req.params.id,
      user,
      req.query.versionId,
    ),
  });
};
