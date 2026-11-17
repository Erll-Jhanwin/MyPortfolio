import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { repository } from "./repositories";

export async function readJsonBounded(request:Request,maxBytes=16*1024):Promise<{ok:true;value:unknown}|{ok:false}>{const declared=Number(request.headers.get("content-length"));if(Number.isFinite(declared)&&declared>maxBytes)return {ok:false};if(!request.body)return {ok:true,value:null};const reader=request.body.getReader();const chunks:Uint8Array[]=[];let size=0;try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();return {ok:false};}chunks.push(value);}}finally{reader.releaseLock();}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}try{return {ok:true,value:JSON.parse(new TextDecoder().decode(bytes))}}catch{return {ok:true,value:null}}}
export function originAllowed(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  if (originUrl.origin === "null") return false;

  const configuredUrl = process.env.APP_URL;
  if (configuredUrl) {
    try {
      if (originUrl.origin === new URL(configuredUrl).origin) return true;
    } catch {
      // A stale or invalid APP_URL should not prevent requests from the current host.
    }
  }

  // APP_URL is also used for canonical links, but hosted preview/custom domains
  // can differ from it. Match against the public authority supplied with this
  // request so browser requests to the same site still pass the CSRF check.
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || request.nextUrl.protocol.replace(/:$/, "");
  if (!host || (protocol !== "http" && protocol !== "https")) return false;

  try {
    return originUrl.origin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}
function rateDigest(request:NextRequest,scope:string){const secret=process.env.RATE_LIMIT_SECRET??process.env.WORKER_SECRET;if(!secret||secret.length<32)throw new Error("rate_limit_secret_not_configured");const address=request.headers.get("x-real-ip")??request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown";return createHmac("sha256",secret).update(`${scope}:${address}`).digest("hex");}
export async function checkLimit(request:NextRequest,scope:string,limit:number,windowMs:number){const key=rateDigest(request,scope);return repository().consumeRateLimit(key,new Date().toISOString(),limit,windowMs);}
export function equalSecret(actual:string|undefined,expected:string){if(!actual)return false;const a=Buffer.from(actual);const b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)}
