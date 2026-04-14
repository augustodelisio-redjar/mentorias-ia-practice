const FORBIDDEN_SQL_PATTERN =
  /\b(insert|update|delete|drop|alter|create|truncate|attach|detach|replace|vacuum|reindex|analyze|pragma)\b/i;

function hasMultipleStatements(sql: string): boolean {
  const compact = sql.trim();
  if (compact.length === 0) {
    return false;
  }

  const semicolons = [...compact.matchAll(/;/g)].length;

  if (semicolons === 0) {
    return false;
  }

  return compact.endsWith(";") ? semicolons > 1 : true;
}

export function validateReadOnlySql(sql: string): { valid: true } | { valid: false; reason: string } {
  const trimmed = sql.trim();

  if (trimmed.length === 0) {
    return { valid: false, reason: "La consulta no puede estar vacia." };
  }

  if (hasMultipleStatements(trimmed)) {
    return {
      valid: false,
      reason: "Solo se permite una sentencia SQL por consulta.",
    };
  }

  if (!/^(select|with)\b/i.test(trimmed)) {
    return {
      valid: false,
      reason: "Solo se permiten consultas de lectura (SELECT o WITH ... SELECT).",
    };
  }

  if (FORBIDDEN_SQL_PATTERN.test(trimmed)) {
    return {
      valid: false,
      reason: "La consulta contiene una operacion no permitida para el modo read-only.",
    };
  }

  return { valid: true };
}
