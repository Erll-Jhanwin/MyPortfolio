import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { adminProjectSchema } from "@/lib/server/admin-project-validation";
import { errorsOf } from "@/lib/server/validation";
import { originAllowed, readJsonBounded } from "@/lib/server/request-guards";
import { repository } from "@/lib/server/repositories";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers });
  const { id } = await context.params;
  const body = await readJsonBounded(request, 64 * 1024);
  const parsed = body.ok ? adminProjectSchema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ message: "Review the project fields.", errors: parsed && !parsed.success ? errorsOf(parsed.error.issues) : { form: "The request is too large or invalid." } }, { status: 400, headers });
  try {
    if (!await repository().getProjectById(id)) return NextResponse.json({ message: "Project not found." }, { status: 404, headers });
    const project = await repository().saveProject(parsed.data, id);
    return NextResponse.json({ project }, { headers });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "SQLITE_CONSTRAINT_UNIQUE" || code === "23505") return NextResponse.json({ message: "That project URL is already in use. Change the project slug." }, { status: 409, headers });
    console.error("admin_project_update_failed", { code: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ message: "The project could not be saved." }, { status: 503, headers });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers });
  const { id } = await context.params;
  try { return NextResponse.json({ deleted: await repository().deleteProject(id) }, { headers }); }
  catch (error) { console.error("admin_project_delete_failed", { code: error instanceof Error ? error.name : "unknown" }); return NextResponse.json({ message: "The project could not be deleted." }, { status: 503, headers }); }
}
