import type { Metadata } from "next";
import Link from "next/link";
import { Code2, ArrowUpRight } from "lucide-react";
import { getPublishedProjects } from "@/lib/projects/public";
import { ProjectCard } from "@/components/project-card";
export const metadata: Metadata = { title: "Projects", description: "Project work and case studies by Erll." };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return <><section className="page-hero"><div className="container page-heading"><p className="eyebrow">Selected work</p><h1>Work, with the thinking included.</h1><p>Each case study will explain the context, my specific role, the decisions behind the build, and what the evidence can show.</p></div></section><section className="page-body"><div className="container">
    {projects.length ? <div className="project-grid">{projects.map((project,i)=><ProjectCard key={project.slug} project={project} index={i} />)}</div> : <div className="empty-state"><div className="empty-icon"><Code2 size={21}/></div><h2>Project case studies are not published yet.</h2><p>I’m preparing project write-ups with accurate ownership, context, evidence, and permission to share. There are no public case studies to review yet.</p><Link className="button button-dark" href="/contact">Ask about my work <ArrowUpRight size={15}/></Link></div>}
  </div></section></>;
}
