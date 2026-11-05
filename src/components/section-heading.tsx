import type { ReactNode } from "react";
export function SectionHeading({ eyebrow, title, children, action }: { eyebrow: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children && <p className="section-intro">{children}</p>}</div>{action}</div>;
}
