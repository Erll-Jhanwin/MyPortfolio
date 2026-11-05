"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, ChevronDown, ImagePlus, LogOut, Plus, Save, Trash2, X } from "lucide-react";
import type { ProjectDraft, ProjectKind, ProjectRecord, ProjectState } from "@/lib/projects/types";

type EditorState = {
  slug: string; title: string; summary: string; description: string;
  projectType: ProjectKind | ""; status: ProjectState | ""; role: string; context: string;
  constraints: string; solution: string; decisions: string; technologies: string;
  evidence: string; results: string; limitations: string; lessons: string;
  demoUrl: string; githubUrl: string; published: boolean;
};

const blankForm: EditorState = {
  slug: "", title: "", summary: "", description: "", projectType: "", status: "", role: "", context: "",
  constraints: "", solution: "", decisions: "", technologies: "", evidence: "", results: "", limitations: "", lessons: "",
  demoUrl: "", githubUrl: "", published: false,
};

function lines(value: string) { return value.split("\n").map((item) => item.trim()).filter(Boolean); }
function toDraft(form: EditorState): ProjectDraft {
  return {
    slug: form.slug, title: form.title, summary: form.summary, description: form.description,
    projectType: form.projectType as ProjectKind, status: form.status as ProjectState, role: form.role, context: form.context,
    constraints: lines(form.constraints), solution: form.solution, decisions: lines(form.decisions),
    technologies: form.technologies.split(",").map((item) => item.trim()).filter(Boolean), evidence: lines(form.evidence),
    results: form.results, limitations: lines(form.limitations), lessons: lines(form.lessons),
    demoUrl: form.demoUrl, githubUrl: form.githubUrl, published: form.published,
  };
}
function fromProject(project: ProjectRecord): EditorState {
  return {
    slug: project.slug, title: project.title, summary: project.summary, description: project.description,
    projectType: project.projectType, status: project.status, role: project.role, context: project.context,
    constraints: project.constraints.join("\n"), solution: project.solution, decisions: project.decisions.join("\n"),
    technologies: project.technologies.join(", "), evidence: project.evidence.join("\n"), results: project.results,
    limitations: project.limitations.join("\n"), lessons: project.lessons.join("\n"), demoUrl: project.demoUrl ?? "",
    githubUrl: project.githubUrl ?? "", published: project.published,
  };
}

async function responseMessage(response: Response) {
  const body = await response.json().catch(() => ({})) as { message?: string };
  return body.message || (response.ok ? "Saved." : "The request could not be completed.");
}

export function AdminPanel({ configured, authenticated: initiallyAuthenticated }: { configured: boolean; authenticated: boolean }) {
  const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<EditorState>(blankForm);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [loginMessage, setLoginMessage] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const uploadInput = useRef<HTMLInputElement>(null);

  const loadProjects = useCallback(async () => {
    const response = await fetch("/api/admin/projects", { cache: "no-store" });
    if (response.status === 401) { setAuthenticated(false); return; }
    if (!response.ok) { setMessage(await responseMessage(response)); return; }
    const result = await response.json() as { projects: ProjectRecord[] };
    setProjects(result.projects);
    if (selectedId) {
      const selected = result.projects.find((project) => project.id === selectedId);
      if (selected) setForm(fromProject(selected));
    }
  }, [selectedId]);

  useEffect(() => { if (authenticated) void loadProjects(); }, [authenticated, loadProjects]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setLoginMessage("");
    try {
      const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(login) });
      const result = await response.json().catch(() => ({})) as { authenticated?: boolean; message?: string };
      if (!response.ok) { setLoginMessage(result.message ?? "Sign-in failed."); return; }
      setLogin({ username: "", password: "" }); setAuthenticated(true); setLoginMessage("");
    } catch { setLoginMessage("Could not connect. Try again."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    try { await fetch("/api/admin/auth/logout", { method: "POST" }); }
    finally { setAuthenticated(false); setProjects([]); setSelectedId(null); setForm(blankForm); setBusy(false); }
  }

  function startNew() { setSelectedId(null); setForm(blankForm); setMessage(""); setUploadAlt(""); setUploadFile(null); }
  function editProject(project: ProjectRecord) { setSelectedId(project.id); setForm(fromProject(project)); setMessage(""); setUploadAlt(""); setUploadFile(null); }
  function update<K extends keyof EditorState>(key: K, value: EditorState[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function save(event?: FormEvent<HTMLFormElement>, published = form.published) {
    event?.preventDefault(); setBusy(true); setMessage("");
    const payload = { ...toDraft(form), published };
    try {
      const response = await fetch(selectedId ? `/api/admin/projects/${selectedId}` : "/api/admin/projects", {
        method: selectedId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!response.ok) { setMessage(await responseMessage(response)); return; }
      const result = await response.json() as { project: ProjectRecord };
      setSelectedId(result.project.id); setForm(fromProject(result.project)); setMessage(published ? "Project published." : "Project saved as a draft.");
      await loadProjects();
    } catch { setMessage("Could not save the project. Try again."); }
    finally { setBusy(false); }
  }

  async function removeProject() {
    if (!selectedId || !window.confirm("Delete this project and its uploaded images? This cannot be undone.")) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/projects/${selectedId}`, { method: "DELETE" });
      if (!response.ok) { setMessage(await responseMessage(response)); return; }
      startNew(); setMessage("Project deleted."); await loadProjects();
    } catch { setMessage("Could not delete the project. Try again."); }
    finally { setBusy(false); }
  }

  async function uploadImage() {
    if (!selectedId || !uploadFile) { setMessage("Save the project first, then choose an image."); return; }
    if (!uploadAlt.trim()) { setMessage("Add descriptive alt text before uploading."); return; }
    setBusy(true); setMessage("");
    const payload = new FormData(); payload.set("image", uploadFile); payload.set("alt", uploadAlt.trim());
    try {
      const response = await fetch(`/api/admin/projects/${selectedId}/images`, { method: "POST", body: payload });
      if (!response.ok) { setMessage(await responseMessage(response)); return; }
      setUploadFile(null); setUploadAlt(""); if (uploadInput.current) uploadInput.current.value = ""; setMessage("Image uploaded and optimized."); await loadProjects();
    } catch { setMessage("Could not upload this image. Try again."); }
    finally { setBusy(false); }
  }

  async function removeImage(imageId: string) {
    if (!selectedId || !window.confirm("Delete this project image?")) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/projects/${selectedId}/images/${imageId}`, { method: "DELETE" });
      if (!response.ok) { setMessage(await responseMessage(response)); return; }
      setMessage("Image deleted."); await loadProjects();
    } catch { setMessage("Could not delete the image. Try again."); }
    finally { setBusy(false); }
  }

  if (!configured) return <section className="page-body admin-page"><div className="container admin-narrow"><div className="admin-card admin-setup"><p className="eyebrow">Private area</p><h1>Admin sign-in is not configured.</h1><p>Set the server-only <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD_HASH</code>, and <code>ADMIN_SESSION_SECRET</code> environment values, then restart the application. Public registration is disabled.</p><Link className="text-link" href="/">Return to portfolio <ArrowUpRight size={15} /></Link></div></div></section>;

  if (!authenticated) return <section className="page-body admin-page"><div className="container admin-narrow"><div className="admin-card admin-login"><p className="eyebrow">Private area</p><h1>Project administration</h1><p>Sign in to manage portfolio projects.</p><form onSubmit={signIn} className="admin-form"><label>Username<input autoComplete="username" required maxLength={128} value={login.username} onChange={(event) => setLogin((value) => ({ ...value, username: event.target.value }))} /></label><label>Password<input type="password" autoComplete="current-password" required maxLength={1024} value={login.password} onChange={(event) => setLogin((value) => ({ ...value, password: event.target.value }))} /></label>{loginMessage && <p className="admin-message" role="alert">{loginMessage}</p>}<button className="button button-dark" disabled={busy}>Sign in <ArrowUpRight size={15} aria-hidden="true" /></button></form></div></div></section>;

  const selectedProject = projects.find((project) => project.id === selectedId);
  return <section className="page-body admin-page"><div className="container admin-container">
    <header className="admin-heading"><div><p className="eyebrow">Private area</p><h1>Project dashboard</h1><p>Manage drafts and published work. Only published projects appear publicly.</p></div><button className="button button-outline" onClick={signOut} disabled={busy}><LogOut size={15} aria-hidden="true" /> Sign out</button></header>
    <div className="admin-layout">
      <aside className="admin-project-list"><div className="admin-list-heading"><h2>Projects</h2><button className="button button-dark button-small" type="button" onClick={startNew}><Plus size={15} aria-hidden="true" /> New</button></div>
        {projects.length ? projects.map((project) => <button key={project.id} type="button" className={`admin-project-item${selectedId === project.id ? " is-selected" : ""}`} onClick={() => editProject(project)}><span className="admin-project-title">{project.title}</span><span className={`admin-status${project.published ? " is-published" : ""}`}>{project.published ? "Published" : "Draft"}</span></button>) : <p className="admin-list-empty">No projects yet. Add the first one here.</p>}
      </aside>

      <form className="admin-card admin-editor" onSubmit={(event) => void save(event)}>
        <div className="admin-editor-heading"><div><p className="eyebrow">{selectedId ? "Edit project" : "New entry"}</p><h2>{form.title || "Project details"}</h2></div>{selectedProject?.published && <span className="admin-status is-published">Published</span>}</div>
        {message && <p className="admin-message" role="status" aria-live="polite">{message}</p>}
        <div className="admin-fields-grid">
          <label>Project title<input required minLength={2} maxLength={120} value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
          <label>Project URL slug<input required minLength={2} maxLength={90} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => update("slug", event.target.value)} /><small>Lowercase letters, numbers, and hyphens.</small></label>
          <label>Project type<select required value={form.projectType} onChange={(event) => update("projectType", event.target.value as EditorState["projectType"])}><option value="">Choose type</option><option value="academic">Academic</option><option value="personal">Personal</option><option value="team">Team</option><option value="paid">Paid</option><option value="volunteer">Volunteer</option></select></label>
          <label>Project status<select required value={form.status} onChange={(event) => update("status", event.target.value as EditorState["status"])}><option value="">Choose status</option><option value="prototype">Prototype</option><option value="in-development">In development</option><option value="complete">Complete</option><option value="archived">Archived</option></select></label>
          <label className="admin-field-wide">Short summary<input required maxLength={240} value={form.summary} onChange={(event) => update("summary", event.target.value)} /><small>Shown on the public project card.</small></label>
          <label className="admin-field-wide">Description<textarea required maxLength={8000} rows={5} value={form.description} onChange={(event) => update("description", event.target.value)} /><small>Describe the project accurately. No results are assumed.</small></label>
          <label>My role<input maxLength={500} value={form.role} onChange={(event) => update("role", event.target.value)} /></label>
          <label>Project context<input maxLength={1500} value={form.context} onChange={(event) => update("context", event.target.value)} /></label>
          <label>Technologies<input maxLength={800} value={form.technologies} onChange={(event) => update("technologies", event.target.value)} /><small>Separate technologies with commas.</small></label>
          <label>Live demo URL<input type="url" inputMode="url" placeholder="https://" maxLength={2048} value={form.demoUrl} onChange={(event) => update("demoUrl", event.target.value)} /></label>
          <label className="admin-field-wide">GitHub URL<input type="url" inputMode="url" placeholder="https://github.com/…" maxLength={2048} value={form.githubUrl} onChange={(event) => update("githubUrl", event.target.value)} /></label>
        </div>

        <details className="admin-advanced"><summary>Case study details <ChevronDown size={16} aria-hidden="true" /></summary><div className="admin-fields-grid">
          <label>Constraints<textarea rows={3} value={form.constraints} onChange={(event) => update("constraints", event.target.value)} /><small>One per line.</small></label>
          <label>Solution<textarea rows={3} value={form.solution} onChange={(event) => update("solution", event.target.value)} /></label>
          <label>Technical decisions<textarea rows={3} value={form.decisions} onChange={(event) => update("decisions", event.target.value)} /><small>One per line.</small></label>
          <label>Evidence<textarea rows={3} value={form.evidence} onChange={(event) => update("evidence", event.target.value)} /><small>One item per line.</small></label>
          <label>Results<textarea rows={3} value={form.results} onChange={(event) => update("results", event.target.value)} /></label>
          <label>Limitations<textarea rows={3} value={form.limitations} onChange={(event) => update("limitations", event.target.value)} /><small>One per line.</small></label>
          <label>Lessons<textarea rows={3} value={form.lessons} onChange={(event) => update("lessons", event.target.value)} /><small>One per line.</small></label>
        </div></details>

        <section className="admin-images"><div className="admin-images-heading"><div><p className="eyebrow">Media</p><h3>Project images</h3></div><span>{selectedProject?.images.length ?? 0} / 6</span></div>
          {selectedProject?.images.length ? <div className="admin-image-grid">{selectedProject.images.map((image) => <figure className="admin-image-item" key={image.id}><div className="admin-image-preview"><Image src={`/api/admin/projects/${selectedId}/images/${image.id}`} alt={image.alt} width={image.width} height={image.height} unoptimized /></div><figcaption>{image.alt}</figcaption><button type="button" className="admin-delete-image" aria-label={`Delete image: ${image.alt}`} onClick={() => void removeImage(image.id)} disabled={busy}><X size={15} aria-hidden="true" /></button></figure>)}</div> : <p className="admin-image-empty">Save a project before adding images. Images are resized and stored in the database.</p>}
          {selectedId && (selectedProject?.images.length ?? 0) < 6 && <div className="admin-upload-form"><label>Image file<input ref={uploadInput} name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} /></label><label>Image description (alt text)<input minLength={5} maxLength={160} value={uploadAlt} onChange={(event) => setUploadAlt(event.target.value)} /></label><small>JPEG, PNG, or WebP · maximum 5 MB. Stored as optimized WebP.</small><button type="button" className="button button-outline button-small" onClick={() => void uploadImage()} disabled={busy || !uploadFile}><ImagePlus size={15} aria-hidden="true" /> Upload image</button></div>}
        </section>

        <div className="admin-editor-actions"><button className="button button-outline" type="submit" disabled={busy}><Save size={15} aria-hidden="true" /> {form.published ? "Save changes" : "Save draft"}</button><button className="button button-dark" type="button" disabled={busy || !form.title || !form.description} onClick={(event) => { if (event.currentTarget.form?.reportValidity()) void save(undefined, !form.published); }}><Check size={15} aria-hidden="true" /> {form.published ? "Unpublish" : "Publish"}</button>{selectedId && <button className="admin-delete-project" type="button" onClick={() => void removeProject()} disabled={busy}><Trash2 size={15} aria-hidden="true" /> Delete project</button>}</div>
      </form>
    </div>
  </div></section>;
}
