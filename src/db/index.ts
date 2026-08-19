import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlDb?: NodePgDatabase<typeof schema>;
};

function getDb(): NodePgDatabase<typeof schema> {
  if (globalForDb.__arenaNextJsPostgresqlDb) return globalForDb.__arenaNextJsPostgresqlDb;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required — set it in your Vercel project environment variables.");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlDb = db;
  }

  return db;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
