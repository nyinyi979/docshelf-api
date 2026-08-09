"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.hasPermission = exports.getRuntimeSettings = exports.getSettings = exports.defaults = void 0;
const db_1 = __importDefault(require("../../db"));
const setting_1 = require("../../db/setting");
exports.defaults = {
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
const getSettings = async () => {
    var _a, _b;
    const rows = await db_1.default.select().from(setting_1.settingsTable);
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return {
        general: { ...exports.defaults.general, ...stored.general },
        storage: { ...exports.defaults.storage, ...stored.storage },
        email: { ...exports.defaults.email, ...stored.email },
        permissions: {
            ...stored.permissions,
            admin: { ...exports.defaults.permissions.admin, ...(_a = stored.permissions) === null || _a === void 0 ? void 0 : _a.admin },
            member: { ...exports.defaults.permissions.member, ...(_b = stored.permissions) === null || _b === void 0 ? void 0 : _b.member },
        },
    };
};
exports.getSettings = getSettings;
const getRuntimeSettings = async (role) => {
    var _a;
    const settings = await (0, exports.getSettings)();
    return {
        general: settings.general,
        storage: settings.storage,
        permissions: (_a = settings.permissions[role]) !== null && _a !== void 0 ? _a : {},
    };
};
exports.getRuntimeSettings = getRuntimeSettings;
const hasPermission = async (role, permission) => { var _a; return Boolean((_a = (await (0, exports.getSettings)()).permissions[role]) === null || _a === void 0 ? void 0 : _a[permission]); };
exports.hasPermission = hasPermission;
const updateSettings = async (input) => {
    await db_1.default.transaction(async (tx) => {
        for (const [key, value] of Object.entries(input)) {
            await tx
                .insert(setting_1.settingsTable)
                .values({ key, value })
                .onConflictDoUpdate({
                target: setting_1.settingsTable.key,
                set: { value, updatedAt: new Date() },
            });
        }
    });
    return (0, exports.getSettings)();
};
exports.updateSettings = updateSettings;
