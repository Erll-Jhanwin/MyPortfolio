export type ResumeExperience = { id: string; role: string; organization: string; location: string; dates: string; points: string[] };
export type ResumeSkillGroup = { id: string; title: string; items: string[] };
export type ResumeEducation = { id: string; credential: string; institution: string; dates: string; details: string[]; note: string };
export type ResumeProject = { id: string; title: string; organization: string; dates: string; summary: string; highlights: string[]; url: string };
export type ResumeCertification = { id: string; title: string; issuer: string; date: string; credentialUrl: string };
export type ResumeCustomSection = { id: string; title: string; body: string; items: string[] };
export type ResumeSocialLink = { id: string; label: string; url: string };

export type ResumeDocument = {
  name: string;
  headline: string;
  contact: { email: string; phone: string; location: string };
  socialLinks: ResumeSocialLink[];
  summaryTitle: string;
  summary: string[];
  experience: ResumeExperience[];
  skills: ResumeSkillGroup[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  customSections: ResumeCustomSection[];
};

export type ResumeState = { draft: ResumeDocument; published: ResumeDocument; publishedAt: string | null; updatedAt: string | null };

export const defaultResume: ResumeDocument = {
  name: "Erll Jhanwin P. Catapang",
  headline: "Fourth-year BSIT student · Service Management",
  contact: { email: "erlljhanwincatapang61@gmail.com", phone: "0976 646 4273", location: "Cuenca, Batangas, Philippines" },
  socialLinks: [],
  summaryTitle: "People-focused. Practical. Ready to learn.",
  summary: [
    "Motivated and adaptable IT student with experience in customer service, team leadership, and fast-paced operations. Developed communication, customer-handling, problem-solving, and teamwork skills as a Team Leader at Jollibee.",
    "Seeking a Customer Service Representative or Call Center Agent position where I can contribute these skills and continue to grow professionally.",
  ],
  experience: [
    { id: "jollibee-team-leader", role: "Team Leader", organization: "Jollibee SM Lipa", location: "Lipa City, Batangas", dates: "June 2024 – August 2026", points: ["Led and supported team members in delivering efficient, quality customer service.", "Handled customer concerns professionally and provided appropriate resolutions.", "Coordinated daily tasks and ensured team members followed operational procedures.", "Worked in a fast-paced environment while maintaining service quality.", "Assisted in training and guiding team members to improve performance.", "Applied leadership, communication, teamwork, and problem-solving skills."] },
    { id: "lgU-work-immersion", role: "Work Immersion", organization: "Alitagtag Local Government Unit (MDRRMO)", location: "Alitagtag, Batangas", dates: "February 2023 – March 2023", points: ["Created rainfall advisory graphics for public information and awareness.", "Assisted in developing and organizing the department’s Citizen’s Charter."] },
  ],
  skills: [
    { id: "core-skills", title: "Core skills", items: ["Customer service", "Verbal communication", "Active listening", "Problem solving", "Team leadership", "Conflict resolution", "Adaptability", "Time management", "Attention to detail", "Multitasking", "Willingness to learn"] },
    { id: "technical-skills", title: "Technical skills", items: ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "PostgreSQL", "Bootstrap", "Database management", "Basic API integration", "Microsoft Office", "Web development", "Technical troubleshooting"] },
  ],
  education: [
    { id: "bachelor-information-technology", credential: "Bachelor of Science in Information Technology", institution: "Batangas State University – The National Engineering University", dates: "Current", details: ["Major in Service Management"], note: "Fourth-year graduating student" },
    { id: "tvl-ict", credential: "TVL — Information, Communication and Technology", institution: "Alitagtag Senior High School", dates: "2024", details: [], note: "" },
  ],
  projects: [], certifications: [], customSections: [
    { id: "additional-information", title: "Additional information", body: "", items: ["Willing to work night shifts, weekends, and holidays.", "Comfortable in a fast-paced environment.", "Willing to undergo training and continuous learning.", "Interested in customer service, technical support, and BPO-related roles."] },
    { id: "references", title: "References", body: "Reference names and contact details from the supplied résumé are omitted from this public page to protect those individuals’ privacy.", items: [] },
  ],
};
