import { databasePool, migrate } from "./database.js";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const pool = databasePool(process.env.DATABASE_URL);
try {
  await migrate(pool);
  console.log("Database migrations applied.");
} finally {
  await pool.end();
}
