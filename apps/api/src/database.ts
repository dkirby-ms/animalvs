import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool, type PoolClient } from "pg";
import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";

/** Create a bounded pool; callers own pool.end(). Never log the connection URL. */
export function databasePool(connectionString: string) {
  const pool = new Pool({ connectionString, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
  pool.on("error", () => console.error("PostgreSQL connection failed."));
  return pool;
}

/** Commit all work or roll back; a failed write never returns a success-shaped result. */
export async function transaction<T>(pool: Pool, action: (client: PoolClient) => Promise<T>): Promise<T> {
  return trace.getTracer("animalvs-platform").startActiveSpan("TRANSACTION", {
    kind: SpanKind.CLIENT, attributes: { "db.system.name": "postgresql", "db.operation.name": "TRANSACTION" },
  }, async span => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query("BEGIN");
      const result = await action(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      if (client) await client.query("ROLLBACK");
      throw error;
    } finally {
      client?.release();
      span.end();
    }
  });
}

/** Apply versioned SQL atomically under a transaction-scoped migration lock. Run from repository root. */
export async function migrate(pool: Pool): Promise<void> {
  const sql = await readFile(resolve("apps/api/migrations/001-platform.sql"), "utf8");
  await transaction(pool, async client => {
    await client.query("SELECT pg_advisory_xact_lock(1095652435)");
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY)");
    const applied = await client.query("SELECT version FROM schema_migrations WHERE version=1");
    if (!applied.rowCount) {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations(version) VALUES (1)");
    }
  });
}
