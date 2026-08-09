import { FastifyReply, FastifyRequest } from "fastify";
import { messages } from "../messages";
import { TypeBoxRequest } from "../request";
import { getSettings, updateSettings } from "./controllers";
import { getRuntimeSettings } from "./controllers";
import { authenticateUser } from "../../utils/auth";
import { settingsBodySchema } from "./schemas";
export const handleGet = async (_req: unknown, res: FastifyReply) =>
  res.send({ ...messages.verifyOk, data: await getSettings() });
export const handleGetRuntime = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.verifyOk,
    data: await getRuntimeSettings(user.role),
  });
};
export const handleUpdate = async (
  req: TypeBoxRequest<{ body: typeof settingsBodySchema }>,
  res: FastifyReply,
) => res.send({ ...messages.updateOk, data: await updateSettings(req.body) });
