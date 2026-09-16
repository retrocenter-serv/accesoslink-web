import "server-only";
import pg from "pg";

const { Pool } = pg;
type QueryResultRow = pg.QueryResultRow;

declare global {
  // eslint-disable-next-line no-var
  var __accesoslinkPool: pg.Pool | undefined;
}

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    max: 5
  });
}

function getPool() {
  if (!globalThis.__accesoslinkPool) {
    globalThis.__accesoslinkPool = createPool();
  }

  return globalThis.__accesoslinkPool;
}

export async function query<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  const result = await getPool().query<T>(sql, params);
  return result.rows;
}
