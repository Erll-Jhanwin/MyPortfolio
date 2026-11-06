import { loadEnvConfig } from "@next/env";
import Database from "better-sqlite3";
import { Pool } from "pg";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
loadEnvConfig(process.cwd());

async function main(){if(process.env.NODE_ENV==="production"&&process.env.DATA_PROVIDER!=="postgres")throw new Error("Production migrations require DATA_PROVIDER=postgres");const provider=process.env.DATA_PROVIDER??"sqlite";
  if(provider==="sqlite"){
    const file=path.resolve(process.env.SQLITE_PATH??"./data/portfolio.sqlite");mkdirSync(path.dirname(file),{recursive:true});const db=new Database(file);db.pragma("foreign_keys=ON");db.pragma("journal_mode=WAL");db.pragma("busy_timeout=5000");db.exec("CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
    const dir=path.join(process.cwd(),"db/sqlite/migrations");for(const name of readdirSync(dir).filter(x=>x.endsWith(".sql")).sort()){if(db.prepare("SELECT 1 FROM schema_migrations WHERE name=?").get(name))continue;const sql=readFileSync(path.join(dir,name),"utf8");db.transaction(()=>{db.exec(sql);db.prepare("INSERT INTO schema_migrations(name,applied_at) VALUES(?,?)").run(name,new Date().toISOString())})();console.log(`Applied SQLite migration ${name}`);}db.close();return;
  }
  if(provider==="postgres"){
    if(process.env.NODE_ENV==="production"&&process.env.ALLOW_PRODUCTION_MIGRATIONS!=="true")throw new Error("Set ALLOW_PRODUCTION_MIGRATIONS=true for the controlled migration step.");
    let connectionString=process.env.MIGRATION_DATABASE_URL??process.env.DATABASE_URL;if(!connectionString)throw new Error("MIGRATION_DATABASE_URL is required");const parsed=new URL(connectionString);const mode=parsed.searchParams.get("sslmode");const supabase=parsed.hostname.endsWith(".supabase.co")||parsed.hostname.endsWith(".pooler.supabase.com");let ssl:{rejectUnauthorized:boolean;ca?:string}|undefined;if(supabase||mode==="require"){parsed.searchParams.delete("sslmode");connectionString=parsed.toString();const caPath=process.env.DATABASE_CA_CERT_PATH;ssl=caPath?{ca:readFileSync(path.resolve(caPath),"utf8"),rejectUnauthorized:true}:{rejectUnauthorized:false};}const pool=new Pool({connectionString,ssl,max:1});const client=await pool.connect();try{await client.query("CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, applied_at timestamptz NOT NULL)");const dir=path.join(process.cwd(),"db/postgres/migrations");for(const name of readdirSync(dir).filter(x=>x.endsWith(".sql")).sort()){const done=await client.query("SELECT 1 FROM schema_migrations WHERE name=$1",[name]);if(done.rowCount)continue;await client.query("BEGIN");try{await client.query(readFileSync(path.join(dir,name),"utf8"));await client.query("INSERT INTO schema_migrations(name,applied_at) VALUES($1,now())",[name]);await client.query("COMMIT");console.log(`Applied PostgreSQL migration ${name}`);}catch(e){await client.query("ROLLBACK");throw e;}}}finally{client.release();await pool.end();}return;
  }
  throw new Error("DATA_PROVIDER must be sqlite or postgres");
}
main().catch(error=>{console.error("migration_failed",error instanceof Error?error.name:"unknown");process.exitCode=1;});
