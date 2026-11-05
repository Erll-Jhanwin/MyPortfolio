import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { postgresRepository } from "../src/lib/server/repositories/postgres";

const connectionString=process.env.POSTGRES_TEST_URL;
const suite=connectionString?describe:describe.skip;
const cleanupPool=connectionString?new Pool({connectionString,max:1}):undefined;
let oldUrl:string|undefined;
let oldProvider:string|undefined;
const key=()=>crypto.randomUUID();
suite("PostgreSQL repository contract (dedicated non-production DB and portfolio_runtime role)",()=>{
  beforeAll(()=>{oldUrl=process.env.DATABASE_URL;oldProvider=process.env.DATA_PROVIDER;process.env.DATABASE_URL=connectionString;process.env.DATA_PROVIDER="postgres";});
  afterAll(async()=>{if(oldUrl===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=oldUrl;if(oldProvider===undefined)delete process.env.DATA_PROVIDER;else process.env.DATA_PROVIDER=oldProvider;await cleanupPool?.end();});
  afterEach(async()=>{await cleanupPool?.query("DELETE FROM inquiries WHERE idempotency_key LIKE 'contract-test-%'");await cleanupPool?.query("DELETE FROM privacy_requests WHERE idempotency_key LIKE 'contract-test-%'");await cleanupPool?.query("DELETE FROM rate_limits WHERE bucket_key LIKE 'contract-test-%'");});
  it("commits inquiry and outbox together and returns the original receipt on replay",async()=>{const idempotencyKey=`contract-test-${key()}`;const id=key();const now=new Date().toISOString();const first=await postgresRepository.createInquiry({id,idempotencyKey,name:"Synthetic Test",email:"test@example.invalid",type:"project",message:"A sufficiently long synthetic PostgreSQL contract test.",budget:null,timeline:null,consentVersion:"inquiry-contact-v1",consentedAt:now});const again=await postgresRepository.createInquiry({id:key(),idempotencyKey,name:"Synthetic Test",email:"test@example.invalid",type:"project",message:"A sufficiently long synthetic PostgreSQL contract test.",budget:null,timeline:null,consentVersion:"inquiry-contact-v1",consentedAt:now});expect(first).toMatchObject({id,replayed:false});expect(again).toMatchObject({id,replayed:true});const row=await cleanupPool!.query("SELECT count(*)::int AS count FROM notification_jobs WHERE inquiry_id=$1",[id]);expect(row.rows[0].count).toBe(1);});
  it("applies a persistent rate limit through the runtime role",async()=>{const bucket=`contract-test-${key()}`;expect(await postgresRepository.consumeRateLimit(bucket,new Date().toISOString(),1,3600000)).toMatchObject({allowed:true});expect(await postgresRepository.consumeRateLimit(bucket,new Date().toISOString(),1,3600000)).toMatchObject({allowed:false});});
});
