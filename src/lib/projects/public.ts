import "server-only";
import { projects as staticProjects } from "@/content/projects";
import type { ProjectRecord, PublicProject } from "./types";
import { repository } from "@/lib/server/repositories";

function toPublicProject(project: ProjectRecord): PublicProject {
  const status = project.status.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    type: project.projectType,
    status,
    role: project.role,
    problem: project.description,
    context: project.context,
    constraints: project.constraints,
    solution: project.solution,
    decisions: project.decisions,
    stack: project.technologies,
    screenshots: project.images.map((image) => ({ src: image.src, alt: image.alt, caption: image.alt, width: image.width, height: image.height })),
    evidence: project.evidence,
    results: project.results,
    limitations: project.limitations,
    lessons: project.lessons,
    demoUrl: project.demoUrl ?? undefined,
    repositoryUrl: project.githubUrl ?? undefined,
    updatedAt: project.updatedAt,
  };
}

export async function getPublishedProjects() {
  const managed = await repository().listProjects(false);
  const dynamicProjects = managed.map(toPublicProject);
  return [...dynamicProjects, ...staticProjects];
}

export async function getPublishedProject(slug: string) {
  const managed = await repository().getProjectBySlug(slug);
  if (managed) return toPublicProject(managed);
  return staticProjects.find((project) => project.slug === slug) ?? null;
}
