import { FastifyReply } from "fastify";
import { messages } from "../messages";
import { TypeBoxRequest } from "../request";
import { getActivities } from "./controllers";
import { activityQuerySchema } from "./schemas";
import { authenticateUser } from "../../utils/auth";
export const handleList = async (
  req: TypeBoxRequest<{ querystring: typeof activityQuerySchema }>,
  res: FastifyReply,
) =>
  res.send({
    ...messages.verifyOk,
    ...(await getActivities(req.query)),
    ...req.query,
  });

export const handleMyActivity = async (
  req: TypeBoxRequest<{ querystring: typeof activityQuerySchema }>,
  res: FastifyReply,
) => {
  const user = await authenticateUser(req, res);
  return res.send({
    ...messages.verifyOk,
    ...(await getActivities({ ...req.query, userId: user.id })),
    ...req.query,
  });
};
