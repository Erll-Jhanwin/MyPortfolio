import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CircleDashed } from "lucide-react";
import type { Project } from "@/content/projects";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return <Link className="project-card" href={`/projects/${project.slug}`}>
    <div className={`project-art project-art-${index % 3}`}>{project.screenshots?.[0] ? <Image src={project.screenshots[0].src} alt={project.screenshots[0].alt} fill sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 360px" /> : <CircleDashed size={74} strokeWidth={0.7} aria-hidden="true" />}<span className="project-art-index" aria-hidden="true">0{index + 1}</span></div>
    <div className="project-card-info"><div><p className="eyebrow">{project.type} · {project.status}</p><h3>{project.title}</h3><p>{project.summary}</p></div><span className="circle-link"><ArrowUpRight size={17} aria-hidden="true" /></span></div>
    <div className="project-tags">{project.stack.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
  </Link>;
}
