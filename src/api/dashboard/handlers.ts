import { FastifyReply } from "fastify";
import { messages } from "../messages";
import { getDashboard } from "./controllers";
export const handleDashboard = async (_req: unknown, res: FastifyReply) =>
  res.send({ ...messages.verifyOk, data: await getDashboard() });
