import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { getPublishedProject } from "@/lib/projects/public";
import { safeExternalUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) notFound();
  const demoUrl = safeExternalUrl(project.demoUrl);
  const repositoryUrl = safeExternalUrl(project.repositoryUrl);
  return <>
    <section className="page-hero"><div className="container page-heading">
      <Link className="text-link" href="/projects"><ArrowLeft size={15} /> All projects</Link>
      <p className="eyebrow" style={{ marginTop: 25 }}>{project.type} project · {project.status}</p>
      <h1>{project.title}</h1><p>{project.summary}</p>
      <div className="case-meta">{project.stack.map((item) => <span className="tag" key={item}>{item}</span>)}</div>
    </div></section>
    <section className="page-body"><div className="container case-grid">
      <article className="case-content">
        {project.screenshots.map((image) => <figure className="case-image" key={image.src}><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 780px) 100vw, 780px" /><figcaption>{image.caption}</figcaption></figure>)}
        <h2>Project description</h2><p>{project.problem}</p>
        {project.context || project.role ? <><h2>Project context and my role</h2>{project.context && <p>{project.context}</p>}{project.role && <p>{project.role}</p>}</> : null}
        {project.constraints.length ? <><h2>Constraints</h2><ul className="policy-list">{project.constraints.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
        {project.solution && <><h2>Solution</h2><p>{project.solution}</p></>}
        {project.decisions.length ? <><h2>Technical decisions</h2><ul className="policy-list">{project.decisions.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
        {project.results || project.evidence.length ? <><h2>Evidence and results</h2>{project.results && <p>{project.results}</p>}{project.evidence.length > 0 && <ul className="policy-list">{project.evidence.map((item) => <li key={item}>{item}</li>)}</ul>}</> : null}
        {project.limitations.length ? <><h2>Limitations</h2><ul className="policy-list">{project.limitations.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
        {project.lessons.length ? <><h2>Lessons</h2><ul className="policy-list">{project.lessons.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
        <p className="policy-meta">Last updated {project.updatedAt}</p>
      </article>
      <aside className="case-aside"><p className="eyebrow">Continue the conversation</p><h3>Working through something similar?</h3><p>Share the context and we can discuss a sensible next step.</p><Link className="text-link" href="/contact">Discuss your project <ArrowUpRight size={15} /></Link>
        <div className="case-links">{demoUrl && <a className="text-link" href={demoUrl} target="_blank" rel="noopener noreferrer">Live demo <ExternalLink size={14} /></a>}{repositoryUrl && <a className="text-link" href={repositoryUrl} target="_blank" rel="noopener noreferrer">Source code <ExternalLink size={14} /></a>}</div>
      </aside>
    </div></section>
  </>;
}
