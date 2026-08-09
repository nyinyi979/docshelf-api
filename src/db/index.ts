import * as userSchema from "./user";
import * as documentSchema from "./document";
import * as tagSchema from "./tag";
import * as auditSchema from "./audit";
import * as settingSchema from "./setting";
import * as categorySchema from "./category";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle({
  client: pool,
  schema: {
    ...categorySchema,
    ...userSchema,
    ...documentSchema,
    ...tagSchema,
    ...auditSchema,
    ...settingSchema,
  },
});

export default db;
