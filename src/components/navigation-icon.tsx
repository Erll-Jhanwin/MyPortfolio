import { BriefcaseBusiness, FileText, Folder, Mail, UserRound } from "lucide-react";

const icons = {
  "/projects": Folder,
  "/about": UserRound,
  "/services": BriefcaseBusiness,
  "/resume": FileText,
  "/contact": Mail,
} as const;

export function NavigationIcon({ href }: { href: string }) {
  const Icon = icons[href as keyof typeof icons];
  if (!Icon) return null;
  return <Icon className="navigation-icon" size={15} strokeWidth={1.8} aria-hidden="true" />;
}
