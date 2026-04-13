import { initializeDatabaseFile } from "./setup";
import { resetDatabaseCache } from "./client";

async function main(): Promise<void> {
  const filePath = await initializeDatabaseFile();
  await resetDatabaseCache();
  console.log(`Base de datos inicializada en ${filePath}`);
}

main().catch((error: unknown) => {
  console.error("No se pudo inicializar la base de datos.");
  console.error(error);
  process.exitCode = 1;
});