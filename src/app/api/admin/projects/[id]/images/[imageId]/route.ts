import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { originAllowed } from "@/lib/server/request-guards";
import { repository } from "@/lib/server/repositories";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string; imageId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id, imageId } = await context.params;
  const image = await repository().getProjectImage(id, imageId);
  if (!image) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  return new Response(new Uint8Array(image.data), { headers: { "Content-Type": image.mimeType, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store", "Content-Length": String(image.data.byteLength) } });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const { id, imageId } = await context.params;
  return NextResponse.json({ deleted: await repository().deleteProjectImage(id, imageId) }, { headers: { "Cache-Control": "no-store" } });
}
