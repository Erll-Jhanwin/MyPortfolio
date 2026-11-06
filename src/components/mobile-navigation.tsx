"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavigationIcon } from "@/components/navigation-icon";

type NavigationItem = { href: string; label: string };

export function MobileNavigation({ items }: { items: NavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() { setOpen(false); }

  return <div className="mobile-menu" ref={rootRef}>
    <button
      className="mobile-menu-toggle"
      type="button"
      ref={toggleRef}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={open}
      aria-controls="mobile-navigation-panel"
      onClick={() => setOpen((current) => !current)}
    >
      <Menu className="mobile-menu-icon mobile-menu-icon-open" size={22} aria-hidden="true" />
      <X className="mobile-menu-icon mobile-menu-icon-close" size={22} aria-hidden="true" />
    </button>
    <div className="mobile-menu-panel" id="mobile-navigation-panel" data-open={open}>
      <nav className="mobile-navigation" aria-label="Mobile navigation" aria-hidden={!open} inert={!open}>
        {items.map((item) => <Link key={item.href} href={item.href} onClick={close}><span className="navigation-label"><NavigationIcon href={item.href} />{item.label}</span></Link>)}
        <Link className="mobile-navigation-cta" href="/contact" onClick={close}>Discuss your project <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </nav>
    </div>
  </div>;
}
