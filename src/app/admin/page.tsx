import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";
import { adminIsConfigured, isAdminAuthenticated } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false, noarchive: true } };

export default async function AdminPage() {
  const configured = adminIsConfigured();
  const authenticated = configured && await isAdminAuthenticated();
  return <AdminPanel configured={configured} authenticated={authenticated} />;
}
