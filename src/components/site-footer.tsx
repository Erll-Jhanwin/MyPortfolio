import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div><p className="eyebrow">Have something in mind?</p><h2>Let’s make the next step clearer.</h2></div>
        <Link className="button button-light" href="/contact">Discuss your project <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className="container footer-bottom">
        <Link href="/" className="brand footer-brand"><span className="brand-mark">e.</span><span>erll<span className="brand-dot">/</span>dev</span></Link>
        <p>Thoughtful web and app projects by Erll.</p>
        <nav aria-label="Legal and preferences">
          <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link><Link href="/cookies">Cookies</Link><Link href="/privacy-request">Privacy request</Link>
          <button type="button" className="text-button" data-open-preferences>Cookie preferences</button>
        </nav>
        <a className="back-top" href="#top" aria-label="Back to top"><ArrowUp size={16} aria-hidden="true" /></a>
        <small>© {new Date().getFullYear()} Erll. Built with care.</small>
      </div>
    </footer>
  );
}
