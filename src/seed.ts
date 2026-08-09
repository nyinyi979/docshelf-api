import "dotenv/config";
import bcrypt from "bcrypt";
import db from "./db";
import { categoriesTable } from "./db/category";
import { tagsTable } from "./db/tag";
import { usersTable } from "./db/user";

const categories = [
  ["Finance", "finance", "Budgets, forecasts, and reports."],
  ["Engineering", "engineering", "Specifications, roadmaps, and architecture."],
  ["Design", "design", "Brand, UI, and design systems."],
  ["HR", "hr", "People, policy, and onboarding."],
  ["Legal", "legal", "Contracts and legal templates."],
  ["Marketing", "marketing", "Campaigns and research."],
] as const;
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
    throw new Error(
      "ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters are required",
    );
  const hashedPassword = await bcrypt.hash(password, 10);
  await db
    .insert(usersTable)
    .values({
      username: process.env.ADMIN_NAME || "DocShelf Admin",
      email,
      password: hashedPassword,
      role: "admin",
    })
    .onConflictDoUpdate({
      target: usersTable.email,
      set: {
        password: hashedPassword,
        role: "admin",
        active: true,
        updatedAt: new Date(),
      },
    });
  await db
    .insert(categoriesTable)
    .values(
      categories.map(([name, slug, description]) => ({
        name,
        slug,
        description,
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(tagsTable)
    .values(tags.map((name) => ({ name, slug: name.toLowerCase() })))
    .onConflictDoNothing();
}
seed()
  .then(() => {
    console.log("DocShelf seed completed.");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    process.exit(1);
  });
