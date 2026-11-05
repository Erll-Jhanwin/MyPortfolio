import { z } from "zod";

const lineList = z.array(z.string().trim().min(1).max(160)).max(20);
const optionalHttpsUrl = z.string().trim().max(2048).refine((value) => !value || /^https:\/\//i.test(value), "Use an HTTPS URL.").transform((value) => value || null);

export const adminProjectSchema = z.object({
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(8000),
  projectType: z.enum(["academic", "personal", "team", "paid", "volunteer"]),
  status: z.enum(["prototype", "in-development", "complete", "archived"]),
  role: z.string().trim().max(500),
  context: z.string().trim().max(1500),
  constraints: lineList,
  solution: z.string().trim().max(5000),
  decisions: lineList,
  technologies: z.array(z.string().trim().min(1).max(40)).max(20),
  evidence: lineList,
  results: z.string().trim().max(3000),
  limitations: lineList,
  lessons: lineList,
  demoUrl: optionalHttpsUrl,
  githubUrl: optionalHttpsUrl,
  published: z.boolean(),
}).strict();

export type ValidatedProject = z.infer<typeof adminProjectSchema>;
