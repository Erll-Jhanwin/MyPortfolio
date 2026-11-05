import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import path from "node:path";
import { sqliteRepository } from "../src/lib/server/repositories/sqlite";

const db=(globalThis as typeof globalThis & {portfolioDb?:Database.Database});
describe("SQLite repository contract",()=>{
  beforeEach(()=>{process.env.SQLITE_PATH=":memory:";db.portfolioDb=new Database(":memory:");db.portfolioDb.pragma("foreign_keys=ON");db.portfolioDb.exec(readFileSync(path.join(process.cwd(),"db/sqlite/migrations/001_initial.sql"),"utf8"));});
  afterEach(()=>{db.portfolioDb?.close();delete db.portfolioDb;});
  const input=(key="00000000-0000-4000-8000-000000000001")=>({id:"00000000-0000-4000-8000-000000000002",idempotencyKey:key,name:"Test Visitor",email:"test@example.invalid",type:"project" as const,message:"A sufficiently long synthetic test inquiry.",budget:null,timeline:null,consentVersion:"inquiry-contact-v1",consentedAt:"2026-11-05T00:00:00.000Z"});
  it("atomically stores an inquiry and one notification, and replays idempotently",async()=>{const first=await sqliteRepository.createInquiry(input());const replay=await sqliteRepository.createInquiry(input());expect(first.replayed).toBe(false);expect(replay.id).toBe(first.id);expect(replay.replayed).toBe(true);expect(db.portfolioDb!.prepare("SELECT count(*) n FROM inquiries").get()).toEqual({n:1});expect(db.portfolioDb!.prepare("SELECT count(*) n FROM notification_jobs").get()).toEqual({n:1});});
  it("claims a minimal notification job and records delivery",async()=>{await sqliteRepository.createInquiry(input());const jobs=await sqliteRepository.claimDueJobs("2026-11-05T00:00:01.000Z","2026-11-05T00:01:01.000Z",10);expect(jobs).toHaveLength(1);expect(jobs[0].type).toBe("project");expect(jobs[0]).not.toHaveProperty("email");await sqliteRepository.finishJob(jobs[0].id,"2026-11-05T00:00:02.000Z");expect(db.portfolioDb!.prepare("SELECT status FROM notification_jobs").get()).toEqual({status:"sent"});});
  it("enforces a database-backed rate limit",async()=>{expect(await sqliteRepository.consumeRateLimit("opaque-hmac","2026-11-05T00:00:00.000Z",1,3600000)).toMatchObject({allowed:true});expect(await sqliteRepository.consumeRateLimit("opaque-hmac","2026-11-05T00:00:01.000Z",1,3600000)).toMatchObject({allowed:false});});
});
