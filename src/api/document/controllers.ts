import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import db from "../../db";
import { activitiesTable } from "../../db/audit";
import {
  bookmarksTable,
  documentTagsTable,
  documentsTable,
  documentVersionsTable,
} from "../../db/document";
import {
  createPresignedFileUrl,
  removeFile,
  removeTemporaryFile,
  uploadFile as promoteTemporaryFile,
} from "../../utils/file";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors";
import { getSettings, hasPermission } from "../setting/controllers";
import type {
  DocumentCreate,
  DocumentQuery,
  DocumentUpdate,
  VersionCreate,
} from "./schemas";

export interface DocumentViewer {
  id: string;
  role: "admin" | "member";
}

const canRead = (viewer: DocumentViewer) =>
  viewer.role === "admin"
    ? undefined
    : or(
        eq(documentsTable.visibility, "public"),
        eq(documentsTable.uploadedById, viewer.id),
      );

const assertFilePolicy = async (fileName: string, sizeBytes: number) => {
  const settings = await getSettings();
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const allowed = settings.storage.allowedExtensions.map((item) =>
    item.replace(/^\./, "").toLowerCase(),
  );
  if (!allowed.includes(extension)) {
    throw new BadRequestError(
      `Files with the .${extension || "unknown"} extension are not allowed.`,
    );
  }
  if (sizeBytes > settings.storage.maxFileSizeMb * 1024 * 1024) {
    throw new BadRequestError(
      `Files must be ${settings.storage.maxFileSizeMb} MB or smaller.`,
    );
  }
};

const enrich = async (ids: string[], viewer: DocumentViewer) => {
  if (!ids.length) return [];
  const rows = await db.query.documentsTable.findMany({
    where: inArray(documentsTable.id, ids),
    with: {
      category: true,
      uploadedBy: { columns: { id: true, username: true, email: true } },
      documentTags: { with: { tag: true } },
      versions: {
        with: { uploadedBy: { columns: { id: true, username: true } } },
        orderBy: desc(documentVersionsTable.versionNumber),
      },
      bookmarks: true,
    },
  });
  const map = new Map(
    rows.map((row) => [
      row.id,
      (() => {
        const {
          fileKey: _fileKey,
          documentTags,
          bookmarks,
          versions,
          ...document
        } = row;
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
          bookmarked: bookmarks.some(
            (item) => item.userId === viewer.id && item.active,
          ),
        };
      })(),
    ]),
  );
  return ids.map((id) => map.get(id)).filter(Boolean);
};

export const createDocument = async (
  data: DocumentCreate,
  userId: string,
  ip?: string,
) => {
  await assertFilePolicy(data.fileName, data.sizeBytes);
  const settings = await getSettings();
  const promotedUrl = data.temporaryFileUrl
    ? await promoteTemporaryFile(data.temporaryFileUrl, false)
    : undefined;
  const fileUrl = promotedUrl ?? data.fileUrl;
  const fileKey = promotedUrl ?? data.fileKey;
  if (!fileUrl || !fileKey) {
    throw new BadRequestError("A temporary file URL is required.");
  }
  const {
    temporaryFileUrl: _temporaryFileUrl,
    fileUrl: _submittedFileUrl,
    fileKey: _submittedFileKey,
    ...submittedData
  } = data;
  const documentData = {
    ...submittedData,
    fileUrl,
    fileKey,
    visibility: data.visibility ?? settings.general.defaultVisibility,
  };
  let createdDocument;
  try {
    createdDocument = await db.transaction(async (tx) => {
      const { tagIds = [], ...values } = documentData;
      const document = (
        await tx
          .insert(documentsTable)
          .values({
            ...values,
            uploadedById: userId,
          })
          .returning()
      )[0];
      await tx.insert(documentVersionsTable).values({
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
          .insert(documentTagsTable)
          .values(tagIds.map((tagId) => ({ documentId: document.id, tagId })));
      await tx.insert(activitiesTable).values({
        userId,
        documentId: document.id,
        action: "upload",
        description: "uploaded a new document",
        detail: `${data.fileName} (${data.sizeBytes} bytes)`,
        ip,
      });
      return (await enrich([document.id], { id: userId, role: "member" }))[0];
    });
  } catch (error) {
    if (promotedUrl) await removeFile(promotedUrl);
    throw error;
  }
  if (data.temporaryFileUrl) {
    try {
      removeTemporaryFile(data.temporaryFileUrl);
    } catch {
      // The document is durable; stale temporary-file cleanup is best effort.
    }
  }
  return createdDocument;
};

export const getDocuments = async (
  query: DocumentQuery,
  viewer: DocumentViewer,
) => {
  const filters = and(
    canRead(viewer),
    query.query
      ? or(
          ilike(documentsTable.title, `%${query.query}%`),
          ilike(documentsTable.description, `%${query.query}%`),
        )
      : undefined,
    query.categoryId
      ? eq(documentsTable.categoryId, query.categoryId)
      : undefined,
    query.fileType ? eq(documentsTable.fileType, query.fileType) : undefined,
    query.visibility
      ? eq(documentsTable.visibility, query.visibility)
      : undefined,
    query.status ? eq(documentsTable.status, query.status) : undefined,
    query.uploadedById
      ? eq(documentsTable.uploadedById, query.uploadedById)
      : undefined,
  );
  const sort =
    query.sortBy === "title"
      ? documentsTable.title
      : query.sortBy === "sizeBytes"
        ? documentsTable.sizeBytes
        : documentsTable.createdAt;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ id: documentsTable.id })
      .from(documentsTable)
      .where(filters)
      .orderBy(query.orderBy === "asc" ? asc(sort) : desc(sort))
      .limit(query.perPage)
      .offset(query.page * query.perPage),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(documentsTable)
      .where(filters),
  ]);
  return {
    data: await enrich(
      rows.map((row) => row.id),
      viewer,
    ),
    total,
  };
};

export const getDocument = async (id: string, viewer: DocumentViewer) => {
  const visible = await db.query.documentsTable.findFirst({
    where: and(eq(documentsTable.id, id), canRead(viewer)),
    columns: { id: true },
  });
  if (!visible) throw new NotFoundError("Document not found");
  const row = (await enrich([id], viewer))[0];
  if (!row) throw new NotFoundError("Document not found");
  return row;
};

const assertCanManage = async (id: string, viewer: DocumentViewer) => {
  const document = await db.query.documentsTable.findFirst({
    where: eq(documentsTable.id, id),
    columns: { id: true, uploadedById: true },
  });
  if (!document) throw new NotFoundError("Document not found");
  if (viewer.role !== "admin" && document.uploadedById !== viewer.id) {
    throw new ForbiddenError();
  }
  return document;
};

export const updateDocument = async (
  { id, tagIds, ...data }: DocumentUpdate,
  viewer: DocumentViewer,
) =>
  db.transaction(async (tx) => {
    await assertCanManage(id, viewer);
    const row = (
      await tx
        .update(documentsTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(documentsTable.id, id))
        .returning()
    )[0];
    if (!row) throw new NotFoundError("Document not found");
    if (tagIds) {
      await tx
        .delete(documentTagsTable)
        .where(eq(documentTagsTable.documentId, id));
      if (tagIds.length)
        await tx
          .insert(documentTagsTable)
          .values(tagIds.map((tagId) => ({ documentId: id, tagId })));
    }
    return (await enrich([id], viewer))[0];
  });

export const addVersion = async (
  documentId: string,
  data: VersionCreate,
  viewer: DocumentViewer,
  ip?: string,
) => {
  await assertFilePolicy(data.fileName, data.sizeBytes);
  return db.transaction(async (tx) => {
    await assertCanManage(documentId, viewer);
    const existing = await tx.query.documentsTable.findFirst({
      where: eq(documentsTable.id, documentId),
      with: { versions: true },
    });
    if (!existing) throw new NotFoundError("Document not found");
    const next =
      Math.max(0, ...existing.versions.map((item) => item.versionNumber)) + 1;
    await tx.insert(documentVersionsTable).values({
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
      .update(documentsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documentsTable.id, documentId));
    await tx.insert(activitiesTable).values({
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

export const deleteDocuments = async (
  ids: string[],
  viewer: DocumentViewer,
  ip?: string,
) => {
  const [canDeleteAny, canDeleteOwn] = await Promise.all([
    hasPermission(viewer.role, "delete_any"),
    hasPermission(viewer.role, "delete_own"),
  ]);
  if (!canDeleteAny && !canDeleteOwn) throw new ForbiddenError();
  return db.transaction(async (tx) => {
    if (!canDeleteAny) {
      const owned = await tx
        .select({ id: documentsTable.id })
        .from(documentsTable)
        .where(
          and(
            inArray(documentsTable.id, ids),
            eq(documentsTable.uploadedById, viewer.id),
          ),
        );
      if (owned.length !== ids.length) throw new ForbiddenError();
    }
    const existing = await tx
      .select({ id: documentsTable.id, title: documentsTable.title })
      .from(documentsTable)
      .where(inArray(documentsTable.id, ids));
    if (existing.length)
      await tx.insert(activitiesTable).values(
        existing.map((item) => ({
          userId: viewer.id,
          action: "delete" as const,
          description: "deleted a document",
          detail: item.title,
          ip,
          metadata: { documentId: item.id },
        })),
      );
    await tx.delete(documentsTable).where(inArray(documentsTable.id, ids));
    return existing;
  });
};

export const getBookmarkedDocuments = async (
  query: DocumentQuery,
  viewer: DocumentViewer,
) => {
  const bookmarkRows = await db
    .select({ id: bookmarksTable.documentId })
    .from(bookmarksTable)
    .innerJoin(documentsTable, eq(bookmarksTable.documentId, documentsTable.id))
    .where(
      and(
        eq(bookmarksTable.userId, viewer.id),
        eq(bookmarksTable.active, true),
        canRead(viewer),
      ),
    )
    .orderBy(desc(bookmarksTable.createdAt))
    .limit(query.perPage)
    .offset(query.page * query.perPage);
  const total = await db.$count(
    bookmarksTable,
    and(eq(bookmarksTable.userId, viewer.id), eq(bookmarksTable.active, true)),
  );
  return {
    data: await enrich(
      bookmarkRows.map((row) => row.id),
      viewer,
    ),
    total,
  };
};

export const setBookmark = async (
  documentId: string,
  bookmarked: boolean,
  viewer: DocumentViewer,
) => {
  await getDocument(documentId, viewer);
  await db
    .insert(bookmarksTable)
    .values({ documentId, userId: viewer.id, active: bookmarked })
    .onConflictDoUpdate({
      target: [bookmarksTable.userId, bookmarksTable.documentId],
      set: { active: bookmarked, createdAt: new Date() },
    });
  return { documentId, bookmarked };
};

export const getFileAccess = async (
  documentId: string,
  viewer: DocumentViewer,
  versionId?: string,
) => {
  await getDocument(documentId, viewer);
  if (versionId) {
    const version = await db.query.documentVersionsTable.findFirst({
      where: and(
        eq(documentVersionsTable.id, versionId),
        eq(documentVersionsTable.documentId, documentId),
      ),
    });
    if (!version) throw new NotFoundError("Document version not found");
    return createPresignedFileUrl(version.fileKey, version.fileName);
  }
  const document = await db.query.documentsTable.findFirst({
    where: eq(documentsTable.id, documentId),
    columns: { fileKey: true, fileName: true },
  });
  if (!document) throw new NotFoundError("Document not found");
  return createPresignedFileUrl(document.fileKey, document.fileName);
};
