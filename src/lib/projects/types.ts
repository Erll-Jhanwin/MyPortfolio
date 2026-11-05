export type ProjectKind = "academic" | "personal" | "team" | "paid" | "volunteer";
export type ProjectState = "prototype" | "in-development" | "complete" | "archived";

export type ProjectImage = {
  id: string;
  alt: string;
  width: number;
  height: number;
  src: string;
};

export type ProjectDraft = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  projectType: ProjectKind;
  status: ProjectState;
  role: string;
  context: string;
  constraints: string[];
  solution: string;
  decisions: string[];
  technologies: string[];
  evidence: string[];
  results: string;
  limitations: string[];
  lessons: string[];
  demoUrl: string | null;
  githubUrl: string | null;
  published: boolean;
};

export type ProjectRecord = ProjectDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
  images: ProjectImage[];
};

export type PublicProject = {
  slug: string;
  title: string;
  summary: string;
  type: ProjectKind;
  status: string;
  role: string;
  problem: string;
  context: string;
  constraints: string[];
  solution: string;
  decisions: string[];
  stack: string[];
  screenshots: { src: string; alt: string; caption: string; width: number; height: number }[];
  evidence: string[];
  results: string;
  limitations: string[];
  lessons: string[];
  demoUrl?: string;
  repositoryUrl?: string;
  updatedAt: string;
};

export type ProjectImageInput = {
  id: string;
  projectId: string;
  alt: string;
  width: number;
  height: number;
  data: Buffer;
};

export type ProjectImageRecord = ProjectImageInput & {
  mimeType: "image/webp";
  published: boolean;
};
