import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: [
    "./src/db/user.ts",
    "./src/db/category.ts",
    "./src/db/tag.ts",
    "./src/db/document.ts",
    "./src/db/audit.ts",
    "./src/db/setting.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
