import type { Database } from "sql.js";
import { openDatabaseFromFile } from "./setup";

let databasePromise: Promise<Database> | undefined;

export async function getDatabase(): Promise<Database> {
  if (!databasePromise) {
    databasePromise = openDatabaseFromFile();
  }

  return databasePromise;
}

export async function resetDatabaseCache(): Promise<void> {
  if (!databasePromise) {
    return;
  }

  const database = await databasePromise;
  database.close();
  databasePromise = undefined;
}

export async function selectAll<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const database = await getDatabase();
  const statement = database.prepare(sql, params as never);
  const rows: T[] = [];

  try {
    while (statement.step()) {
      rows.push(statement.getAsObject() as T);
    }
  } finally {
    statement.free();
  }

  return rows;
}

export async function selectOne<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await selectAll<T>(sql, params);
  return rows[0] ?? null;
}