import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clearAdminSession, adminIsConfigured, setAdminSession, verifyAdminCredentials } from "@/lib/server/admin-auth";
import { checkLimit, originAllowed, readJsonBounded } from "@/lib/server/request-guards";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
const loginSchema = z.object({ username: z.string().trim().min(1).max(128), password: z.string().min(1).max(1024) }).strict();

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers });
  if (!adminIsConfigured()) return NextResponse.json({ message: "Admin sign-in has not been configured." }, { status: 503, headers });
  let rate: Awaited<ReturnType<typeof checkLimit>>;
  try { rate = await checkLimit(request, "admin-login", 5, 15 * 60 * 1000); }
  catch (error) { console.error("admin_login_rate_limit_unavailable", { code: error instanceof Error ? error.name : "unknown" }); return NextResponse.json({ message: "Sign-in is temporarily unavailable." }, { status: 503, headers }); }
  if (!rate.allowed) return NextResponse.json({ message: "Too many sign-in attempts. Try again later." }, { status: 429, headers: { ...headers, "Retry-After": String(rate.retryAfter) } });

  const body = await readJsonBounded(request, 4 * 1024);
  const parsed = body.ok ? loginSchema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ message: "Enter your admin username and password." }, { status: 400, headers });
  try {
    if (!await verifyAdminCredentials(parsed.data.username, parsed.data.password)) return NextResponse.json({ message: "The username or password is incorrect." }, { status: 401, headers });
    await setAdminSession();
    return NextResponse.json({ authenticated: true }, { headers });
  } catch (error) {
    console.error("admin_login_failed", { code: error instanceof Error ? error.name : "unknown" });
    await clearAdminSession();
    return NextResponse.json({ message: "Sign-in is temporarily unavailable." }, { status: 503, headers });
  }
}
