import { repository } from "@/lib/server/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ slug: string; imageId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug, imageId } = await context.params;
    const repo = repository();
    const project = await repo.getProjectBySlug(slug);
    if (!project || !project.published) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    const image = await repo.getProjectImage(project.id, imageId);
    if (!image) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    return new Response(new Uint8Array(image.data), { headers: { "Content-Type": image.mimeType, "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=60, must-revalidate", "Content-Length": String(image.data.byteLength) } });
  } catch {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
}
