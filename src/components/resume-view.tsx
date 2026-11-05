import Link from "next/link";
import { ArrowUpRight, Award, BriefcaseBusiness, Code2, ExternalLink, GraduationCap, Mail, MapPin, MoonStar, Phone, UserRound } from "lucide-react";
import type { ResumeDocument } from "@/lib/resume/types";
import { ResumeSkillBadges } from "@/components/resume-skill-badges";

function SectionTitle({ icon: Icon, children }: { icon: typeof BriefcaseBusiness; children: React.ReactNode }) {
  return <div className="resume-section-title"><span className="resume-section-icon"><Icon size={19} aria-hidden="true" /></span><h2>{children}</h2></div>;
}

function telHref(phone: string) { return `tel:${phone.replace(/[^+\d]/g, "")}`; }

export function ResumeView({ resume, preview = false }: { resume: ResumeDocument; preview?: boolean }) {
  return <>
    {preview && <div className="resume-preview-label">Draft preview · public page design</div>}
    <section className="page-hero resume-hero">
      <div className="container">
        <p className="eyebrow">Résumé</p>
        <div className="resume-heading-row"><div><h1>{resume.name}</h1><p className="resume-subtitle">{resume.headline}</p></div><span className="resume-heading-mark" aria-hidden="true"><Code2 size={31} /></span></div>
        <div className="resume-contact-bar" aria-label="Contact information">
          {resume.contact.email && <a href={`mailto:${resume.contact.email}`}><Mail size={16} aria-hidden="true" /><span>{resume.contact.email}</span></a>}
          {resume.contact.phone && <a href={telHref(resume.contact.phone)}><Phone size={16} aria-hidden="true" /><span>{resume.contact.phone}</span></a>}
          {resume.contact.location && <span><MapPin size={16} aria-hidden="true" /><span>{resume.contact.location}</span></span>}
          {resume.socialLinks.map((social) => <a key={social.id} href={social.url} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" /><span>{social.label}</span></a>)}
        </div>
      </div>
    </section>

    <section className="page-body resume-page-body"><div className="container resume-layout">
      <aside className="resume-sidebar">
        <section className="resume-summary-card"><p className="eyebrow">Profile</p><h2>{resume.summaryTitle}</h2>{resume.summary.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}<Link className="button button-dark resume-contact-cta" href="/contact">Discuss an opportunity <ArrowUpRight size={15} aria-hidden="true" /></Link></section>
        {resume.customSections.filter((section) => section.id === "additional-information").map((section) => <section className="resume-extra-card" key={section.id}><div className="resume-extra-heading"><MoonStar size={17} aria-hidden="true" /><h2>{section.title}</h2></div>{section.body && <p>{section.body}</p>}{section.items.length > 0 && <ul>{section.items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}</section>)}
      </aside>

      <div className="resume-main-column">
        {resume.experience.length > 0 && <section className="resume-section"><SectionTitle icon={BriefcaseBusiness}>Work experience</SectionTitle><div className="resume-timeline">{resume.experience.map((job) => <article className="resume-entry" key={job.id}><span className="resume-timeline-node" aria-hidden="true"><BriefcaseBusiness size={15} /></span><div className="resume-entry-heading"><div><h3>{job.role}</h3><p className="resume-org">{job.organization}</p></div>{job.dates && <span className="resume-dates">{job.dates}</span>}</div>{job.location && <p className="resume-location"><MapPin size={13} aria-hidden="true" />{job.location}</p>}{job.points.length > 0 && <ul className="resume-bullets">{job.points.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}</ul>}</article>)}</div></section>}
        {resume.education.length > 0 && <section className="resume-section"><SectionTitle icon={GraduationCap}>Education</SectionTitle><div className="resume-education-list">{resume.education.map((item) => <article className="resume-education-entry" key={item.id}><span className="resume-education-year">{item.dates}</span><div><h3>{item.credential}</h3>{item.details.map((detail, index) => <p className="resume-org" key={`${index}-${detail}`}>{detail}</p>)}<p>{item.institution}</p>{item.note && <span className="resume-education-note">{item.note}</span>}</div></article>)}</div></section>}
        {resume.skills.length > 0 && <section className="resume-section"><SectionTitle icon={Code2}>Skills</SectionTitle><div className="resume-skills-grid">{resume.skills.map((group) => <article className="resume-skill-group" key={group.id}><h3>{group.title}</h3><ResumeSkillBadges skills={group.items} /></article>)}</div></section>}
        {resume.projects.length > 0 && <section className="resume-section"><SectionTitle icon={Code2}>Projects</SectionTitle><div className="resume-education-list">{resume.projects.map((project) => <article className="resume-education-entry" key={project.id}><span className="resume-education-year">{project.dates}</span><div><h3>{project.url ? <a href={project.url} target="_blank" rel="noreferrer">{project.title} <ExternalLink size={13} aria-hidden="true" /></a> : project.title}</h3>{project.organization && <p className="resume-org">{project.organization}</p>}{project.summary && <p>{project.summary}</p>}{project.highlights.length > 0 && <ul className="resume-bullets">{project.highlights.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}</div></article>)}</div></section>}
        {resume.certifications.length > 0 && <section className="resume-section"><SectionTitle icon={Award}>Certifications</SectionTitle><div className="resume-education-list">{resume.certifications.map((cert) => <article className="resume-education-entry" key={cert.id}><span className="resume-education-year">{cert.date}</span><div><h3>{cert.credentialUrl ? <a href={cert.credentialUrl} target="_blank" rel="noreferrer">{cert.title} <ExternalLink size={13} aria-hidden="true" /></a> : cert.title}</h3>{cert.issuer && <p>{cert.issuer}</p>}</div></article>)}</div></section>}
        {resume.customSections.filter((section) => section.id !== "additional-information").map((section) => <section className="resume-section" key={section.id}><SectionTitle icon={UserRound}>{section.title}</SectionTitle>{section.body && <p className="resume-references-copy">{section.body}</p>}{section.items.length > 0 && <ul className="resume-bullets">{section.items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}</section>)}
      </div>
    </div></section>
  </>;
}
