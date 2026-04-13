import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

const moduleRequire = createRequire(__filename);
const sqlJsWasmPath = moduleRequire.resolve("sql.js/dist/sql-wasm.wasm");
const repoRoot = path.resolve(__dirname, "..", "..");

export const databaseFilePath = path.join(repoRoot, "data", "mentoria.db");

const schemaFilePath = path.join(__dirname, "schema.sql");
const seedFilePath = path.join(__dirname, "seed.sql");

let sqlJsPromise: Promise<SqlJsStatic> | undefined;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file: string) => {
        if (file === "sql-wasm.wasm") {
          return sqlJsWasmPath;
        }

        return file;
      },
    });
  }

  return sqlJsPromise;
}

function readSqlFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

export async function initializeDatabaseFile(): Promise<string> {
  const SQL = await getSqlJs();
  const database = new SQL.Database();

  database.run("PRAGMA foreign_keys = ON;");
  database.run(readSqlFile(schemaFilePath));
  database.run(readSqlFile(seedFilePath));

  fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });
  fs.writeFileSync(databaseFilePath, Buffer.from(database.export()));
  database.close();

  return databaseFilePath;
}

export async function openDatabaseFromFile(filePath = databaseFilePath): Promise<Database> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontro la base de datos en ${filePath}. Ejecuta \"npm run db:init\" primero.`);
  }

  const SQL = await getSqlJs();
  const buffer = fs.readFileSync(filePath);
  const database = new SQL.Database(buffer);

  database.run("PRAGMA foreign_keys = ON;");

  return database;
}