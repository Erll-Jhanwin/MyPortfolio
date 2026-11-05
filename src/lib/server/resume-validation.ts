import { z } from "zod";

const line = z.string().trim().min(1).max(1000);
const lines = z.array(line).max(40);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
const webUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try { const url = new URL(value); return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname); }
  catch { return false; }
}, "Enter a full http or https URL.");
const experience = z.object({ id, role: line.max(160), organization: line.max(200), location: z.string().trim().max(160), dates: z.string().trim().max(120), points: lines });
const skillGroup = z.object({ id, title: line.max(100), items: lines });
const education = z.object({ id, credential: line.max(200), institution: line.max(220), dates: z.string().trim().max(120), details: lines, note: z.string().trim().max(300) });
const project = z.object({ id, title: line.max(160), organization: z.string().trim().max(200), dates: z.string().trim().max(120), summary: z.string().trim().max(1500), highlights: lines, url: webUrl });
const certification = z.object({ id, title: line.max(180), issuer: z.string().trim().max(200), date: z.string().trim().max(120), credentialUrl: webUrl });
const customSection = z.object({ id, title: line.max(120), body: z.string().trim().max(4000), items: lines });
const socialLink = z.object({ id, label: line.max(80), url: webUrl.refine(Boolean, "Enter a full http or https URL.") });

export const resumeDocumentSchema = z.object({
  name: line.max(120), headline: z.string().trim().max(240),
  contact: z.object({ email: z.string().trim().email().max(254), phone: z.string().trim().max(60), location: z.string().trim().max(180) }),
  socialLinks: z.array(socialLink).max(20), summaryTitle: line.max(180), summary: lines.max(12),
  experience: z.array(experience).max(40), skills: z.array(skillGroup).max(30), education: z.array(education).max(40),
  projects: z.array(project).max(40), certifications: z.array(certification).max(40), customSections: z.array(customSection).max(30),
}).superRefine((resume, context) => {
  for (const [key, items] of Object.entries({ experience: resume.experience, skills: resume.skills, education: resume.education, projects: resume.projects, certifications: resume.certifications, customSections: resume.customSections, socialLinks: resume.socialLinks })) {
    const ids = new Set<string>();
    items.forEach((item, index) => { if (ids.has(item.id)) context.addIssue({ code: "custom", path: [key, index, "id"], message: "IDs must be unique within this list." }); ids.add(item.id); });
  }
});
