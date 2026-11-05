import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { navItems } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Erll home">
          <span className="brand-mark">e.</span><span>erll<span className="brand-dot">/</span>dev</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <Link className="header-cta" href="/contact">Let’s talk <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation menu"><Menu size={22} aria-hidden="true" /></summary>
          <nav aria-label="Mobile navigation">
            {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
            <Link href="/contact">Discuss your project <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
