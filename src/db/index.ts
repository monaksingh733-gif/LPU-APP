import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createEmbeddedPgPool } from "@/db/embedded";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: any;
};

/**
 * Initializes and returns a production-ready, resilient PostgreSQL pool.
 * Supports SSL verification overrides for Neon/Supabase cloud endpoints
 * and gracefully falls back to embedded pg-mem for local sandbox/testing.
 */
function initPool(): any {
  if (globalForDb.__arenaNextJsPostgresqlPool) {
    return globalForDb.__arenaNextJsPostgresqlPool;
  }

  let activePool: any;
  if (databaseUrl && databaseUrl.startsWith("postgres")) {
    try {
      activePool = new Pool({
        connectionString: databaseUrl,
        max: 20, // Max concurrent connections
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
      });

      // Handle background pool idle connection errors without crashing Next.js process
      activePool.on("error", (err: Error) => {
        console.warn("PostgreSQL idle client error caught gracefully:", err.message);
      });
    } catch (e) {
      console.warn("Failed to create remote PostgreSQL pool, switching to embedded memory database:", e);
      activePool = createEmbeddedPgPool();
    }
  } else {
    activePool = createEmbeddedPgPool();
  }

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = activePool;
  }
  return activePool;
}

export const pool = initPool();
export const db = drizzle(pool, { schema });

