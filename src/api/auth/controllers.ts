import bcrypt from "bcrypt";
import db from "../../db";
import type {
  ProfileUpdate,
  TLogin,
  TSignup,
  TUpdate,
  UserReadRequest,
} from "./schemas";
import { sign, verify } from "jsonwebtoken";
import { usersTable } from "../../db/user";
import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { bookmarksTable, documentsTable } from "../../db/document";
import { activitiesTable } from "../../db/audit";
import {
  ConfigurationError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors";

const protectedAdminEmail = "admin@docshelf.app";

const ensureMutableUser = (email: string) => {
  if (email.toLowerCase() === protectedAdminEmail) {
    throw new ForbiddenError("The built-in administrator cannot be changed.");
  }
};

export const signup = async (data: TSignup) => {
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, data.email),
    columns: { id: true },
  });
  if (existingUser) return null;

  const password = await bcrypt.hash(data.password, 10);
  const response = await db
    .insert(usersTable)
    .values({
      username: data.username,
      email: data.email,
      password,
      role: "member",
    })
    .returning({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      role: usersTable.role,
    });

  return response[0];
};

export const login = async (data: TLogin) => {
  const user = await db.query.usersTable.findFirst({
    columns: {
      id: true,
      username: true,
      password: true,
      email: true,
      role: true,
      active: true,
    },
    where: eq(usersTable.email, data.email),
  });
  if (!user) throw new UnauthorizedError("The email or password is incorrect.");
  const password = await bcrypt.compare(data.password, user.password);
  if (!password)
    throw new UnauthorizedError("The email or password is incorrect.");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ConfigurationError("JWT_SECRET is not configured");

  if (!user.active) throw new UnauthorizedError("This account is inactive.");
  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({ lastActiveAt: new Date() })
      .where(eq(usersTable.id, user.id));
    await tx.insert(activitiesTable).values({
      userId: user.id,
      action: "login",
      description: "signed in",
      detail: "Successful password sign-in.",
    });
  });
  const token = sign(
    { id: user.id, accountType: "user", role: user.role },
    secret,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    },
  );
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
};

export const getUsers = async ({
  page,
  perPage,
  query,
  role,
  active,
  joinedAfter,
}: UserReadRequest) => {
  const where = and(
    query
      ? or(
          ilike(usersTable.username, `%${query}%`),
          ilike(usersTable.email, `%${query}%`),
        )
      : undefined,
    role ? eq(usersTable.role, role) : undefined,
    active === undefined ? undefined : eq(usersTable.active, active),
    joinedAfter
      ? gte(usersTable.createdAt, new Date(`${joinedAfter}T00:00:00Z`))
      : undefined,
  );
  const [data, [{ total }]] = await Promise.all([
    db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        active: usersTable.active,
        storageLimitMb: usersTable.storageLimitMb,
        lastActiveAt: usersTable.lastActiveAt,
        createdAt: usersTable.createdAt,
        documentCount: sql<number>`count(distinct ${documentsTable.id})::int`,
        storageBytes: sql<number>`coalesce(sum(${documentsTable.sizeBytes}), 0)::bigint`,
        bookmarks: sql<number>`count(distinct ${bookmarksTable.documentId})::int`,
      })
      .from(usersTable)
      .leftJoin(documentsTable, eq(documentsTable.uploadedById, usersTable.id))
      .leftJoin(bookmarksTable, eq(bookmarksTable.userId, usersTable.id))
      .where(where)
      .groupBy(usersTable.id)
      .orderBy(desc(usersTable.createdAt))
      .limit(perPage)
      .offset(page * perPage),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(where),
  ]);
  return { data, total };
};

export const getUserById = async (id: string) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
    columns: {
      id: true,
      username: true,
      email: true,
      role: true,
      active: true,
      storageLimitMb: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
};

export const getUserByToken = async (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ConfigurationError("JWT_SECRET is not configured");

  const payload = verify(token, secret, { algorithms: ["HS256"] });
  if (
    typeof payload === "string" ||
    typeof payload.id !== "string" ||
    payload.accountType !== "user"
  ) {
    throw new Error("Invalid token payload");
  }

  return getUserById(payload.id);
};

export const updateUser = async (data: TUpdate) => {
  const user = await db.query.usersTable.findFirst({
    columns: {
      id: true,
      password: true,
      email: true,
    },
    where: eq(usersTable.id, data.id),
  });
  if (!user) throw new NotFoundError("User not found");
  ensureMutableUser(user.email);
  let hashedPassword = null;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }
  const response = await db
    .update(usersTable)
    .set({
      ...data,
      password: hashedPassword || user.password,
    })
    .where(eq(usersTable.id, data.id))
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      role: usersTable.role,
    });
  return response[0];
};
export const deleteUser = async (id: string) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
    columns: { email: true },
  });
  if (!user) throw new NotFoundError("User not found");
  ensureMutableUser(user.email);
  const data = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      role: usersTable.role,
    });
  return data;
};

export const updateProfile = async (id: string, data: ProfileUpdate) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
    columns: { password: true, email: true },
  });
  if (!user) throw new NotFoundError("User not found");
  ensureMutableUser(user.email);

  let password = user.password;
  if (data.newPassword) {
    if (
      !data.currentPassword ||
      !(await bcrypt.compare(data.currentPassword, user.password))
    ) {
      throw new UnauthorizedError("The current password is incorrect.");
    }
    password = await bcrypt.hash(data.newPassword, 10);
  }

  const [updated] = await db
    .update(usersTable)
    .set({
      ...(data.username ? { username: data.username } : {}),
      password,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      role: usersTable.role,
      active: usersTable.active,
      createdAt: usersTable.createdAt,
    });
  return updated;
};

export const deleteOwnAccount = async (id: string, password: string) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
    columns: { password: true, email: true },
  });
  if (!user) throw new NotFoundError("User not found");
  ensureMutableUser(user.email);
  if (!(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError("The password is incorrect.");
  }

  return db.transaction(async (tx) => {
    await tx.delete(documentsTable).where(eq(documentsTable.uploadedById, id));
    const [deleted] = await tx
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });
    return deleted;
  });
};
