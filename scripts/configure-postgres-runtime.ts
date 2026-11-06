import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

async function main() {
  const migrationUrl = process.env.MIGRATION_DATABASE_URL;
  if (!migrationUrl) throw new Error("MIGRATION_DATABASE_URL is required.");
  const source = new URL(migrationUrl);
  if (!source.hostname.endsWith(".pooler.supabase.com")) throw new Error("Expected the configured Supabase pooler connection.");
  const parts = decodeURIComponent(source.username).split(".");
  if (parts.length < 2 || parts[0] !== "postgres") throw new Error("Could not determine the Supabase project reference from the migration username.");

  const caPath = process.env.DATABASE_CA_CERT_PATH;
  const ssl = caPath ? { ca: readFileSync(path.resolve(caPath), "utf8"), rejectUnauthorized: true } : { rejectUnauthorized: false };
  const owner = new Pool({ connectionString: migrationUrl, ssl, max: 1, connectionTimeoutMillis: 10000 });
  const client = await owner.connect();
  try {
    const existing = await client.query("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname='portfolio_runtime'");
    let runtimeUrl: URL;
    if (existing.rowCount) {
      if (existing.rows[0].rolsuper || existing.rows[0].rolbypassrls) throw new Error("Existing portfolio_runtime role has unsafe privileges; refusing to change it.");
      if (!process.env.DATABASE_URL) throw new Error("portfolio_runtime exists; configure its existing credential as DATABASE_URL.");
      runtimeUrl = new URL(process.env.DATABASE_URL);
      if (!decodeURIComponent(runtimeUrl.username).startsWith("portfolio_runtime.")) throw new Error("portfolio_runtime exists; refusing to replace another runtime credential.");
    } else {
      const password = randomBytes(36).toString("base64url");
      await client.query(`CREATE ROLE portfolio_runtime LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS`);
      runtimeUrl = new URL(migrationUrl);
      runtimeUrl.username = `portfolio_runtime.${parts.slice(1).join(".")}`;
      runtimeUrl.password = password;
    }
    // pg's current sslmode=require alias verifies the CA; this local pooler has
    // no trusted CA installed. Enforce TLS in the Node pool while retaining the
    // connection URL as a server-only secret.
    runtimeUrl.searchParams.delete("sslmode");
    const envPath = ".env.local";
    const envText = readFileSync(envPath, "utf8");
    if (!/^DATABASE_URL=.*$/m.test(envText)) throw new Error("DATABASE_URL was not found in .env.local; role was created but app configuration was not changed.");
    writeFileSync(envPath, envText.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${runtimeUrl.toString()}`));
    process.env.DATABASE_URL = runtimeUrl.toString();

    const runtimePool = new Pool({ connectionString: runtimeUrl.toString(), ssl, max: 1, connectionTimeoutMillis: 10000 });
    try {
      const check = await runtimePool.query("SELECT current_user AS role_name, r.rolsuper, r.rolbypassrls FROM pg_roles r WHERE r.rolname=current_user");
      if (check.rows[0]?.role_name !== "portfolio_runtime" || check.rows[0]?.rolsuper || check.rows[0]?.rolbypassrls) throw new Error("Runtime role verification failed.");
      const tableCheck = await runtimePool.query("SELECT (SELECT count(*) FROM projects)::int AS projects, (SELECT count(*) FROM project_images)::int AS images, (SELECT count(*) FROM resume_documents)::int AS resumes");
      console.log("Dedicated non-superuser, NOBYPASSRLS runtime role is configured.");
      console.log("Updated server-only DATABASE_URL in .env.local; its password was not displayed.");
      console.log(caPath ? "Runtime TLS and Supabase CA verification passed." : "Runtime TLS passed; no Supabase CA certificate was configured for hostname verification.");
      console.log(`Runtime table access verified: projects=${tableCheck.rows[0].projects}, images=${tableCheck.rows[0].images}, resumes=${tableCheck.rows[0].resumes}.`);
    } finally { await runtimePool.end(); }
  } finally {
    client.release();
    await owner.end();
  }
}

main().catch((error) => {
  console.error(`Runtime role setup failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
