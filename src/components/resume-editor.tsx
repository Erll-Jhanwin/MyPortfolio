"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, Check, Eye, FileText, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { ResumeView } from "@/components/resume-view";
import { defaultResume, type ResumeDocument, type ResumeState } from "@/lib/resume/types";

type CollectionKey = "experience" | "skills" | "education" | "projects" | "certifications" | "customSections";
type FieldSpec = { key: string; label: string; kind?: "text" | "textarea" | "url" | "list"; required?: boolean; max?: number; hint?: string };
const collections: Record<CollectionKey, { title: string; singular: string; fields: FieldSpec[] }> = {
  experience: { title: "Work experience", singular: "role", fields: [{ key: "role", label: "Role", required: true, max: 160 }, { key: "organization", label: "Organization", required: true, max: 200 }, { key: "location", label: "Location", max: 160 }, { key: "dates", label: "Dates", max: 120 }, { key: "points", label: "Highlights", kind: "list", hint: "One item per line." }] },
  skills: { title: "Skills", singular: "skill group", fields: [{ key: "title", label: "Group name", required: true, max: 100 }, { key: "items", label: "Skills", kind: "list", hint: "One skill per line." }] },
  education: { title: "Education", singular: "education entry", fields: [{ key: "credential", label: "Degree or credential", required: true, max: 200 }, { key: "institution", label: "School", required: true, max: 220 }, { key: "dates", label: "Dates", max: 120 }, { key: "details", label: "Details", kind: "list", hint: "One detail per line." }, { key: "note", label: "Note", max: 300 }] },
  projects: { title: "Projects", singular: "project", fields: [{ key: "title", label: "Project title", required: true, max: 160 }, { key: "organization", label: "Organization or role", max: 200 }, { key: "dates", label: "Dates", max: 120 }, { key: "summary", label: "Summary", kind: "textarea", max: 1500 }, { key: "highlights", label: "Highlights", kind: "list", hint: "One item per line." }, { key: "url", label: "Project URL", kind: "url", max: 2048 }] },
  certifications: { title: "Certifications", singular: "certification", fields: [{ key: "title", label: "Certification", required: true, max: 180 }, { key: "issuer", label: "Issuing organization", max: 200 }, { key: "date", label: "Date", max: 120 }, { key: "credentialUrl", label: "Credential URL", kind: "url", max: 2048 }] },
  customSections: { title: "Custom sections", singular: "custom section", fields: [{ key: "title", label: "Section title", required: true, max: 120 }, { key: "body", label: "Description", kind: "textarea", max: 4000 }, { key: "items", label: "List items", kind: "list", hint: "One item per line." }] },
};
const nav: Array<{ key: CollectionKey | "profile"; label: string }> = [{ key: "profile", label: "Profile & contact" }, ...Object.entries(collections).map(([key, value]) => ({ key: key as CollectionKey, label: value.title }))];
type Entry = Record<string, string | string[]> & { id: string };
const blankEntry = (specs: FieldSpec[]) => Object.fromEntries(specs.map((field) => [field.key, ""])) as Record<string, string>;
const newId = () => globalThis.crypto?.randomUUID?.().replaceAll("-", "") ?? `${Date.now()}${Math.random().toString(36).slice(2)}`;
async function messageOf(response: Response) { const body = await response.json().catch(() => ({})) as { message?: string }; return body.message || (response.ok ? "Saved." : "The request could not be completed."); }

export function ResumeEditor({ configured, authenticated: initiallyAuthenticated }: { configured: boolean; authenticated: boolean }) {
  const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);
  const [state, setState] = useState<ResumeState>({ draft: defaultResume, published: defaultResume, publishedAt: null, updatedAt: null });
  const [active, setActive] = useState<CollectionKey | "profile">("profile");
  const [entryDraft, setEntryDraft] = useState<Record<string, string>>(blankEntry([]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [socialDraft, setSocialDraft] = useState({ id: "", label: "", url: "" });
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [login, setLogin] = useState({ username: "", password: "" });

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/resume", { cache: "no-store" });
    if (response.status === 401) { setAuthenticated(false); return; }
    if (!response.ok) { setMessage(await messageOf(response)); return; }
    setState(await response.json() as ResumeState);
  }, []);
  useEffect(() => { if (!authenticated) return; const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [authenticated, load]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(login) }); if (!response.ok) { setMessage(await messageOf(response)); return; } setLogin({ username: "", password: "" }); setAuthenticated(true); }
    catch { setMessage("Could not connect. Try again."); } finally { setBusy(false); }
  }
  async function signOut() { setBusy(true); try { await fetch("/api/admin/auth/logout", { method: "POST" }); } finally { setAuthenticated(false); setBusy(false); } }
  function updateProfile<K extends keyof ResumeDocument>(key: K, value: ResumeDocument[K]) { setState((current) => ({ ...current, draft: { ...current.draft, [key]: value } })); }
  function updateContact(key: keyof ResumeDocument["contact"], value: string) { updateProfile("contact", { ...state.draft.contact, [key]: value }); }
  function activeItems() { return state.draft[active as CollectionKey] as unknown as Entry[]; }
  function setItems(items: Entry[]) { const key = active as CollectionKey; setState((current) => ({ ...current, draft: { ...current.draft, [key]: items } as ResumeDocument })); }
  function startAdd() { if (entryFormOpen && !window.confirm("Discard the unfinished entry and start a new one?")) return; const spec = collections[active as CollectionKey]; setEntryDraft(blankEntry(spec.fields)); setEditingId(null); setEntryFormOpen(true); setMessage(""); }
  function startEdit(entry: Entry) { if (entryFormOpen && editingId !== entry.id && !window.confirm("Discard the unfinished entry and edit this one instead?")) return; const spec = collections[active as CollectionKey]; const next = blankEntry(spec.fields); for (const field of spec.fields) { const value = entry[field.key]; next[field.key] = Array.isArray(value) ? value.join("\n") : String(value ?? ""); } setEntryDraft(next); setEditingId(entry.id); setEntryFormOpen(true); setMessage(""); }
  function saveEntry(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const spec = collections[active as CollectionKey]; const value: Entry = { id: editingId ?? newId() }; for (const field of spec.fields) value[field.key] = field.kind === "list" ? (entryDraft[field.key] ?? "").split("\n").map((item) => item.trim()).filter(Boolean) : entryDraft[field.key] ?? ""; const current = activeItems(); setItems(editingId ? current.map((entry) => entry.id === editingId ? value : entry) : [...current, value]); setEntryDraft(blankEntry(spec.fields)); setEditingId(null); setEntryFormOpen(false); setMessage(`${spec.singular[0].toUpperCase()}${spec.singular.slice(1)} saved in this draft. Save draft to keep it.`); }
  function removeEntry(id: string) { const item = activeItems().find((entry) => entry.id === id); if (!item || !window.confirm(`Delete this ${collections[active as CollectionKey].singular}? This change takes effect when you save the draft.`)) return; setItems(activeItems().filter((entry) => entry.id !== id)); if (editingId === id) { setEditingId(null); setEntryFormOpen(false); } setMessage("Entry removed from the draft."); }
  function moveEntry(index: number, direction: -1 | 1) { const list = [...activeItems()]; const next = index + direction; if (next < 0 || next >= list.length) return; [list[index], list[next]] = [list[next], list[index]]; setItems(list); }

  async function saveDraft() {
    if (entryFormOpen || (active === "profile" && (editingSocialId || socialDraft.label.trim() || socialDraft.url.trim()))) { setMessage("Save or cancel the open entry before saving the résumé draft."); return false; }
    setBusy(true); setMessage("");
    try { const response = await fetch("/api/admin/resume", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(state.draft) }); if (!response.ok) { setMessage(await messageOf(response)); return false; } setState(await response.json() as ResumeState); setMessage("Draft saved to the database."); return true; }
    catch { setMessage("Could not save the résumé. Try again."); return false; } finally { setBusy(false); }
  }
  async function publish() {
    if (!window.confirm("Publish this résumé so it appears on the public Resume page?")) return;
    const saved = await saveDraft(); if (!saved) return;
    setBusy(true);
    try { const response = await fetch("/api/admin/resume", { method: "POST" }); if (!response.ok) { setMessage(await messageOf(response)); return; } setState(await response.json() as ResumeState); setMessage("Résumé published. The public page is now showing these changes."); }
    catch { setMessage("Could not publish the résumé. Try again."); } finally { setBusy(false); }
  }
  function saveSocial(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const id = editingSocialId ?? newId(); const value = { ...socialDraft, id }; const links = state.draft.socialLinks; updateProfile("socialLinks", editingSocialId ? links.map((link) => link.id === editingSocialId ? value : link) : [...links, value]); setSocialDraft({ id: "", label: "", url: "" }); setEditingSocialId(null); }

  if (!configured) return <section className="page-body admin-page"><div className="container admin-narrow"><div className="admin-card admin-setup"><p className="eyebrow">Private area</p><h1>Admin sign-in is not configured.</h1><p>Set the server-only admin environment values, then restart the application.</p><Link className="text-link" href="/">Return to portfolio <ArrowUpRight size={15} /></Link></div></div></section>;
  if (!authenticated) return <section className="page-body admin-page"><div className="container admin-narrow"><div className="admin-card admin-login"><p className="eyebrow">Private area</p><h1>Resume editor</h1><p>Sign in to edit the public résumé.</p><form onSubmit={signIn} className="admin-form"><label>Username<input autoComplete="username" required maxLength={128} value={login.username} onChange={(event) => setLogin((current) => ({ ...current, username: event.target.value }))} /></label><label>Password<input type="password" autoComplete="current-password" required maxLength={1024} value={login.password} onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))} /></label>{message && <p className="admin-message" role="alert">{message}</p>}<button className="button button-dark" disabled={busy}>Sign in <ArrowUpRight size={15} aria-hidden="true" /></button></form></div></div></section>;

  return <section className="page-body admin-page"><div className="container admin-container resume-admin-container">
    <header className="admin-heading"><div><p className="eyebrow">Private area</p><h1>Resume editor</h1><p>Edit the draft, preview it in the public design, then publish when it is ready.</p></div><div className="admin-heading-actions"><Link className="button button-outline" href="/admin"><ArrowLeft size={15} aria-hidden="true" /> Projects</Link><button className="button button-outline" type="button" onClick={signOut} disabled={busy}><LogOut size={15} aria-hidden="true" /> Sign out</button></div></header>
    <nav className="resume-editor-tabs" aria-label="Resume sections">{nav.map((item) => <button type="button" key={item.key} className={active === item.key ? "is-active" : ""} onClick={() => { if (entryFormOpen && !window.confirm("Discard the unfinished entry and change sections?")) return; setActive(item.key); setEntryDraft(blankEntry(item.key === "profile" ? [] : collections[item.key].fields)); setEditingId(null); setEntryFormOpen(false); setMessage(""); }}>{item.label}</button>)}</nav>
    <div className="resume-editor-tools"><span>{state.publishedAt ? `Last published ${new Date(state.publishedAt).toLocaleString()}` : "Using the original résumé until the first publish."}</span><div><button type="button" className="button button-outline" onClick={() => setShowPreview((value) => !value)}><Eye size={15} aria-hidden="true" /> {showPreview ? "Hide preview" : "Preview draft"}</button><Link className="button button-outline" href="/resume" target="_blank"><ArrowUpRight size={15} aria-hidden="true" /> Public page</Link></div></div>
    {message && <p className="admin-message" role="status" aria-live="polite">{message}</p>}
    <div className="resume-editor-layout">
      <div className="admin-card resume-editor-card">
        {active === "profile" ? <>
          <div className="admin-editor-heading"><div><p className="eyebrow">Profile & contact</p><h2>Resume header and summary</h2></div></div>
          <div className="admin-fields-grid">
            <label>Full name<input required maxLength={120} value={state.draft.name} onChange={(event) => updateProfile("name", event.target.value)} /></label><label>Headline<input maxLength={240} value={state.draft.headline} onChange={(event) => updateProfile("headline", event.target.value)} /></label>
            <label>Email<input type="email" required maxLength={254} value={state.draft.contact.email} onChange={(event) => updateContact("email", event.target.value)} /></label><label>Phone<input maxLength={60} value={state.draft.contact.phone} onChange={(event) => updateContact("phone", event.target.value)} /></label>
            <label className="admin-field-wide">Location<input maxLength={180} value={state.draft.contact.location} onChange={(event) => updateContact("location", event.target.value)} /></label>
            <label className="admin-field-wide">Profile heading<input required maxLength={180} value={state.draft.summaryTitle} onChange={(event) => updateProfile("summaryTitle", event.target.value)} /></label>
            <label className="admin-field-wide">Summary paragraphs<textarea rows={7} maxLength={12000} value={state.draft.summary.join("\n\n")} onChange={(event) => updateProfile("summary", event.target.value.split(/\n\s*\n/).map((line) => line.trim()).filter(Boolean))} /><small>Separate paragraphs with a blank line.</small></label>
          </div>
          <section className="resume-social-editor"><div className="admin-list-heading"><h2>Social links</h2></div>{state.draft.socialLinks.map((social) => <div className="resume-social-row" key={social.id}><span><strong>{social.label}</strong><small>{social.url}</small></span><button type="button" className="button button-outline button-small" onClick={() => { setSocialDraft(social); setEditingSocialId(social.id); }}>Edit</button><button type="button" className="admin-delete-project" onClick={() => { if (window.confirm(`Delete the ${social.label} link?`)) updateProfile("socialLinks", state.draft.socialLinks.filter((item) => item.id !== social.id)); }}>Delete</button></div>)}
            <form className="resume-social-form" onSubmit={saveSocial}><label>Link label<input required maxLength={80} value={socialDraft.label} onChange={(event) => setSocialDraft((current) => ({ ...current, label: event.target.value }))} /></label><label>URL<input required type="url" maxLength={2048} placeholder="https://…" value={socialDraft.url} onChange={(event) => setSocialDraft((current) => ({ ...current, url: event.target.value }))} /></label><button className="button button-outline button-small"><Plus size={14} aria-hidden="true" /> {editingSocialId ? "Update link" : "Add link"}</button>{editingSocialId && <button type="button" className="text-button" onClick={() => { setEditingSocialId(null); setSocialDraft({ id: "", label: "", url: "" }); }}>Cancel</button>}</form>
          </section>
        </> : <>
          <div className="admin-editor-heading"><div><p className="eyebrow">{collections[active].title}</p><h2>Manage {collections[active].title.toLowerCase()}</h2></div><button type="button" className="button button-dark button-small" onClick={startAdd}><Plus size={15} aria-hidden="true" /> Add {collections[active].singular}</button></div>
          {activeItems().length ? <ol className="resume-entry-list">{activeItems().map((entry, index) => <li key={entry.id}><div><strong>{String(entry[collections[active].fields[0].key] || `Untitled ${collections[active].singular}`)}</strong><small>{collections[active].title} · item {index + 1}</small></div><div className="resume-entry-controls"><button type="button" aria-label="Move up" title="Move up" disabled={index === 0} onClick={() => moveEntry(index, -1)}><ArrowUp size={15} /></button><button type="button" aria-label="Move down" title="Move down" disabled={index === activeItems().length - 1} onClick={() => moveEntry(index, 1)}><ArrowDown size={15} /></button><button type="button" onClick={() => startEdit(entry)}>Edit</button><button type="button" className="is-delete" onClick={() => removeEntry(entry.id)}><Trash2 size={14} aria-hidden="true" /> Delete</button></div></li>)}</ol> : <p className="admin-list-empty">No {collections[active].title.toLowerCase()} yet. Add the first entry.</p>}
          {entryFormOpen && <form className="resume-entry-form" onSubmit={saveEntry}><h3>{editingId ? `Edit ${collections[active].singular}` : `Add ${collections[active].singular}`}</h3><div className="admin-fields-grid">{collections[active].fields.map((field) => <label className={field.kind === "textarea" || field.kind === "list" ? "admin-field-wide" : ""} key={field.key}>{field.label}{field.kind === "textarea" || field.kind === "list" ? <textarea required={field.required} maxLength={field.max} rows={field.kind === "list" ? 5 : 4} value={entryDraft[field.key] ?? ""} onChange={(event) => setEntryDraft((current) => ({ ...current, [field.key]: event.target.value }))} /> : <input required={field.required} type={field.kind === "url" ? "url" : "text"} maxLength={field.max} placeholder={field.kind === "url" ? "https://…" : undefined} value={entryDraft[field.key] ?? ""} onChange={(event) => setEntryDraft((current) => ({ ...current, [field.key]: event.target.value }))} />}{field.hint && <small>{field.hint}</small>}</label>)}</div><div className="resume-entry-form-actions"><button className="button button-dark button-small"><Check size={14} aria-hidden="true" /> Save entry</button><button type="button" className="button button-outline button-small" onClick={() => { setEntryDraft(blankEntry(collections[active].fields)); setEditingId(null); setEntryFormOpen(false); }}>Cancel</button></div></form>}
        </>}
        <div className="admin-editor-actions"><button type="button" className="button button-outline" disabled={busy} onClick={() => void saveDraft()}><Save size={15} aria-hidden="true" /> Save draft</button><button type="button" className="button button-dark" disabled={busy} onClick={() => void publish()}><Check size={15} aria-hidden="true" /> Publish changes</button></div>
      </div>
      {showPreview && <div className="resume-preview-wrap"><div className="resume-preview-header"><FileText size={15} aria-hidden="true" /> Live draft preview</div><ResumeView resume={state.draft} preview /></div>}
    </div>
  </div></section>;
}
