import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import initSqlJs, { type Database, type QueryExecResult } from "sql.js";
import { z } from "zod";
import { validateReadOnlySql } from "./policies/read-only";

const moduleRequire = createRequire(__filename);
const sqlJsWasmPath = moduleRequire.resolve("sql.js/dist/sql-wasm.wasm");
const dbFilePath = path.join(process.cwd(), "data", "mentoria.db");

let sqlJsPromise: ReturnType<typeof initSqlJs> | undefined;

async function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file: string) => (file === "sql-wasm.wasm" ? sqlJsWasmPath : file),
    });
  }

  return sqlJsPromise;
}

async function openDatabase(): Promise<Database> {
  if (!fs.existsSync(dbFilePath)) {
    throw new Error(`No se encontro ${dbFilePath}. Ejecuta 'npm run db:init' antes de iniciar el MCP.`);
  }

  const SQL = await getSqlJs();
  return new SQL.Database(fs.readFileSync(dbFilePath));
}

function rowsFromExecResult(result: QueryExecResult[]): Record<string, unknown>[] {
  if (result.length === 0) {
    return [];
  }

  const first = result[0];
  return first.values.map((valueRow) => {
    const row: Record<string, unknown> = {};
    first.columns.forEach((column, index) => {
      row[column] = valueRow[index] ?? null;
    });
    return row;
  });
}

function okText(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
  };
}

const server = new McpServer({
  name: "mentorias-ia-sqlite",
  version: "1.0.0",
});

server.registerTool(
  "list_tables",
  {
    description: "Lista las tablas disponibles en la base SQLite.",
    inputSchema: {},
  },
  async () => {
    const db = await openDatabase();

    try {
      const rows = rowsFromExecResult(
        db.exec(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC",
        ),
      );

      return okText({ tables: rows.map((item) => item.name) });
    } finally {
      db.close();
    }
  },
);

server.registerTool(
  "describe_table",
  {
    description: "Describe columnas, tipos y nullability de una tabla.",
    inputSchema: {
      table: z.string().min(1).describe("Nombre de tabla."),
    },
  },
  async ({ table }) => {
    if (!/^[a-z_][a-z0-9_]*$/i.test(table)) {
      throw new Error("Nombre de tabla invalido.");
    }

    const db = await openDatabase();

    try {
      const tableExists = rowsFromExecResult(
        db.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1", [table]),
      ).length;

      if (!tableExists) {
        throw new Error(`La tabla '${table}' no existe.`);
      }

      const columns = rowsFromExecResult(db.exec(`PRAGMA table_info(${table})`));

      return okText({ table, columns });
    } finally {
      db.close();
    }
  },
);

server.registerTool(
  "run_select_query",
  {
    description: "Ejecuta una consulta SQL read-only (solo SELECT/WITH).",
    inputSchema: {
      query: z.string().min(1).describe("Consulta SQL de lectura."),
      maxRows: z.number().int().min(1).max(200).optional().describe("Maximo de filas en la respuesta."),
    },
  },
  async ({ query, maxRows = 50 }) => {
    const validation = validateReadOnlySql(query);

    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const db = await openDatabase();

    try {
      const limitedQuery = `SELECT * FROM (${query.trim().replace(/;$/, "")}) AS q LIMIT ${maxRows}`;
      const rows = rowsFromExecResult(db.exec(limitedQuery));

      return okText({
        rowCount: rows.length,
        maxRows,
        rows,
      });
    } finally {
      db.close();
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP SQLite server running on stdio");
}

main().catch((error: unknown) => {
  console.error("MCP server error:", error);
  process.exit(1);
});