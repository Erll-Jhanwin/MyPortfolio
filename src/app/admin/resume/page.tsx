import type { Metadata } from "next";
import { ResumeEditor } from "@/components/resume-editor";
import { adminIsConfigured, isAdminAuthenticated } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resume editor · Admin", robots: { index: false, follow: false, noarchive: true } };

export default async function AdminResumePage() {
  const configured = adminIsConfigured();
  const authenticated = configured && await isAdminAuthenticated();
  return <ResumeEditor configured={configured} authenticated={authenticated} />;
}
