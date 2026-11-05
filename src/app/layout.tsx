import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookiePreferences } from "@/components/cookie-preferences";
import { site } from "@/lib/site";
import "./globals.css";
import "./admin-resume.css";
import "./hero-exploded.css";
import "./navigation-polish.css";
import "./services-icons.css";
import "./resume-skill-icons.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url), title: { default: site.title, template: "%s — Erll" }, description: site.description,
  applicationName: "Erll Portfolio",
  openGraph: { type: "website", locale: "en_US", siteName: "Erll Portfolio", title: site.title, description: site.description, url: site.url },
  robots: process.env.INDEX_PUBLIC_SITE === "true" && process.env.LAUNCH_CONTENT_APPROVED === "true" ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet"/></head><body id="top"><a className="skip-link" href="#main">Skip to content</a><SiteHeader /><main id="main">{children}</main><SiteFooter /><CookiePreferences /></body></html>;
}
