import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/server/admin-auth";
import { originAllowed } from "@/lib/server/request-guards";
import { repository } from "@/lib/server/repositories";

export const runtime = "nodejs";
const maxUploadBytes = 5 * 1024 * 1024;
const maxBodyBytes = maxUploadBytes + 32 * 1024;
type RouteContext = { params: Promise<{ id: string }> };

async function readLimited(request: Request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!originAllowed(request)) return NextResponse.json({ message: "This request could not be accepted." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) return NextResponse.json({ message: "Image uploads are limited to 5 MB each." }, { status: 413 });
  const { id } = await context.params;
  try {
    const repo = repository();
    if (!await repo.getProjectById(id)) return NextResponse.json({ message: "Project not found." }, { status: 404 });
    if (await repo.countProjectImages(id) >= 6) return NextResponse.json({ message: "A project can have up to six images." }, { status: 400 });
    const bytes = await readLimited(request);
    if (!bytes) return NextResponse.json({ message: "Image upload is too large." }, { status: 413 });
    const contentType = request.headers.get("content-type") ?? "";
    const form = await new Response(bytes, { headers: { "content-type": contentType } }).formData();
    const file = form.get("image");
    const alt = String(form.get("alt") ?? "").trim();
    if (!(file instanceof File) || !file.size || file.size > maxUploadBytes) return NextResponse.json({ message: "Choose a JPEG, PNG, or WebP image up to 5 MB." }, { status: 400 });
    if (alt.length < 5 || alt.length > 160) return NextResponse.json({ message: "Add descriptive alt text between 5 and 160 characters." }, { status: 400 });
    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input, { limitInputPixels: 25_000_000, failOn: "error" }).metadata();
    if (!metadata.width || !metadata.height || !["jpeg", "png", "webp"].includes(metadata.format ?? "")) return NextResponse.json({ message: "Only valid JPEG, PNG, or WebP images are supported." }, { status: 400 });
    const output = await sharp(input, { limitInputPixels: 25_000_000, failOn: "error" }).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 84, effort: 4 }).toBuffer({ resolveWithObject: true });
    if (output.data.byteLength > 2 * 1024 * 1024) return NextResponse.json({ message: "This image cannot be compressed within the 2 MB storage limit." }, { status: 400 });
    await repo.addProjectImage({ id: randomUUID(), projectId: id, alt, width: output.info.width, height: output.info.height, data: output.data });
    return NextResponse.json({ uploaded: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin_project_image_upload_failed", { code: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ message: "The image could not be uploaded. Check its format and try again." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
