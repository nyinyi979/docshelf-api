import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authenticate } from "../../utils/auth";
import {
  handleDeleteOwnAccount,
  handleGetUserByToken,
  handleLogin,
  handleSignup,
  handleUpdateProfile,
} from "./handlers";
import {
  deleteAccountBodySchema,
  loginBodySchema,
  profileBodySchema,
  signupBodySchema,
} from "./schemas";
const routes: FastifyPluginAsyncTypebox = async (app) => {
  app.post(
    "/login",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Log in",
        body: loginBodySchema,
      },
    },
    handleLogin,
  );
  app.post(
    "/register",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Create a member account",
        body: signupBodySchema,
      },
    },
    handleSignup,
  );
  app.get(
    "/me",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Authentication"],
        summary: "Get the current user",
        security: [{ accessToken: [] }],
      },
    },
    handleGetUserByToken,
  );
  app.put(
    "/me",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Authentication"],
        summary: "Update the current user's profile",
        security: [{ accessToken: [] }],
        body: profileBodySchema,
      },
    },
    handleUpdateProfile,
  );
  app.delete(
    "/me",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Authentication"],
        summary: "Delete the current user's account",
        security: [{ accessToken: [] }],
        body: deleteAccountBodySchema,
      },
    },
    handleDeleteOwnAccount,
  );
};
export default routes;
