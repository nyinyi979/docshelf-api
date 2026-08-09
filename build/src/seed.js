"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("./db"));
const category_1 = require("./db/category");
const tag_1 = require("./db/tag");
const user_1 = require("./db/user");
const categories = [
    ["Finance", "finance", "Budgets, forecasts, and reports."],
    ["Engineering", "engineering", "Specifications, roadmaps, and architecture."],
    ["Design", "design", "Brand, UI, and design systems."],
    ["HR", "hr", "People, policy, and onboarding."],
    ["Legal", "legal", "Contracts and legal templates."],
    ["Marketing", "marketing", "Campaigns and research."],
];
const tags = [
    "Q4",
    "roadmap",
    "budget",
    "onboarding",
    "policy",
    "spec",
    "report",
    "draft",
    "final",
    "archived",
];
async function seed() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password || password.length < 8)
        throw new Error("ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters are required");
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await db_1.default
        .insert(user_1.usersTable)
        .values({
        username: process.env.ADMIN_NAME || "DocShelf Admin",
        email,
        password: hashedPassword,
        role: "admin",
    })
        .onConflictDoUpdate({
        target: user_1.usersTable.email,
        set: {
            password: hashedPassword,
            role: "admin",
            active: true,
            updatedAt: new Date(),
        },
    });
    await db_1.default
        .insert(category_1.categoriesTable)
        .values(categories.map(([name, slug, description]) => ({
        name,
        slug,
        description,
    })))
        .onConflictDoNothing();
    await db_1.default
        .insert(tag_1.tagsTable)
        .values(tags.map((name) => ({ name, slug: name.toLowerCase() })))
        .onConflictDoNothing();
}
seed()
    .then(() => {
    console.log("DocShelf seed completed.");
    process.exit(0);
})
    .catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    process.exit(1);
});
