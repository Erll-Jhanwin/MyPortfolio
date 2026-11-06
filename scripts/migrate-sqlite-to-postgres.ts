import { loadEnvConfig } from "@next/env";
import Database from "better-sqlite3";
import { Pool, type PoolClient } from "pg";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

type TableSpec = { name: string; key: string; json?: string[]; booleans?: string[]; blobs?: string[] };
const tables: TableSpec[] = [
  { name: "inquiries", key: "id" },
  { name: "privacy_requests", key: "id" },
  { name: "notification_jobs", key: "id" },
  { name: "rate_limits", key: "bucket_key" },
  { name: "projects", key: "id", json: ["constraints_json", "decisions_json", "technologies_json", "evidence_json", "limitations_json", "lessons_json"], booleans: ["published"] },
  { name: "project_images", key: "id", blobs: ["data"] },
  { name: "resume_documents", key: "id", json: ["draft_json", "published_json"] },
];
const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
};
const normalize = (value: unknown, column: string, spec: TableSpec): unknown => {
  if (value === null || value === undefined) return null;
  if (spec.json?.includes(column)) return typeof value === "string" ? JSON.parse(value) : value;
  if (spec.booleans?.includes(column)) return value === true || value === 1;
  if (spec.blobs?.includes(column)) return Buffer.isBuffer(value) ? value.toString("hex") : Buffer.from(value as Uint8Array).toString("hex");
  if (value instanceof Date) return value.toISOString();
  return value;
};
function equivalent(source: Record<string, unknown>, target: Record<string, unknown>, spec: TableSpec): boolean {
  return Object.keys(source).every((column) => {
    const left = normalize(source[column], column, spec);
    const right = normalize(target[column], column, spec);
    if (left instanceof Date || right instanceof Date) return new Date(left as string).getTime() === new Date(right as string).getTime();
    if (["created_at", "updated_at", "consented_at", "last_meaningful_exchange_at", "next_attempt_at", "lease_until", "sent_at", "window_started_at", "resolved_at", "published_at"].includes(column) && left !== null && right !== null) {
      return new Date(String(left)).getTime() === new Date(String(right)).getTime();
    }
    return canonicalJson(left) === canonicalJson(right);
  });
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_MIGRATIONS !== "true") {
    throw new Error("Set ALLOW_PRODUCTION_MIGRATIONS=true for this controlled data migration.");
  }
  const sourceFile = path.resolve(process.env.SQLITE_PATH ?? "./data/portfolio.sqlite");
  const backupCandidate = process.env.SQLITE_BACKUP_PATH
    ? path.resolve(process.env.SQLITE_BACKUP_PATH)
    : readdirSync(path.dirname(sourceFile)).filter((name) => name.startsWith(`${path.basename(sourceFile)}.backup-`)).map((name) => path.join(path.dirname(sourceFile), name)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
  if (!existsSync(sourceFile)) throw new Error("SQLite source database is missing.");
  if (!backupCandidate) throw new Error("No SQLite backup was found; set SQLITE_BACKUP_PATH to a verified backup.");
  const backupFile = path.resolve(backupCandidate);
  if (!existsSync(backupFile)) throw new Error(`SQLite backup is missing: ${backupFile}`);
  const connectionString = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("MIGRATION_DATABASE_URL is required.");

  const sqlite = new Database(sourceFile, { readonly: true, fileMustExist: true });
  sqlite.pragma("foreign_keys=ON");
  const count = (sql: string) => Number((sqlite.prepare(sql).get() as { n: number }).n);
  const sourceCounts = Object.fromEntries(tables.map(({ name }) => [name, count(`SELECT count(*) AS n FROM ${quote(name)}`)]));
  const sourceRows = Object.fromEntries(tables.map(({ name }) => [name, sqlite.prepare(`SELECT * FROM ${quote(name)}`).all() as Record<string, unknown>[]]));
  const sourceMigrationNames = (sqlite.prepare("SELECT name FROM schema_migrations ORDER BY name").all() as Array<{ name: string }>).map((row) => row.name);
  const sourceChecks = {
    orphanImages: count("SELECT count(*) AS n FROM project_images i LEFT JOIN projects p ON p.id=i.project_id WHERE p.id IS NULL"),
    orphanInquiryJobs: count("SELECT count(*) AS n FROM notification_jobs j LEFT JOIN inquiries i ON i.id=j.inquiry_id WHERE j.inquiry_id IS NOT NULL AND i.id IS NULL"),
    orphanPrivacyJobs: count("SELECT count(*) AS n FROM notification_jobs j LEFT JOIN privacy_requests p ON p.id=j.privacy_request_id WHERE j.privacy_request_id IS NOT NULL AND p.id IS NULL"),
  };
  sqlite.close();
  if (Object.values(sourceChecks).some((count) => count !== 0)) throw new Error("SQLite relationship check failed; migration stopped.");

  const caPath = process.env.DATABASE_CA_CERT_PATH;
  const ssl = caPath ? { ca: readFileSync(path.resolve(caPath), "utf8"), rejectUnauthorized: true } : { rejectUnauthorized: false };
  const pool = new Pool({ connectionString, ssl, max: 1, connectionTimeoutMillis: 10000 });
  const client = await pool.connect();
  const report: Record<string, { source: number; before: number; inserted: number; verified: number; after: number }> = {};
  let targetMigrationCount = 0;
  try {
    const identity = await client.query("SELECT current_database() AS database_name, current_user AS role_name");
    console.log(`Target connected: database=${identity.rows[0].database_name}, role=${identity.rows[0].role_name}`);
    await client.query("BEGIN");
    try {
      await client.query("CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, applied_at timestamptz NOT NULL)");
      const migrationDir = path.resolve("db/postgres/migrations");
      for (const name of readdirSync(migrationDir).filter((file) => file.endsWith(".sql")).sort()) {
        const applied = await client.query("SELECT 1 FROM schema_migrations WHERE name=$1", [name]);
        if (applied.rowCount) continue;
        await client.query(readFileSync(path.join(migrationDir, name), "utf8"));
        await client.query("INSERT INTO schema_migrations(name,applied_at) VALUES($1,now())", [name]);
      }

      for (const spec of tables) {
        const name = spec.name;
        const before = Number((await client.query(`SELECT count(*) AS n FROM ${quote(name)}`)).rows[0].n);
        let inserted = 0;
        let verified = 0;
        for (const source of sourceRows[name]) {
          const columns = Object.keys(source);
          const params = columns.map((column) => {
            const value = source[column];
            if (spec.json?.includes(column)) return value === null ? null : JSON.stringify(JSON.parse(String(value)));
            if (spec.booleans?.includes(column)) return value === true || value === 1;
            return value;
          });
          const existing = await client.query(`SELECT * FROM ${quote(name)} WHERE ${quote(spec.key)}=$1`, [source[spec.key]]);
          if (existing.rowCount) {
            if (!equivalent(source, existing.rows[0] as Record<string, unknown>, spec)) {
              throw new Error(`Existing target row conflicts with SQLite data in ${name}; no row was overwritten.`);
            }
            verified++;
            continue;
          }
          const placeholders = columns.map((column, index) => {
            const cast = spec.json?.includes(column) ? "::jsonb" : "";
            return `$${index + 1}${cast}`;
          });
          await client.query(`INSERT INTO ${quote(name)} (${columns.map(quote).join(",")}) VALUES (${placeholders.join(",")})`, params);
          inserted++;
        }
        report[name] = { source: sourceCounts[name], before, inserted, verified, after: before + inserted };
      }

      const targetChecks = await client.query(`
        SELECT
          (SELECT count(*) FROM project_images i LEFT JOIN projects p ON p.id=i.project_id WHERE p.id IS NULL) AS orphan_images,
          (SELECT count(*) FROM notification_jobs j LEFT JOIN inquiries i ON i.id=j.inquiry_id WHERE j.inquiry_id IS NOT NULL AND i.id IS NULL) AS orphan_inquiry_jobs,
          (SELECT count(*) FROM notification_jobs j LEFT JOIN privacy_requests p ON p.id=j.privacy_request_id WHERE j.privacy_request_id IS NOT NULL AND p.id IS NULL) AS orphan_privacy_jobs,
          (SELECT count(*) FROM notification_jobs WHERE (inquiry_id IS NOT NULL) = (privacy_request_id IS NOT NULL)) AS invalid_jobs
      `);
      if (Object.values(targetChecks.rows[0] as Record<string, string>).some((count) => Number(count) !== 0)) throw new Error("PostgreSQL relationship check failed.");
      const targetMigrationRows = await client.query("SELECT name FROM schema_migrations ORDER BY name");
      const targetMigrationNames = new Set((targetMigrationRows.rows as Array<{ name: string }>).map((row) => row.name));
      targetMigrationCount = targetMigrationNames.size;
      if (sourceMigrationNames.some((name) => !targetMigrationNames.has(name))) throw new Error("A SQLite schema migration record is missing from PostgreSQL.");

      const imageRows = await client.query("SELECT id,data FROM project_images ORDER BY id");
      const sqliteForHashes = new Database(sourceFile, { readonly: true, fileMustExist: true });
      try {
        for (const image of sqliteForHashes.prepare("SELECT id,data FROM project_images ORDER BY id").all() as Array<{ id: string; data: Buffer }>) {
          const target = imageRows.rows.find((row) => row.id === image.id) as { id: string; data: Buffer } | undefined;
          if (!target || createHash("sha256").update(target.data).digest("hex") !== createHash("sha256").update(image.data).digest("hex")) throw new Error(`Project image bytes differ for ${image.id}.`);
        }
      } finally { sqliteForHashes.close(); }

      for (const spec of tables) {
        const after = Number((await client.query(`SELECT count(*) AS n FROM ${quote(spec.name)}`)).rows[0].n);
        report[spec.name].after = after;
        if (report[spec.name].verified + report[spec.name].inserted !== report[spec.name].source) throw new Error(`Source row count verification failed for ${spec.name}.`);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
    console.log("SQLite source rows matched (existing + inserted); target-only rows were preserved:");
    for (const [name, counts] of Object.entries(report)) console.log(`${name}: source=${counts.source} target_before=${counts.before} inserted=${counts.inserted} already_matching=${counts.verified} target_after=${counts.after}`);
    console.log(`schema_migrations: source=${sourceMigrationNames.length} names preserved; PostgreSQL has ${targetMigrationCount} applied migrations.`);
    console.log("Relationships: SQLite and PostgreSQL checks passed.");
    console.log("Project image SHA-256 verification passed.");
    console.log(`SQLite backup retained at ${backupFile}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Migration failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
