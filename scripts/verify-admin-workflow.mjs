import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { createServer } from "node:net";
import Database from "better-sqlite3";
import sharp from "sharp";

const root = process.cwd();
const databasePath = path.join(tmpdir(), `erll-admin-check-${process.pid}-${randomBytes(5).toString("hex")}.sqlite`);
const testBuildPath = path.resolve(root, ".next-admin-workflow-test");
const tsconfigPath = path.join(root, "tsconfig.json");
const agentRulesPath = path.join(root, "AGENTS.md");
const nextEnvPath = path.join(root, "next-env.d.ts");
const originalTsconfig = readFileSync(tsconfigPath);
const originalNextEnv = readFileSync(nextEnvPath);
let originalAgentRules = null;
try { originalAgentRules = readFileSync(agentRulesPath); } catch { /* Next may create this generated file during dev. */ }
const password = `Workflow-${randomBytes(16).toString("hex")}`;
const salt = randomBytes(16);
const passwordHash = `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex")}`;
const sessionSecret = randomBytes(48).toString("base64url");
let app;
let serverOutput = "";

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => server.once("error", reject).listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function applyMigrations() {
  const database = new Database(databasePath);
  database.pragma("foreign_keys=ON");
  for (const migration of ["001_initial.sql", "002_projects.sql"]) database.exec(readFileSync(path.join(root, "db/sqlite/migrations", migration), "utf8"));
  database.close();
}

async function waitForApp(baseUrl) {
  const started = Date.now();
  while (Date.now() - started < 90_000) {
    if (app.exitCode !== null) throw new Error(`Development server exited early. ${serverOutput.slice(-5000)}`);
    try { const response = await fetch(`${baseUrl}/admin`); if (response.ok) return; } catch { /* server is still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`Timed out waiting for development server. ${serverOutput.slice(-5000)}`);
}

async function json(response) {
  const content = await response.text();
  try { return JSON.parse(content); } catch { throw new Error(`Expected JSON; received HTTP ${response.status}.`); }
}

async function run() {
  applyMigrations();
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    NODE_ENV: "development",
    ADMIN_WORKFLOW_TEST: "true",
    NEXT_TELEMETRY_DISABLED: "1",
    APP_URL: baseUrl,
    DATA_PROVIDER: "sqlite",
    SQLITE_PATH: databasePath,
    RATE_LIMIT_SECRET: randomBytes(48).toString("hex"),
    ADMIN_USERNAME: "workflow-admin",
    ADMIN_PASSWORD_HASH: passwordHash,
    ADMIN_SESSION_SECRET: sessionSecret,
  };
  app = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "dev", "--port", String(port)], { cwd: root, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  app.stdout.on("data", (chunk) => { serverOutput = (serverOutput + chunk.toString()).slice(-8000); });
  app.stderr.on("data", (chunk) => { serverOutput = (serverOutput + chunk.toString()).slice(-8000); });
  await waitForApp(baseUrl);

  const originHeaders = { Origin: baseUrl };
  const protectedList = await fetch(`${baseUrl}/api/admin/projects`);
  assert.equal(protectedList.status, 401, "project API denies anonymous access");
  assert.equal((await fetch(`${baseUrl}/api/admin/auth/register`, { method: "POST" })).status, 404, "public registration is absent");

  const badLogin = await fetch(`${baseUrl}/api/admin/auth/login`, { method: "POST", headers: { ...originHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ username: "workflow-admin", password: "incorrect" }) });
  assert.equal(badLogin.status, 401, "incorrect credentials are rejected");
  const login = await fetch(`${baseUrl}/api/admin/auth/login`, { method: "POST", headers: { ...originHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ username: "workflow-admin", password }) });
  assert.equal(login.status, 200, "valid credentials create an admin session");
  const cookie = login.headers.get("set-cookie")?.split(";", 1)[0];
  assert.ok(cookie, "login sets an HTTP-only session cookie");
  const authHeaders = { ...originHeaders, Cookie: cookie };

  const project = {
    slug: "managed-workflow-check", title: "Managed Workflow Check", summary: "A test project summary.", description: "A test project description for the admin workflow.",
    projectType: "personal", status: "prototype", role: "", context: "", constraints: [], solution: "", decisions: [], technologies: ["Next.js"],
    evidence: [], results: "", limitations: [], lessons: [], demoUrl: "", githubUrl: "", published: false,
  };
  const createdResponse = await fetch(`${baseUrl}/api/admin/projects`, { method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" }, body: JSON.stringify(project) });
  assert.equal(createdResponse.status, 201, "admin can create a project draft");
  const created = (await json(createdResponse)).project;
  const draftPage = await fetch(`${baseUrl}/projects/managed-workflow-check`);
  const draftHtml = await draftPage.text();
  assert.doesNotMatch(draftHtml, /Managed Workflow Check|A test project description/, "draft content is not present in the public response");

  const png = await sharp({ create: { width: 4, height: 3, channels: 3, background: "#c6ff34" } }).png().toBuffer();
  const uploadForm = new FormData();
  uploadForm.set("image", new Blob([png], { type: "image/png" }), "test.png");
  uploadForm.set("alt", "A small lime test image");
  const upload = await fetch(`${baseUrl}/api/admin/projects/${created.id}/images`, { method: "POST", headers: authHeaders, body: uploadForm });
  assert.equal(upload.status, 201, "admin can upload a validated image");

  const malformedForm = new FormData();
  malformedForm.set("image", new Blob(["not an image"], { type: "image/png" }), "spoof.png");
  malformedForm.set("alt", "A fake image file");
  const malformed = await fetch(`${baseUrl}/api/admin/projects/${created.id}/images`, { method: "POST", headers: authHeaders, body: malformedForm });
  assert.equal(malformed.status, 400, "spoofed image MIME types are rejected");

  const adminList = await json(await fetch(`${baseUrl}/api/admin/projects`, { headers: authHeaders }));
  const image = adminList.projects[0].images[0];
  assert.ok(image?.id, "uploaded image metadata persists");
  const privatePreview = await fetch(`${baseUrl}/api/admin/projects/${created.id}/images/${image.id}`, { headers: { Cookie: cookie } });
  assert.equal(privatePreview.status, 200, "admin can preview a draft image");
  assert.equal(privatePreview.headers.get("content-type"), "image/webp", "uploaded image is re-encoded to WebP");

  const forbiddenUpdate = await fetch(`${baseUrl}/api/admin/projects/${created.id}`, { method: "PUT", headers: { ...authHeaders, Origin: "https://attacker.invalid", "Content-Type": "application/json" }, body: JSON.stringify({ ...project, published: true }) });
  assert.equal(forbiddenUpdate.status, 403, "cross-origin project mutations are rejected");

  const publish = await fetch(`${baseUrl}/api/admin/projects/${created.id}`, { method: "PUT", headers: { ...authHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ ...project, published: true }) });
  assert.equal(publish.status, 200, "admin can publish a project");
  const publicList = await fetch(`${baseUrl}/projects`);
  assert.equal(publicList.status, 200);
  assert.match(await publicList.text(), /Managed Workflow Check/, "published project appears on the public Projects page");
  const publicPage = await fetch(`${baseUrl}/projects/managed-workflow-check`);
  assert.equal(publicPage.status, 200, "published project has a public case-study page");
  const publicImage = await fetch(`${baseUrl}/api/projects/managed-workflow-check/images/${image.id}`);
  assert.equal(publicImage.status, 200, "published image is public");

  const unpublish = await fetch(`${baseUrl}/api/admin/projects/${created.id}`, { method: "PUT", headers: { ...authHeaders, "Content-Type": "application/json" }, body: JSON.stringify(project) });
  assert.equal(unpublish.status, 200, "admin can unpublish a project");
  const unpublishedPage = await fetch(`${baseUrl}/projects/managed-workflow-check`);
  assert.doesNotMatch(await unpublishedPage.text(), /Managed Workflow Check|A test project description/, "unpublished project content is hidden");
  assert.equal((await fetch(`${baseUrl}/api/projects/managed-workflow-check/images/${image.id}`)).status, 404, "unpublished images are hidden");

  const deletion = await fetch(`${baseUrl}/api/admin/projects/${created.id}`, { method: "DELETE", headers: authHeaders });
  assert.equal(deletion.status, 200, "admin can delete a project");
  assert.equal((await json(await fetch(`${baseUrl}/api/admin/projects`, { headers: authHeaders }))).projects.length, 0, "project deletion is persistent");
  assert.equal((await fetch(`${baseUrl}/api/admin/auth/logout`, { method: "POST", headers: originHeaders })).status, 200, "admin can sign out");
  const clearedCookie = "erll_admin_session=";
  assert.equal((await fetch(`${baseUrl}/api/admin/projects`, { headers: { Cookie: clearedCookie } })).status, 401, "the cleared browser cookie no longer authenticates");

  console.log("Admin workflow verified: authorization, login, validation, image upload, draft privacy, publish, public rendering, unpublish, delete, and logout.");
}

try {
  await run();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Admin workflow verification failed.");
  if (serverOutput) console.error(serverOutput.slice(-5000));
  process.exitCode = 1;
} finally {
  if (app && app.exitCode === null) {
    if (process.platform === "win32" && app.pid) {
      try { execFileSync("taskkill", ["/PID", String(app.pid), "/T", "/F"], { stdio: "ignore" }); } catch { app.kill(); }
    } else app.kill();
    await new Promise((resolve) => app.exitCode !== null ? resolve() : app.once("exit", resolve));
  }
  if (!readFileSync(tsconfigPath).equals(originalTsconfig)) writeFileSync(tsconfigPath, originalTsconfig);
  if (!readFileSync(nextEnvPath).equals(originalNextEnv)) writeFileSync(nextEnvPath, originalNextEnv);
  if (originalAgentRules) writeFileSync(agentRulesPath, originalAgentRules);
  else rmSync(agentRulesPath, { force: true });
  const expectedBuildPath = path.resolve(root, ".next-admin-workflow-test");
  if (expectedBuildPath === testBuildPath && path.dirname(expectedBuildPath) === path.resolve(root)) rmSync(expectedBuildPath, { recursive: true, force: true });
  for (const suffix of ["", "-wal", "-shm"]) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try { rmSync(databasePath + suffix, { force: true }); break; }
      catch { if (attempt === 4) throw new Error("Could not remove the temporary admin test database."); await new Promise((resolve) => setTimeout(resolve, 500)); }
    }
  }
}
