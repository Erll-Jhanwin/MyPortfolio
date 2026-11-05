import {
  BadgeCheck,
  BookOpen,
  Clock,
  CodeXml,
  Database,
  Ear,
  Handshake,
  Headset,
  Lightbulb,
  ListChecks,
  MessageCircle,
  PanelsTopLeft,
  RefreshCw,
  ScanEye,
  UsersRound,
  Webhook,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { technologyIconUrlFor } from "@/components/technology-tags";

const skillIcons: Record<string, LucideIcon> = {
  "customer service": Headset,
  "verbal communication": MessageCircle,
  "active listening": Ear,
  "problem solving": Lightbulb,
  "team leadership": UsersRound,
  "conflict resolution": Handshake,
  adaptability: RefreshCw,
  "time management": Clock,
  "attention to detail": ScanEye,
  multitasking: ListChecks,
  "willingness to learn": BookOpen,
  "database management": Database,
  "basic api integration": Webhook,
  "microsoft office": PanelsTopLeft,
  "web development": CodeXml,
  "technical troubleshooting": Wrench,
};

function normalizeSkill(skill: string) {
  return skill.trim().toLowerCase().replace(/\s+/g, " ");
}

export function ResumeSkillBadges({ skills }: { skills: string[] }) {
  return <ul className="resume-tags">{skills.map((skill, index) => {
    const iconUrl = technologyIconUrlFor(skill, "20251f");
    const Icon = skillIcons[normalizeSkill(skill)] ?? BadgeCheck;
    return <li key={`${index}-${skill}`}>
      <span className="resume-skill-icon" aria-hidden="true">
        {iconUrl ? <span className="resume-skill-brand" style={{ backgroundImage: `url("${iconUrl}")` }} /> : <Icon size={14} strokeWidth={1.8} />}
      </span>
      <span className="resume-skill-label">{skill}</span>
    </li>;
  })}</ul>;
}
