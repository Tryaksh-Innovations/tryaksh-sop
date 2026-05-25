import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

let _db: DbClient | null = null;

function getDb(): DbClient {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.local.example to .env.local and fill in your Supabase connection string."
    );
  }

  const client = postgres(connectionString, { prepare: false });
  _db = drizzle(client, { schema });
  return _db;
}

// Proxy so callers keep `db.select().from(...)` ergonomics but the
// underlying client only initializes on first use — Next.js can
// safely evaluate route modules at build time without a live DB.
export const db = new Proxy({} as DbClient, {
  get(_, prop) {
    const client = getDb();
    const value = client[prop as keyof DbClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
