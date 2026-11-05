import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Mail,
  MapPin,
  MoonStar,
  Phone,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Education, work experience, and skills of Erll Jhanwin P. Catapang.",
};

const experience = [
  {
    role: "Team Leader",
    organization: "Jollibee SM Lipa",
    location: "Lipa City, Batangas",
    dates: "June 2024 – August 2026",
    icon: BriefcaseBusiness,
    points: [
      "Led and supported team members in delivering efficient, quality customer service.",
      "Handled customer concerns professionally and provided appropriate resolutions.",
      "Coordinated daily tasks and ensured team members followed operational procedures.",
      "Worked in a fast-paced environment while maintaining service quality.",
      "Assisted in training and guiding team members to improve performance.",
      "Applied leadership, communication, teamwork, and problem-solving skills.",
    ],
  },
  {
    role: "Work Immersion",
    organization: "Alitagtag Local Government Unit (MDRRMO)",
    location: "Alitagtag, Batangas",
    dates: "February 2023 – March 2023",
    icon: UserRound,
    points: [
      "Created rainfall advisory graphics for public information and awareness.",
      "Assisted in developing and organizing the department’s Citizen’s Charter.",
    ],
  },
];

const coreSkills = [
  "Customer service",
  "Verbal communication",
  "Active listening",
  "Problem solving",
  "Team leadership",
  "Conflict resolution",
  "Adaptability",
  "Time management",
  "Attention to detail",
  "Multitasking",
  "Willingness to learn",
];

const technicalSkills = [
  "HTML",
  "CSS",
  "JavaScript",
  "PHP",
  "MySQL",
  "PostgreSQL",
  "Bootstrap",
  "Database management",
  "Basic API integration",
  "Microsoft Office",
  "Web development",
  "Technical troubleshooting",
];

function SectionTitle({ icon: Icon, children }: { icon: typeof BriefcaseBusiness; children: React.ReactNode }) {
  return <div className="resume-section-title"><span className="resume-section-icon"><Icon size={19} aria-hidden="true" /></span><h2>{children}</h2></div>;
}

export default function ResumePage() {
  return <>
    <section className="page-hero resume-hero">
      <div className="container">
        <p className="eyebrow">Résumé</p>
        <div className="resume-heading-row">
          <div>
            <h1>Erll Jhanwin P. Catapang</h1>
            <p className="resume-subtitle">Fourth-year BSIT student · Service Management</p>
          </div>
          <span className="resume-heading-mark" aria-hidden="true"><Code2 size={31} /></span>
        </div>
        <div className="resume-contact-bar" aria-label="Contact information">
          <a href="mailto:erlljhanwincatapang61@gmail.com"><Mail size={16} aria-hidden="true" /><span>erlljhanwincatapang61@gmail.com</span></a>
          <a href="tel:09766464273"><Phone size={16} aria-hidden="true" /><span>0976 646 4273</span></a>
          <span><MapPin size={16} aria-hidden="true" /><span>Cuenca, Batangas, Philippines</span></span>
        </div>
      </div>
    </section>

    <section className="page-body resume-page-body">
      <div className="container resume-layout">
        <aside className="resume-sidebar">
          <section className="resume-summary-card">
            <p className="eyebrow">Profile</p>
            <h2>People-focused. Practical. Ready to learn.</h2>
            <p>Motivated and adaptable IT student with experience in customer service, team leadership, and fast-paced operations. Developed communication, customer-handling, problem-solving, and teamwork skills as a Team Leader at Jollibee.</p>
            <p>Seeking a Customer Service Representative or Call Center Agent position where I can contribute these skills and continue to grow professionally.</p>
            <Link className="button button-dark resume-contact-cta" href="/contact">Discuss an opportunity <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </section>
          <section className="resume-extra-card">
            <div className="resume-extra-heading"><MoonStar size={17} aria-hidden="true" /><h2>Additional information</h2></div>
            <ul>
              <li>Willing to work night shifts, weekends, and holidays.</li>
              <li>Comfortable in a fast-paced environment.</li>
              <li>Willing to undergo training and continuous learning.</li>
              <li>Interested in customer service, technical support, and BPO-related roles.</li>
            </ul>
          </section>
        </aside>

        <div className="resume-main-column">
          <section className="resume-section">
            <SectionTitle icon={BriefcaseBusiness}>Work experience</SectionTitle>
            <div className="resume-timeline">
              {experience.map((job) => {
                const Icon = job.icon;
                return <article className="resume-entry" key={job.role}>
                  <span className="resume-timeline-node" aria-hidden="true"><Icon size={15} /></span>
                  <div className="resume-entry-heading">
                    <div><h3>{job.role}</h3><p className="resume-org">{job.organization}</p></div>
                    <span className="resume-dates">{job.dates}</span>
                  </div>
                  <p className="resume-location"><MapPin size={13} aria-hidden="true" />{job.location}</p>
                  <ul className="resume-bullets">{job.points.map((point) => <li key={point}>{point}</li>)}</ul>
                </article>;
              })}
            </div>
          </section>

          <section className="resume-section">
            <SectionTitle icon={GraduationCap}>Education</SectionTitle>
            <div className="resume-education-list">
              <article className="resume-education-entry">
                <span className="resume-education-year">Current</span>
                <div><h3>Bachelor of Science in Information Technology</h3><p className="resume-org">Major in Service Management</p><p>Batangas State University – The National Engineering University</p><span className="resume-education-note">Fourth-year graduating student</span></div>
              </article>
              <article className="resume-education-entry">
                <span className="resume-education-year">2024</span>
                <div><h3>TVL — Information, Communication and Technology</h3><p>Alitagtag Senior High School</p></div>
              </article>
            </div>
          </section>

          <section className="resume-section">
            <SectionTitle icon={Code2}>Skills</SectionTitle>
            <div className="resume-skills-grid">
              <article className="resume-skill-group"><h3>Core skills</h3><ul className="resume-tags">{coreSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul></article>
              <article className="resume-skill-group"><h3>Technical skills</h3><ul className="resume-tags">{technicalSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul></article>
            </div>
          </section>

          <section className="resume-section resume-references">
            <SectionTitle icon={UserRound}>References</SectionTitle>
            <p>Reference names and contact details from the supplied résumé are omitted from this public page to protect those individuals’ privacy.</p>
          </section>
        </div>
      </div>
    </section>
  </>;
}
