import { loadEnvConfig } from "@next/env";
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
loadEnvConfig(process.cwd());
if((process.env.DATA_PROVIDER??"sqlite")!=="sqlite"||process.env.NODE_ENV==="production"){console.error("seed_refused: development seeds are restricted to local SQLite");process.exit(1);}
const file=path.resolve(process.env.SQLITE_PATH??"./data/portfolio.sqlite");mkdirSync(path.dirname(file),{recursive:true});const db=new Database(file);db.pragma("foreign_keys=ON");
const existing=db.prepare("SELECT id FROM inquiries WHERE idempotency_key=?").get("development-seed-inquiry-v1") as {id:string}|undefined;
if(!existing){const id=randomUUID(),now=new Date().toISOString();db.transaction(()=>{db.prepare("INSERT INTO inquiries(id,idempotency_key,name,email,inquiry_type,message,consent_wording_version,consented_at,created_at,updated_at,last_meaningful_exchange_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)").run(id,"development-seed-inquiry-v1","Synthetic Development Visitor","seed@example.invalid","other","Synthetic local seed record. This message is not real and must never be used as a production lead.","development-seed-only",now,now,now,now);db.prepare("INSERT INTO notification_jobs(id,inquiry_id,status,attempts,next_attempt_at,created_at) VALUES(?,?,'sent',0,?,?)").run(randomUUID(),id,now,now);})();console.log("Inserted one synthetic local-only development inquiry.");}else console.log("Synthetic seed is already present.");db.close();
