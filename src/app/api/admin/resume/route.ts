import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { originAllowed, readJsonBounded } from "@/lib/server/request-guards";
import { repository } from "@/lib/server/repositories";
import { resumeDocumentSchema } from "@/lib/server/resume-validation";
import { errorsOf } from "@/lib/server/validation";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try { return NextResponse.json(await repository().getResume(), { headers }); }
  catch (error) { console.error("admin_resume_load_failed", { code: error instanceof Error ? error.name : "unknown" }); return NextResponse.json({ message: "The résumé could not be loaded." }, { status: 503, headers }); }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers });
  const body = await readJsonBounded(request, 256 * 1024);
  const parsed = body.ok ? resumeDocumentSchema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ message: "Review the résumé fields.", errors: parsed && !parsed.success ? errorsOf(parsed.error.issues) : { form: "The request is too large or invalid." } }, { status: 400, headers });
  try { return NextResponse.json(await repository().saveResumeDraft(parsed.data), { headers }); }
  catch (error) { console.error("admin_resume_save_failed", { code: error instanceof Error ? error.name : "unknown" }); return NextResponse.json({ message: "The résumé draft could not be saved." }, { status: 503, headers }); }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers });
  try { return NextResponse.json(await repository().publishResume(), { headers }); }
  catch (error) { console.error("admin_resume_publish_failed", { code: error instanceof Error ? error.name : "unknown" }); return NextResponse.json({ message: "The résumé could not be published." }, { status: 503, headers }); }
}
