import db from "../../db";
import { settingsTable } from "../../db/setting";
import type { SettingsInput } from "./schemas";
export type PermissionKey =
  "upload" | "delete_own" | "delete_any" | "manage_users" | "manage_categories";

export interface ResolvedSettings {
  general: {
    siteName: string;
    supportEmail: string;
    defaultVisibility: "public" | "private";
  };
  storage: { maxFileSizeMb: number; allowedExtensions: string[] };
  email: { uploadNotifications: boolean; weeklyDigest: boolean };
  permissions: Record<string, Record<string, boolean>>;
}

export const defaults: ResolvedSettings = {
  general: {
    siteName: "DocShelf",
    supportEmail: "support@docshelf.app",
    defaultVisibility: "private",
  },
  storage: {
    maxFileSizeMb: 25,
    allowedExtensions: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "png",
      "jpg",
    ],
  },
  email: { uploadNotifications: true, weeklyDigest: true },
  permissions: {
    admin: {
      upload: true,
      delete_own: true,
      delete_any: true,
      manage_users: true,
      manage_categories: true,
    },
    member: {
      upload: true,
      delete_own: true,
      delete_any: false,
      manage_users: false,
      manage_categories: false,
    },
  },
};
export const getSettings = async () => {
  const rows = await db.select().from(settingsTable);
  const stored = Object.fromEntries(
    rows.map((row) => [row.key, row.value]),
  ) as SettingsInput;
  return {
    general: { ...defaults.general, ...stored.general },
    storage: { ...defaults.storage, ...stored.storage },
    email: { ...defaults.email, ...stored.email },
    permissions: {
      ...stored.permissions,
      admin: { ...defaults.permissions.admin, ...stored.permissions?.admin },
      member: { ...defaults.permissions.member, ...stored.permissions?.member },
    },
  } satisfies ResolvedSettings;
};

export const getRuntimeSettings = async (role: "admin" | "member") => {
  const settings = await getSettings();
  return {
    general: settings.general,
    storage: settings.storage,
    permissions: settings.permissions[role] ?? {},
  };
};

export const hasPermission = async (
  role: "admin" | "member",
  permission: PermissionKey,
) => Boolean((await getSettings()).permissions[role]?.[permission]);
export const updateSettings = async (input: SettingsInput) => {
  await db.transaction(async (tx) => {
    for (const [key, value] of Object.entries(input)) {
      await tx
        .insert(settingsTable)
        .values({ key, value })
        .onConflictDoUpdate({
          target: settingsTable.key,
          set: { value, updatedAt: new Date() },
        });
    }
  });
  return getSettings();
};
