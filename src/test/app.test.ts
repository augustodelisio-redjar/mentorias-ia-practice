import assert from "node:assert/strict";
import { before, test } from "node:test";
import request from "supertest";
import app from "../app";
import { resetDatabaseCache } from "../db/client";
import { initializeDatabaseFile } from "../db/setup";

before(async () => {
  await initializeDatabaseFile();
  await resetDatabaseCache();
});

test("GET /api/health responde con el estado del servicio", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.database, "connected");
});

test("GET /api/courses devuelve los cursos sembrados", async () => {
  const response = await request(app).get("/api/courses");

  assert.equal(response.status, 200);
  assert.equal(response.body.items.length, 5);
  assert.equal(response.body.filters.level, null);
  assert.equal(response.body.items[0].title, "Developer Experience with Copilot");
});

test("GET /api/students/:id devuelve el detalle de un estudiante", async () => {
  const response = await request(app).get("/api/students/1");

  assert.equal(response.status, 200);
  assert.equal(response.body.student.email, "ana.pereyra@example.com");
  assert.equal(response.body.enrollments.length, 2);
});

test("GET /api/courses valida el filtro level", async () => {
  const response = await request(app).get("/api/courses?level=expert");

  assert.equal(response.status, 400);
  assert.match(response.body.error, /level/);
});