# DocShelf API

Fastify, TypeBox, Drizzle, and PostgreSQL API for the DocShelf document-management product.

## Setup

Copy `.env.example` to `.env`, provide real values, then run:

```bash
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Swagger UI is served at `http://127.0.0.1:7000/documentation`. Pagination is zero-based and requires `page` and `perPage`.

## Resource groups

- `/api/auth`: registration, login, current session, profile updates, and account deletion
- `/api/users`: admin user management and usage totals
- `/api/documents`: search, metadata, bookmarks, versions, ownership, and signed file access
- `/api/categories` and `/api/tags`: taxonomy management with live document counts
- `/api/activity`: filterable audit trail
- `/api/dashboard`: storage, upload, document, and user aggregates
- `/api/settings`: general, storage, email, and role-permission settings
- `/api/files`: temporary and permanent S3 upload lifecycle

New document files are first staged with `POST /api/files`. Pass the returned
temporary URL as `temporaryFileUrl` to `POST /api/documents`; document creation
promotes the file to S3 and stores the permanent URL. Abandoned staged files can
be discarded with `DELETE /api/files?url=...`.

Authenticated member endpoints return public documents plus documents owned by the
current member. Document owners can update, version, and delete their documents;
administrators retain access to all documents and management endpoints. Send the
JWT in `x-access-token`.

Stored S3 URLs and object keys are never exposed by document reads. Use
`GET /api/documents/:id/access-url` (optionally with `versionId`) to receive a
presigned URL valid for two hours. Clients should request a fresh URL before it
expires.

## Checks

```bash
npm run typecheck
npm run build
npm run format:check
```
