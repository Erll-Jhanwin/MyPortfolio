import type { Metadata } from "next";
import { ResumeView } from "@/components/resume-view";
import { repository } from "@/lib/server/repositories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Résumé", description: "Education, work experience, and skills of Erll Jhanwin P. Catapang." };

export default async function ResumePage() {
  const { published } = await repository().getResume();
  return <ResumeView resume={published} />;
}
