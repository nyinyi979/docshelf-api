"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileAccess = exports.setBookmark = exports.getBookmarkedDocuments = exports.deleteDocuments = exports.addVersion = exports.updateDocument = exports.getDocument = exports.getDocuments = exports.createDocument = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../db"));
const audit_1 = require("../../db/audit");
const document_1 = require("../../db/document");
const file_1 = require("../../utils/file");
const errors_1 = require("../../utils/errors");
const controllers_1 = require("../setting/controllers");
const canRead = (viewer) => viewer.role === "admin"
    ? undefined
    : (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(document_1.documentsTable.visibility, "public"), (0, drizzle_orm_1.eq)(document_1.documentsTable.uploadedById, viewer.id));
const assertFilePolicy = async (fileName, sizeBytes) => {
    var _a, _b;
    const settings = await (0, controllers_1.getSettings)();
    const extension = (_b = (_a = fileName.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "";
    const allowed = settings.storage.allowedExtensions.map((item) => item.replace(/^\./, "").toLowerCase());
    if (!allowed.includes(extension)) {
        throw new errors_1.BadRequestError(`Files with the .${extension || "unknown"} extension are not allowed.`);
    }
    if (sizeBytes > settings.storage.maxFileSizeMb * 1024 * 1024) {
        throw new errors_1.BadRequestError(`Files must be ${settings.storage.maxFileSizeMb} MB or smaller.`);
    }
};
const enrich = async (ids, viewer) => {
    if (!ids.length)
        return [];
    const rows = await db_1.default.query.documentsTable.findMany({
        where: (0, drizzle_orm_1.inArray)(document_1.documentsTable.id, ids),
        with: {
            category: true,
            uploadedBy: { columns: { id: true, username: true, email: true } },
            documentTags: { with: { tag: true } },
            versions: {
                with: { uploadedBy: { columns: { id: true, username: true } } },
                orderBy: (0, drizzle_orm_1.desc)(document_1.documentVersionsTable.versionNumber),
            },
            bookmarks: true,
        },
    });
    const map = new Map(rows.map((row) => [
        row.id,
        (() => {
            const { fileKey: _fileKey, documentTags, bookmarks, versions, ...document } = row;
            return {
                ...document,
                fileUrl: null,
                tags: documentTags.map((item) => item.tag),
                versions: versions.map(({ fileKey: _versionKey, ...version }) => ({
                    ...version,
                    fileUrl: null,
                })),
                versionCount: versions.length,
                bookmarkCount: bookmarks.filter((item) => item.active).length,
                bookmarked: bookmarks.some((item) => item.userId === viewer.id && item.active),
            };
        })(),
    ]));
    return ids.map((id) => map.get(id)).filter(Boolean);
};
const createDocument = async (data, userId, ip) => {
    var _a;
    await assertFilePolicy(data.fileName, data.sizeBytes);
    const settings = await (0, controllers_1.getSettings)();
    const promotedUrl = data.temporaryFileUrl
        ? await (0, file_1.uploadFile)(data.temporaryFileUrl, false)
        : undefined;
    const fileUrl = promotedUrl !== null && promotedUrl !== void 0 ? promotedUrl : data.fileUrl;
    const fileKey = promotedUrl !== null && promotedUrl !== void 0 ? promotedUrl : data.fileKey;
    if (!fileUrl || !fileKey) {
        throw new errors_1.BadRequestError("A temporary file URL is required.");
    }
    const { temporaryFileUrl: _temporaryFileUrl, fileUrl: _submittedFileUrl, fileKey: _submittedFileKey, ...submittedData } = data;
    const documentData = {
        ...submittedData,
        fileUrl,
        fileKey,
        visibility: (_a = data.visibility) !== null && _a !== void 0 ? _a : settings.general.defaultVisibility,
    };
    let createdDocument;
    try {
        createdDocument = await db_1.default.transaction(async (tx) => {
            const { tagIds = [], ...values } = documentData;
            const document = (await tx
                .insert(document_1.documentsTable)
                .values({
                ...values,
                uploadedById: userId,
            })
                .returning())[0];
            await tx.insert(document_1.documentVersionsTable).values({
                documentId: document.id,
                uploadedById: userId,
                versionNumber: 1,
                fileUrl,
                fileKey,
                fileName: data.fileName,
                mimeType: data.mimeType,
                sizeBytes: data.sizeBytes,
            });
            if (tagIds.length)
                await tx
                    .insert(document_1.documentTagsTable)
                    .values(tagIds.map((tagId) => ({ documentId: document.id, tagId })));
            await tx.insert(audit_1.activitiesTable).values({
                userId,
                documentId: document.id,
                action: "upload",
                description: "uploaded a new document",
                detail: `${data.fileName} (${data.sizeBytes} bytes)`,
                ip,
            });
            return (await enrich([document.id], { id: userId, role: "member" }))[0];
        });
    }
    catch (error) {
        if (promotedUrl)
            await (0, file_1.removeFile)(promotedUrl);
        throw error;
    }
    if (data.temporaryFileUrl) {
        try {
            (0, file_1.removeTemporaryFile)(data.temporaryFileUrl);
        }
        catch {
            // The document is durable; stale temporary-file cleanup is best effort.
        }
    }
    return createdDocument;
};
exports.createDocument = createDocument;
const getDocuments = async (query, viewer) => {
    const filters = (0, drizzle_orm_1.and)(canRead(viewer), query.query
        ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(document_1.documentsTable.title, `%${query.query}%`), (0, drizzle_orm_1.ilike)(document_1.documentsTable.description, `%${query.query}%`))
        : undefined, query.categoryId
        ? (0, drizzle_orm_1.eq)(document_1.documentsTable.categoryId, query.categoryId)
        : undefined, query.fileType ? (0, drizzle_orm_1.eq)(document_1.documentsTable.fileType, query.fileType) : undefined, query.visibility
        ? (0, drizzle_orm_1.eq)(document_1.documentsTable.visibility, query.visibility)
        : undefined, query.status ? (0, drizzle_orm_1.eq)(document_1.documentsTable.status, query.status) : undefined, query.uploadedById
        ? (0, drizzle_orm_1.eq)(document_1.documentsTable.uploadedById, query.uploadedById)
        : undefined);
    const sort = query.sortBy === "title"
        ? document_1.documentsTable.title
        : query.sortBy === "sizeBytes"
            ? document_1.documentsTable.sizeBytes
            : document_1.documentsTable.createdAt;
    const [rows, [{ total }]] = await Promise.all([
        db_1.default
            .select({ id: document_1.documentsTable.id })
            .from(document_1.documentsTable)
            .where(filters)
            .orderBy(query.orderBy === "asc" ? (0, drizzle_orm_1.asc)(sort) : (0, drizzle_orm_1.desc)(sort))
            .limit(query.perPage)
            .offset(query.page * query.perPage),
        db_1.default
            .select({ total: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(document_1.documentsTable)
            .where(filters),
    ]);
    return {
        data: await enrich(rows.map((row) => row.id), viewer),
        total,
    };
};
exports.getDocuments = getDocuments;
const getDocument = async (id, viewer) => {
    const visible = await db_1.default.query.documentsTable.findFirst({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(document_1.documentsTable.id, id), canRead(viewer)),
        columns: { id: true },
    });
    if (!visible)
        throw new errors_1.NotFoundError("Document not found");
    const row = (await enrich([id], viewer))[0];
    if (!row)
        throw new errors_1.NotFoundError("Document not found");
    return row;
};
exports.getDocument = getDocument;
const assertCanManage = async (id, viewer) => {
    const document = await db_1.default.query.documentsTable.findFirst({
        where: (0, drizzle_orm_1.eq)(document_1.documentsTable.id, id),
        columns: { id: true, uploadedById: true },
    });
    if (!document)
        throw new errors_1.NotFoundError("Document not found");
    if (viewer.role !== "admin" && document.uploadedById !== viewer.id) {
        throw new errors_1.ForbiddenError();
    }
    return document;
};
const updateDocument = async ({ id, tagIds, ...data }, viewer) => db_1.default.transaction(async (tx) => {
    await assertCanManage(id, viewer);
    const row = (await tx
        .update(document_1.documentsTable)
        .set({ ...data, updatedAt: new Date() })
        .where((0, drizzle_orm_1.eq)(document_1.documentsTable.id, id))
        .returning())[0];
    if (!row)
        throw new errors_1.NotFoundError("Document not found");
    if (tagIds) {
        await tx
            .delete(document_1.documentTagsTable)
            .where((0, drizzle_orm_1.eq)(document_1.documentTagsTable.documentId, id));
        if (tagIds.length)
            await tx
                .insert(document_1.documentTagsTable)
                .values(tagIds.map((tagId) => ({ documentId: id, tagId })));
    }
    return (await enrich([id], viewer))[0];
});
exports.updateDocument = updateDocument;
const addVersion = async (documentId, data, viewer, ip) => {
    await assertFilePolicy(data.fileName, data.sizeBytes);
    return db_1.default.transaction(async (tx) => {
        await assertCanManage(documentId, viewer);
        const existing = await tx.query.documentsTable.findFirst({
            where: (0, drizzle_orm_1.eq)(document_1.documentsTable.id, documentId),
            with: { versions: true },
        });
        if (!existing)
            throw new errors_1.NotFoundError("Document not found");
        const next = Math.max(0, ...existing.versions.map((item) => item.versionNumber)) + 1;
        await tx.insert(document_1.documentVersionsTable).values({
            documentId,
            uploadedById: viewer.id,
            versionNumber: next,
            fileUrl: data.fileUrl,
            fileKey: data.fileKey,
            fileName: data.fileName,
            mimeType: data.mimeType,
            sizeBytes: data.sizeBytes,
        });
        await tx
            .update(document_1.documentsTable)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(document_1.documentsTable.id, documentId));
        await tx.insert(audit_1.activitiesTable).values({
            userId: viewer.id,
            documentId,
            action: "version",
            description: "added a new version",
            detail: `Version ${next}: ${data.fileName}`,
            ip,
        });
        return (await enrich([documentId], viewer))[0];
    });
};
exports.addVersion = addVersion;
const deleteDocuments = async (ids, viewer, ip) => {
    const [canDeleteAny, canDeleteOwn] = await Promise.all([
        (0, controllers_1.hasPermission)(viewer.role, "delete_any"),
        (0, controllers_1.hasPermission)(viewer.role, "delete_own"),
    ]);
    if (!canDeleteAny && !canDeleteOwn)
        throw new errors_1.ForbiddenError();
    return db_1.default.transaction(async (tx) => {
        if (!canDeleteAny) {
            const owned = await tx
                .select({ id: document_1.documentsTable.id })
                .from(document_1.documentsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(document_1.documentsTable.id, ids), (0, drizzle_orm_1.eq)(document_1.documentsTable.uploadedById, viewer.id)));
            if (owned.length !== ids.length)
                throw new errors_1.ForbiddenError();
        }
        const existing = await tx
            .select({ id: document_1.documentsTable.id, title: document_1.documentsTable.title })
            .from(document_1.documentsTable)
            .where((0, drizzle_orm_1.inArray)(document_1.documentsTable.id, ids));
        if (existing.length)
            await tx.insert(audit_1.activitiesTable).values(existing.map((item) => ({
                userId: viewer.id,
                action: "delete",
                description: "deleted a document",
                detail: item.title,
                ip,
                metadata: { documentId: item.id },
            })));
        await tx.delete(document_1.documentsTable).where((0, drizzle_orm_1.inArray)(document_1.documentsTable.id, ids));
        return existing;
    });
};
exports.deleteDocuments = deleteDocuments;
const getBookmarkedDocuments = async (query, viewer) => {
    const bookmarkRows = await db_1.default
        .select({ id: document_1.bookmarksTable.documentId })
        .from(document_1.bookmarksTable)
        .innerJoin(document_1.documentsTable, (0, drizzle_orm_1.eq)(document_1.bookmarksTable.documentId, document_1.documentsTable.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(document_1.bookmarksTable.userId, viewer.id), (0, drizzle_orm_1.eq)(document_1.bookmarksTable.active, true), canRead(viewer)))
        .orderBy((0, drizzle_orm_1.desc)(document_1.bookmarksTable.createdAt))
        .limit(query.perPage)
        .offset(query.page * query.perPage);
    const total = await db_1.default.$count(document_1.bookmarksTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(document_1.bookmarksTable.userId, viewer.id), (0, drizzle_orm_1.eq)(document_1.bookmarksTable.active, true)));
    return {
        data: await enrich(bookmarkRows.map((row) => row.id), viewer),
        total,
    };
};
exports.getBookmarkedDocuments = getBookmarkedDocuments;
const setBookmark = async (documentId, bookmarked, viewer) => {
    await (0, exports.getDocument)(documentId, viewer);
    await db_1.default
        .insert(document_1.bookmarksTable)
        .values({ documentId, userId: viewer.id, active: bookmarked })
        .onConflictDoUpdate({
        target: [document_1.bookmarksTable.userId, document_1.bookmarksTable.documentId],
        set: { active: bookmarked, createdAt: new Date() },
    });
    return { documentId, bookmarked };
};
exports.setBookmark = setBookmark;
const getFileAccess = async (documentId, viewer, versionId) => {
    await (0, exports.getDocument)(documentId, viewer);
    if (versionId) {
        const version = await db_1.default.query.documentVersionsTable.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(document_1.documentVersionsTable.id, versionId), (0, drizzle_orm_1.eq)(document_1.documentVersionsTable.documentId, documentId)),
        });
        if (!version)
            throw new errors_1.NotFoundError("Document version not found");
        return (0, file_1.createPresignedFileUrl)(version.fileKey, version.fileName);
    }
    const document = await db_1.default.query.documentsTable.findFirst({
        where: (0, drizzle_orm_1.eq)(document_1.documentsTable.id, documentId),
        columns: { fileKey: true, fileName: true },
    });
    if (!document)
        throw new errors_1.NotFoundError("Document not found");
    return (0, file_1.createPresignedFileUrl)(document.fileKey, document.fileName);
};
exports.getFileAccess = getFileAccess;
