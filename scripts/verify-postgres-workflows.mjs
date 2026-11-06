import { createRequire } from "node:module";
import { createHmac, randomUUID } from "node:crypto";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
const { Pool } = require("pg");
const Database = require("better-sqlite3");
loadEnvConfig(process.cwd());
const base = process.env.VERIFY_APP_URL ?? "http://localhost:3000";
const user = process.env.ADMIN_USERNAME;
const secret = process.env.ADMIN_SESSION_SECRET;
if (!user || !secret || secret.length < 32) throw new Error("Admin session configuration is unavailable.");
const payload = Buffer.from(JSON.stringify({ user, exp: Date.now() + 5 * 60_000, nonce: randomUUID() })).toString("base64url");
const signature = createHmac("sha256", secret).update(payload).digest("base64url");
const cookie = `erll_admin_session=${payload}.${signature}`;
let createdProjectId;
let resumeBefore;
let resumeChanged = false;
const sqlite = new Database(process.env.SQLITE_PATH ?? "./data/portfolio.sqlite", { readonly: true, fileMustExist: true });
const sqliteResume = sqlite.prepare("SELECT draft_json,published_json,updated_at,published_at FROM resume_documents WHERE id=1").get();
sqlite.close();
if (!sqliteResume) throw new Error("SQLite résumé backup record is unavailable for test restoration.");
const database = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 });
const headers = { Origin: process.env.APP_URL ?? "http://localhost:3000", Cookie: cookie };
const request = async (url, options = {}) => {
  const response = await fetch(new URL(url, base), { ...options, headers: { ...headers, ...options.headers } });
  if (!response.ok) throw new Error(`${options.method ?? "GET"} ${url} returned ${response.status}: ${(await response.text()).slice(0, 1000)}`);
  return response;
};

try {
  const home = await fetch(new URL("/", base));
  if (!home.ok) throw new Error(`Public home page returned ${home.status}`);
  console.log("Public home page: passed");

  const slug = `migration-check-${randomUUID().replaceAll("-", "")}`;
  const draft = {
    slug, title: "Migration Verification Project", summary: "Temporary project used to verify the PostgreSQL adapter.",
    description: "A temporary record used for migration verification and removed after the checks.",
    projectType: "personal", status: "prototype", role: "Verification", context: "Temporary", constraints: [], solution: "Temporary", decisions: [], technologies: ["PostgreSQL"], evidence: [], results: "", limitations: [], lessons: [], demoUrl: "", githubUrl: "", published: false,
  };
  const createdResponse = await request("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
  createdProjectId = (await createdResponse.json()).project.id;
  const edit = { ...draft, summary: "Edited in PostgreSQL during verification." };
  const edited = await request(`/api/admin/projects/${createdProjectId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
  if ((await edited.json()).project.summary !== edit.summary) throw new Error("Project edit did not persist.");
  console.log("Admin project create and edit: passed");

  const png = await sharp({ create: { width: 4, height: 3, channels: 3, background: "#2b6fdb" } }).png().toBuffer();
  const form = new FormData();
  form.set("alt", "Verification test image");
  form.set("image", new Blob([png], { type: "image/png" }), "verification.png");
  await request(`/api/admin/projects/${createdProjectId}/images`, { method: "POST", body: form });
  const listed = await request("/api/admin/projects", { method: "GET" });
  const temp = (await listed.json()).projects.find((item) => item.id === createdProjectId);
  if (!temp?.images?.length) throw new Error("Uploaded image was not saved to PostgreSQL.");
  const adminImage = await request(`/api/admin/projects/${createdProjectId}/images/${temp.images[0].id}`);
  if (!adminImage.headers.get("content-type")?.includes("image/webp")) throw new Error("Admin image retrieval failed.");
  console.log("Admin image upload and retrieval: passed");

  await request(`/api/admin/projects/${createdProjectId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...edit, published: true }) });
  const publicProject = await fetch(new URL(`/projects/${slug}`, base));
  if (!publicProject.ok || !(await publicProject.text()).includes("Migration Verification Project")) throw new Error(`Published public project page returned ${publicProject.status} or missed its content.`);
  const publicImage = await fetch(new URL(`/api/projects/${slug}/images/${temp.images[0].id}`, base));
  if (!publicImage.ok || !publicImage.headers.get("content-type")?.includes("image/webp")) throw new Error("Published project image was not publicly served.");
  console.log("Published project page and public image: passed");

  const resumeResponse = await request("/api/admin/resume");
  resumeBefore = await resumeResponse.json();
  const changed = { ...resumeBefore.draft, headline: `${resumeBefore.draft.headline} · DB check` };
  const saved = await request("/api/admin/resume", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changed) });
  if ((await saved.json()).draft.headline !== changed.headline) throw new Error("Résumé draft update did not persist.");
  resumeChanged = true;
  await request("/api/admin/resume", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resumeBefore.draft) });
  const restored = await database.query(
    "UPDATE resume_documents SET updated_at=$1,published_at=$2 WHERE id=1 AND draft_json=$3::jsonb AND published_json=$4::jsonb RETURNING id",
    [sqliteResume.updated_at, sqliteResume.published_at, sqliteResume.draft_json, sqliteResume.published_json],
  );
  if (restored.rowCount !== 1) throw new Error("Résumé content did not match SQLite after restoration; timestamp was left unchanged.");
  resumeChanged = false;
  console.log("Résumé draft update and restoration: passed");
} finally {
  if (resumeChanged && resumeBefore?.draft) {
    await request("/api/admin/resume", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resumeBefore.draft) }).catch(() => {});
  }
  if (createdProjectId) await request(`/api/admin/projects/${createdProjectId}`, { method: "DELETE" }).catch(() => {});
  await database.end();
}
