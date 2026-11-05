import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import path from "node:path";
import { sqliteRepository } from "../src/lib/server/repositories/sqlite";
import type { ProjectDraft } from "../src/lib/projects/types";

const db = globalThis as typeof globalThis & { portfolioDb?: Database.Database };
const migration = (name: string) => readFileSync(path.join(process.cwd(), "db/sqlite/migrations", name), "utf8");

describe("SQLite managed project contract", () => {
  beforeEach(() => {
    process.env.SQLITE_PATH = ":memory:";
    db.portfolioDb = new Database(":memory:");
    db.portfolioDb.pragma("foreign_keys=ON");
    db.portfolioDb.exec(migration("001_initial.sql"));
    db.portfolioDb.exec(migration("002_projects.sql"));
  });
  afterEach(() => { db.portfolioDb?.close(); delete db.portfolioDb; });

  const draft = (overrides: Partial<ProjectDraft> = {}): ProjectDraft => ({
    slug: "service-workflow-demo", title: "Service Workflow Demo", summary: "A small project summary.", description: "A clear description of the project and what it does.",
    projectType: "academic", status: "prototype", role: "", context: "", constraints: [], solution: "", decisions: [], technologies: ["Next.js"],
    evidence: [], results: "", limitations: [], lessons: [], demoUrl: null, githubUrl: null, published: false, ...overrides,
  });

  it("keeps drafts private and immediately exposes a published project by slug", async () => {
    const created = await sqliteRepository.saveProject(draft());
    expect(created.published).toBe(false);
    expect(await sqliteRepository.listProjects(false)).toHaveLength(0);
    const published = await sqliteRepository.saveProject(draft({ published: true, summary: "Updated summary." }), created.id);
    expect(published.id).toBe(created.id);
    expect(published.summary).toBe("Updated summary.");
    expect(await sqliteRepository.getProjectBySlug(created.slug)).toMatchObject({ id: created.id, published: true });
  });

  it("stores bounded image bytes, enforces the per-project limit, and cascades deletes", async () => {
    const project = await sqliteRepository.saveProject(draft({ published: true }));
    const additions = Array.from({ length: 7 }, (_, index) => sqliteRepository.addProjectImage({
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      projectId: project.id, alt: `Screenshot ${index + 1}`, width: 800, height: 600, data: Buffer.from([1, 2, 3, index]),
    }));
    const outcomes = await Promise.allSettled(additions);
    expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(6);
    expect(await sqliteRepository.countProjectImages(project.id)).toBe(6);
    const image = await sqliteRepository.getProjectImage(project.id, "00000000-0000-4000-8000-000000000001");
    expect(image).toMatchObject({ mimeType: "image/webp", published: true, width: 800, height: 600 });
    expect(image?.data).toEqual(Buffer.from([1, 2, 3, 0]));
    expect(await sqliteRepository.deleteProject(project.id)).toBe(true);
    expect(await sqliteRepository.countProjectImages(project.id)).toBe(0);
  });
});
