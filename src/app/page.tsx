import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Code2, Compass, Layers3 } from "lucide-react";
import { getPublishedProjects } from "@/lib/projects/public";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getPublishedProjects();
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><p className="eyebrow">Student developer · Service Management</p>
        <h1>Good software starts with <em>understanding.</em></h1>
        <p className="hero-lede">I’m Erll, a fourth-year BSIT student majoring in Service Management. I build web and app projects with a focus on usability, clear workflows, and practical solutions.</p>
        <div className="hero-actions"><Link className="button button-dark" href="/contact">Discuss your project <ArrowUpRight size={16} aria-hidden="true" /></Link><Link className="button button-outline" href="/projects">Explore my work <ArrowDownRight size={16} aria-hidden="true" /></Link></div>
        <p className="hero-note"><span /> Project-led, practical, and built through clear collaboration.</p>
      </div>
      <figure className="hero-visual hero-portrait">
        <span className="portrait-panel portrait-panel-charcoal" aria-hidden="true" />
        <span className="portrait-panel portrait-panel-lime" aria-hidden="true" />
        <div className="portrait-layer portrait-photo-layer">
          <Image src="/images/erll-portrait.webp" alt="Erll in a dark hoodie, photographed in a computer workspace." width={1000} height={1000} priority sizes="(max-width: 680px) calc(100vw - 36px), (max-width: 1160px) 40vw, 480px" className="hero-portrait-image" />
          <span className="portrait-frame" aria-hidden="true" />
          <span className="portrait-index" aria-hidden="true">01 / 04</span>
        </div>
        <span className="portrait-accent" aria-hidden="true" />
        <figcaption className="portrait-caption"><span aria-hidden="true" />Erll · Student developer</figcaption>
      </figure>
    </div></section>
    <section className="trust-strip"><div className="container trust-inner"><p>How I approach the work</p><div className="trust-items"><span><Compass size={15} /> Start with the problem</span><span><Layers3 size={15} /> Make the workflow clear</span><span><Code2 size={15} /> Build with care</span></div></div></section>

    <section className="section" id="work"><div className="container"><SectionHeading eyebrow="Selected work" title="Projects with a point of view." action={<Link className="text-link" href="/projects">View all projects <ArrowRight size={15} /></Link>}>A closer look at the problem, what I contributed, and what the project can actually demonstrate.</SectionHeading>
      {projects.length ? <div className="project-grid">{projects.slice(0, 3).map((project, i) => <ProjectCard key={project.slug} project={project} index={i} />)}</div> : <div className="empty-state"><div className="empty-icon"><Code2 size={21} /></div><h3>Case studies are being prepared.</h3><p>No project has been published yet. I’ll share work here once I can document the context, my contribution, and the evidence clearly.</p><Link className="text-link" href="/projects">Visit the projects page <ArrowRight size={15} /></Link></div>}
    </div></section>

    <section className="section section-soft"><div className="container split"><div className="split-aside"><p className="eyebrow">What I can help with</p><h2 className="section-heading" style={{display:"block", marginBottom:20}}><span style={{font:"400 clamp(39px,4.4vw,56px)/1.08 var(--sans)",letterSpacing:"-.035em"}}>Useful software for real work.</span></h2><Link className="text-link" href="/services">Explore services <ArrowRight size={15} /></Link></div><div className="split-copy"><p>Good outcomes begin with the right question. I take time to understand how people work today, where things get stuck, and what a useful improvement would look like.</p><ul className="check-list"><li><Check size={17} /> Websites that explain your work and help people take action.</li><li><Check size={17} /> Web applications that make everyday workflows easier to follow.</li><li><Check size={17} /> Practical handover and support scoped around the project.</li></ul><p>Every engagement starts with a conversation. Scope, timing, costs, and deliverables are agreed in writing before paid work begins.</p></div></div></section>

    <section className="section section-dark"><div className="container"><SectionHeading eyebrow="A clear process" title="Thoughtful work, one step at a time." /><div className="process-grid">{[{n:"01",t:"Listen",p:"Understand the people, goals, constraints, and current process."},{n:"02",t:"Shape",p:"Agree what matters now, what is out of scope, and how we will know it works."},{n:"03",t:"Build",p:"Work in visible steps, share progress, and review together."},{n:"04",t:"Hand over",p:"Document the work and agree on any follow-up support."}].map(x=><article className="process-step" key={x.n}><span className="process-no">{x.n} / 04</span><h3>{x.t}</h3><p>{x.p}</p></article>)}</div><p style={{fontSize:11,color:"#ffffff8f",marginTop:24}}>Final scope, schedule, revisions, ownership, and fees are confirmed in a written proposal.</p></div></section>

    <section className="section home-about-section"><div className="container split"><div className="split-aside"><p className="eyebrow">A little about me</p><h2 className="section-heading" style={{display:"block"}}><span style={{font:"400 clamp(39px,4.4vw,56px)/1.08 var(--sans)",letterSpacing:"-.035em"}}>Technology, with people in mind.</span></h2></div><div className="split-copy"><p>I’m pursuing a Bachelor of Science in Information Technology, majoring in Service Management. I enjoy the space where useful systems, thoughtful design, and everyday needs meet.</p><p>My academic status and project experience are described as they are. I’ll share more about each project as I’m able to document the work and my contribution accurately.</p><Link className="text-link" href="/about">More about how I work <ArrowRight size={15} /></Link></div></div></section>
  </>;
}
