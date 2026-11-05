"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "erll-cookie-preferences-v1";
type Preferences = { required: true; analytics: false; savedAt: string; version: 1 };

export function CookiePreferences() {
  const dialogRef=useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let frame=0;
    try { if (!localStorage.getItem(STORAGE_KEY)) frame=window.requestAnimationFrame(()=>setNotice(true)); } catch { /* preference notice remains hidden when storage is unavailable */ }
    const onOpen = (event: Event) => { event.preventDefault(); setOpen(true); };
    document.querySelectorAll("[data-open-preferences]").forEach((el) => el.addEventListener("click", onOpen));
    return () => { if(frame)window.cancelAnimationFrame(frame);document.querySelectorAll("[data-open-preferences]").forEach((el) => el.removeEventListener("click", onOpen)); };
  }, []);

  useEffect(()=>{const dialog=dialogRef.current;if(!dialog)return;if(open&&!dialog.open){dialog.showModal();dialog.querySelector<HTMLButtonElement>("button")?.focus();}else if(!open&&dialog.open)dialog.close();},[open]);

  function save() {
    const preferences: Preferences = { required: true, analytics: false, savedAt: new Date().toISOString(), version: 1 };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); } catch { /* preferences remain off when storage is unavailable */ }
    setNotice(false); setOpen(false); setSaved(true); window.setTimeout(() => setSaved(false), 3500);
  }

  return <>
    {notice && <aside className="cookie-notice" aria-label="Cookie notice"><div><strong>Your privacy, by default.</strong><p>This site uses essential browser storage only to remember your preferences. No analytics or advertising trackers are active.</p></div><div className="cookie-actions"><button className="button button-dark button-small" onClick={save}>Continue with essentials</button><button className="button button-outline button-small" onClick={() => setOpen(true)}>Preferences</button></div></aside>}
    {saved && <p className="sr-only" role="status">Your preferences were saved.</p>}
    <dialog ref={dialogRef} className="preferences-dialog" aria-labelledby="preferences-title" onCancel={e=>{e.preventDefault();setOpen(false)}} onClose={()=>setOpen(false)} onClick={e=>{if(e.target===dialogRef.current)setOpen(false)}}>
        <button className="dialog-close" aria-label="Close preferences" onClick={() => setOpen(false)}><X size={20} /></button>
        <p className="eyebrow">Your choice</p><h2 id="preferences-title">Cookie preferences</h2>
        <p>This portfolio currently uses no analytics, advertising, or third-party tracking. A small local preference value can remember your choice on this device.</p>
        <div className="preference-row"><span><strong>Essential storage</strong><small>Remembers this preference. No identifier is sent to a server.</small></span><span className="always-on">Always on</span></div>
        <div className="preference-row"><span><strong>Analytics and marketing</strong><small>Not used on this site.</small></span><span className="always-on">Off</span></div>
        <button className="button button-dark" onClick={save}>Save essential-only preferences</button>
    </dialog>
  </>;
}
