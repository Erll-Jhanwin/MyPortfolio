import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/server/admin-auth";
import { originAllowed } from "@/lib/server/request-guards";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  await clearAdminSession();
  return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
}
