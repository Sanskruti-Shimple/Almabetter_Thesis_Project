import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "./app.js";

const app = createApp({
  jwtSecret: "test-secret-that-is-at-least-32-characters-long",
  clientOrigins: ["http://localhost:5173"]
});

test("health endpoint reports service status", async () => {
  const response = await request(app).get("/api/health").set("Connection", "close");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("CORS allows the configured frontend origin", async () => {
  const response = await request(app)
    .get("/api/health")
    .set("Origin", "http://localhost:5173")
    .set("Connection", "close");
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:5173");
});

test("checkout rejects requests without a bearer token", async () => {
  const response = await request(app).post("/api/orders").set("Connection", "close").send({ items: [] });
  assert.equal(response.status, 401);
  assert.equal(response.body.error, "Sign in to continue.");
});

test("registration rejects invalid fields before database access", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .set("Connection", "close")
    .send({ name: "", email: "bad", password: "short" });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /valid email/);
});

test("unknown routes return a JSON 404", async () => {
  const response = await request(app).get("/api/not-a-route").set("Connection", "close");
  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Resource not found." });
});
