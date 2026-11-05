import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkLimit, originAllowed, readJsonBounded } from "@/lib/server/request-guards";
import { privacySchema } from "@/lib/server/validation";
import { repository } from "@/lib/server/repositories";

export const runtime = "nodejs";
const neutral = { message: "If the request can be accepted, it has been recorded for review. The operator may need to verify ownership before responding." };

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const body = await readJsonBounded(request);
  if (!body.ok) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  try {
    const rate = await checkLimit(request, "privacy", 3, 60 * 60 * 1000);
    if (!rate.allowed) return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter), "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("privacy_rate_limit_unavailable", { code: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ message: "We couldn’t safely accept this request right now." }, { status: 503 });
  }
  const parsed = privacySchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ message: "Please provide a valid email and request type." }, { status: 400 });
  const data = parsed.data;
  if (data.website) return NextResponse.json(neutral, { status: 202, headers: { "Cache-Control": "no-store" } });
  try {
    await repository().createPrivacyRequest({ id: randomUUID(), idempotencyKey: data.idempotencyKey, email: data.email.toLowerCase(), type: data.type, details: data.details || null, createdAt: new Date().toISOString() });
    return NextResponse.json(neutral, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("privacy_request_save_failed", { code: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ message: "The request could not be safely recorded. Please try again later." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
