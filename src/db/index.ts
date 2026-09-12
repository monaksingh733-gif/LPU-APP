import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createEmbeddedPgPool } from "@/db/embedded";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: any;
};

function initPool() {
  if (globalForDb.__arenaNextJsPostgresqlPool) {
    return globalForDb.__arenaNextJsPostgresqlPool;
  }

  let activePool: any;
  if (databaseUrl) {
    try {
      activePool = new Pool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 3000,
      });
    } catch {
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
export const db = drizzle(pool);
