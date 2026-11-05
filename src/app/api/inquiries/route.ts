import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkLimit, originAllowed, readJsonBounded } from "@/lib/server/request-guards";
import { errorsOf, inquirySchema } from "@/lib/server/validation";
import { repository } from "@/lib/server/repositories";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers });
  const body = await readJsonBounded(request);
  if (!body.ok) return NextResponse.json({ message: "Request is too large." }, { status: 413, headers });

  let rate: Awaited<ReturnType<typeof checkLimit>>;
  try { rate = await checkLimit(request, "inquiry", 5, 60 * 60 * 1000); }
  catch (error) { console.error("inquiry_rate_limit_unavailable", { code: error instanceof Error ? error.name : "unknown" }); return NextResponse.json({ message: "We couldn’t safely accept this request right now." }, { status: 503, headers }); }
  if (!rate.allowed) return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429, headers: { ...headers, "Retry-After": String(rate.retryAfter) } });

  const parsed = inquirySchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ message: "Please check the highlighted fields.", errors: errorsOf(parsed.error.issues) }, { status: 400, headers });
  const data = parsed.data;
  if (!data.consent) return NextResponse.json({ message: "Consent is required to respond to this inquiry.", errors: { consent: "Please agree before sending." } }, { status: 400, headers });
  if (!data.adultConfirmed) return NextResponse.json({ message: "Please confirm the age requirement.", errors: { adultConfirmed: "Please confirm you are at least 18." } }, { status: 400, headers });
  if (data.website) return NextResponse.json({ receiptId: randomUUID() }, { status: 201, headers });

  try {
    const now = new Date().toISOString();
    const result = await repository().createInquiry({ id: randomUUID(), idempotencyKey: data.idempotencyKey, name: data.name, email: data.email.toLowerCase(), type: data.type, message: data.message, budget: data.budget || null, timeline: data.timeline || null, consentVersion: "inquiry-contact-v1", consentedAt: now });
    return NextResponse.json({ receiptId: result.id, replayed: result.replayed }, { status: 201, headers });
  } catch (error) {
    console.error("inquiry_save_failed", { code: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ message: "We couldn’t save your inquiry. Please try again shortly." }, { status: 503, headers });
  }
}
