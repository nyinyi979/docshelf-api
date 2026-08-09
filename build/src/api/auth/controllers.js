"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOwnAccount = exports.updateProfile = exports.deleteUser = exports.updateUser = exports.getUserByToken = exports.getUserById = exports.getUsers = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../../db"));
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("../../db/user");
const drizzle_orm_1 = require("drizzle-orm");
const document_1 = require("../../db/document");
const audit_1 = require("../../db/audit");
const errors_1 = require("../../utils/errors");
const protectedAdminEmail = "admin@docshelf.app";
const ensureMutableUser = (email) => {
    if (email.toLowerCase() === protectedAdminEmail) {
        throw new errors_1.ForbiddenError("The built-in administrator cannot be changed.");
    }
};
const signup = async (data) => {
    const existingUser = await db_1.default.query.usersTable.findFirst({
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.email, data.email),
        columns: { id: true },
    });
    if (existingUser)
        return null;
    const password = await bcrypt_1.default.hash(data.password, 10);
    const response = await db_1.default
        .insert(user_1.usersTable)
        .values({
        username: data.username,
        email: data.email,
        password,
        role: "member",
    })
        .returning({
        id: user_1.usersTable.id,
        username: user_1.usersTable.username,
        email: user_1.usersTable.email,
        role: user_1.usersTable.role,
    });
    return response[0];
};
exports.signup = signup;
const login = async (data) => {
    const user = await db_1.default.query.usersTable.findFirst({
        columns: {
            id: true,
            username: true,
            password: true,
            email: true,
            role: true,
            active: true,
        },
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.email, data.email),
    });
    if (!user)
        throw new errors_1.UnauthorizedError("The email or password is incorrect.");
    const password = await bcrypt_1.default.compare(data.password, user.password);
    if (!password)
        throw new errors_1.UnauthorizedError("The email or password is incorrect.");
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new errors_1.ConfigurationError("JWT_SECRET is not configured");
    if (!user.active)
        throw new errors_1.UnauthorizedError("This account is inactive.");
    await db_1.default.transaction(async (tx) => {
        await tx
            .update(user_1.usersTable)
            .set({ lastActiveAt: new Date() })
            .where((0, drizzle_orm_1.eq)(user_1.usersTable.id, user.id));
        await tx.insert(audit_1.activitiesTable).values({
            userId: user.id,
            action: "login",
            description: "signed in",
            detail: "Successful password sign-in.",
        });
    });
    const token = (0, jsonwebtoken_1.sign)({ id: user.id, accountType: "user", role: user.role }, secret, {
        algorithm: "HS256",
        expiresIn: "7d",
    });
    const { password: _password, ...safeUser } = user;
    return { user: safeUser, token };
};
exports.login = login;
const getUsers = async ({ page, perPage, query, role, active, joinedAfter, }) => {
    const where = (0, drizzle_orm_1.and)(query
        ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(user_1.usersTable.username, `%${query}%`), (0, drizzle_orm_1.ilike)(user_1.usersTable.email, `%${query}%`))
        : undefined, role ? (0, drizzle_orm_1.eq)(user_1.usersTable.role, role) : undefined, active === undefined ? undefined : (0, drizzle_orm_1.eq)(user_1.usersTable.active, active), joinedAfter
        ? (0, drizzle_orm_1.gte)(user_1.usersTable.createdAt, new Date(`${joinedAfter}T00:00:00Z`))
        : undefined);
    const [data, [{ total }]] = await Promise.all([
        db_1.default
            .select({
            id: user_1.usersTable.id,
            username: user_1.usersTable.username,
            email: user_1.usersTable.email,
            role: user_1.usersTable.role,
            active: user_1.usersTable.active,
            storageLimitMb: user_1.usersTable.storageLimitMb,
            lastActiveAt: user_1.usersTable.lastActiveAt,
            createdAt: user_1.usersTable.createdAt,
            documentCount: (0, drizzle_orm_1.sql) `count(distinct ${document_1.documentsTable.id})::int`,
            storageBytes: (0, drizzle_orm_1.sql) `coalesce(sum(${document_1.documentsTable.sizeBytes}), 0)::bigint`,
            bookmarks: (0, drizzle_orm_1.sql) `count(distinct ${document_1.bookmarksTable.documentId})::int`,
        })
            .from(user_1.usersTable)
            .leftJoin(document_1.documentsTable, (0, drizzle_orm_1.eq)(document_1.documentsTable.uploadedById, user_1.usersTable.id))
            .leftJoin(document_1.bookmarksTable, (0, drizzle_orm_1.eq)(document_1.bookmarksTable.userId, user_1.usersTable.id))
            .where(where)
            .groupBy(user_1.usersTable.id)
            .orderBy((0, drizzle_orm_1.desc)(user_1.usersTable.createdAt))
            .limit(perPage)
            .offset(page * perPage),
        db_1.default
            .select({ total: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(user_1.usersTable)
            .where(where),
    ]);
    return { data, total };
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    const user = await db_1.default.query.usersTable.findFirst({
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.id, id),
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
    if (!user)
        throw new errors_1.NotFoundError("User not found");
    return user;
};
exports.getUserById = getUserById;
const getUserByToken = async (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new errors_1.ConfigurationError("JWT_SECRET is not configured");
    const payload = (0, jsonwebtoken_1.verify)(token, secret, { algorithms: ["HS256"] });
    if (typeof payload === "string" ||
        typeof payload.id !== "string" ||
        payload.accountType !== "user") {
        throw new Error("Invalid token payload");
    }
    return (0, exports.getUserById)(payload.id);
};
exports.getUserByToken = getUserByToken;
const updateUser = async (data) => {
    const user = await db_1.default.query.usersTable.findFirst({
        columns: {
            id: true,
            password: true,
            email: true,
        },
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.id, data.id),
    });
    if (!user)
        throw new errors_1.NotFoundError("User not found");
    ensureMutableUser(user.email);
    let hashedPassword = null;
    if (data.password) {
        hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    }
    const response = await db_1.default
        .update(user_1.usersTable)
        .set({
        ...data,
        password: hashedPassword || user.password,
    })
        .where((0, drizzle_orm_1.eq)(user_1.usersTable.id, data.id))
        .returning({
        id: user_1.usersTable.id,
        email: user_1.usersTable.email,
        role: user_1.usersTable.role,
    });
    return response[0];
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const user = await db_1.default.query.usersTable.findFirst({
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.id, id),
        columns: { email: true },
    });
    if (!user)
        throw new errors_1.NotFoundError("User not found");
    ensureMutableUser(user.email);
    const data = await db_1.default
        .delete(user_1.usersTable)
        .where((0, drizzle_orm_1.eq)(user_1.usersTable.id, id))
        .returning({
        id: user_1.usersTable.id,
        username: user_1.usersTable.username,
        email: user_1.usersTable.email,
        role: user_1.usersTable.role,
    });
    return data;
};
exports.deleteUser = deleteUser;
const updateProfile = async (id, data) => {
    const user = await db_1.default.query.usersTable.findFirst({
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.id, id),
        columns: { password: true, email: true },
    });
    if (!user)
        throw new errors_1.NotFoundError("User not found");
    ensureMutableUser(user.email);
    let password = user.password;
    if (data.newPassword) {
        if (!data.currentPassword ||
            !(await bcrypt_1.default.compare(data.currentPassword, user.password))) {
            throw new errors_1.UnauthorizedError("The current password is incorrect.");
        }
        password = await bcrypt_1.default.hash(data.newPassword, 10);
    }
    const [updated] = await db_1.default
        .update(user_1.usersTable)
        .set({
        ...(data.username ? { username: data.username } : {}),
        password,
        updatedAt: new Date(),
    })
        .where((0, drizzle_orm_1.eq)(user_1.usersTable.id, id))
        .returning({
        id: user_1.usersTable.id,
        username: user_1.usersTable.username,
        email: user_1.usersTable.email,
        role: user_1.usersTable.role,
        active: user_1.usersTable.active,
        createdAt: user_1.usersTable.createdAt,
    });
    return updated;
};
exports.updateProfile = updateProfile;
const deleteOwnAccount = async (id, password) => {
    const user = await db_1.default.query.usersTable.findFirst({
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.id, id),
        columns: { password: true, email: true },
    });
    if (!user)
        throw new errors_1.NotFoundError("User not found");
    ensureMutableUser(user.email);
    if (!(await bcrypt_1.default.compare(password, user.password))) {
        throw new errors_1.UnauthorizedError("The password is incorrect.");
    }
    return db_1.default.transaction(async (tx) => {
        await tx.delete(document_1.documentsTable).where((0, drizzle_orm_1.eq)(document_1.documentsTable.uploadedById, id));
        const [deleted] = await tx
            .delete(user_1.usersTable)
            .where((0, drizzle_orm_1.eq)(user_1.usersTable.id, id))
            .returning({ id: user_1.usersTable.id });
        return deleted;
    });
};
exports.deleteOwnAccount = deleteOwnAccount;
