import type { ProjectImage, ProjectRecord } from "@/lib/projects/types";

function arrayValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; }
    catch { return []; }
  }
  return [];
}

function iso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value ?? "");
}

export function mapProject(row: Record<string, unknown>, imageRows: Record<string, unknown>[]): ProjectRecord {
  const slug = String(row.slug);
  const images: ProjectImage[] = imageRows.map((image) => ({
    id: String(image.id),
    alt: String(image.alt_text),
    width: Number(image.width),
    height: Number(image.height),
    src: `/api/projects/${encodeURIComponent(slug)}/images/${encodeURIComponent(String(image.id))}`,
  }));
  return {
    id: String(row.id), slug, title: String(row.title), summary: String(row.summary), description: String(row.description),
    projectType: row.project_type as ProjectRecord["projectType"],
    status: row.status as ProjectRecord["status"],
    role: String(row.role ?? ""), context: String(row.context ?? ""),
    constraints: arrayValue(row.constraints_json), solution: String(row.solution ?? ""),
    decisions: arrayValue(row.decisions_json), technologies: arrayValue(row.technologies_json),
    evidence: arrayValue(row.evidence_json), results: String(row.results ?? ""),
    limitations: arrayValue(row.limitations_json), lessons: arrayValue(row.lessons_json),
    demoUrl: row.demo_url ? String(row.demo_url) : null,
    githubUrl: row.github_url ? String(row.github_url) : null,
    published: row.published === true || row.published === 1,
    createdAt: iso(row.created_at), updatedAt: iso(row.updated_at), images,
  };
}
