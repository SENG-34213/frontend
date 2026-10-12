"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createMaterialApi } from "../../../../shared/materials/materialApi";
import type { Material, MaterialApi } from "../../../../shared/materials/materialTypes";

type AdminMaterial = Material & { uploader?: string; uploaderName?: string; uploadedBy?: string };
type SortKey = "date" | "title" | "size" | "status";
const PAGE_SIZE = 10;

function materialType(material: Material) {
  return (material.type || material.contentType || material.fileName?.split(".").pop() || "FILE").toUpperCase();
}

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(material: Material) {
  const value = material.uploadedAt || material.createdAt || material.updatedAt;
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function StatusBadge({ status = "ACTIVE" }: { status?: string }) {
  return <span className={`material-status-badge ${String(status).toLowerCase()}`}>{status}</span>;
}

function DownloadAction({ material, api, onError }: { material: Material; api: MaterialApi; onError: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  return <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { const result = await api.download(material.id); const url = result.downloadUrl || result.url; if (!url) throw new Error("Secure download URL unavailable."); window.open(url, "_blank", "noopener,noreferrer"); } catch (caught) { onError(caught instanceof Error ? caught.message : "Could not download this material."); } finally { setBusy(false); } }}>{busy ? "Preparing…" : "Download"}</button>;
}

function Preview({ material, api, onClose }: { material: Material; api: MaterialApi; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { let active = true; void api.download(material.id).then((result) => { const nextUrl = result.downloadUrl || result.url; if (active && nextUrl) setUrl(nextUrl); else if (active) setError("Secure preview URL unavailable."); }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Could not load the preview."); }); return () => { active = false; }; }, [api, material.id]);
  return <div className="material-preview-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="material-preview" role="dialog" aria-modal="true" aria-label={`${material.title} preview`}><header><div><span className="material-eyebrow">MATERIAL PREVIEW</span><h3>{material.title}</h3><p>{material.fileName || "Learning material"} · {formatBytes(material.fileSize)}</p></div><button type="button" onClick={onClose} aria-label="Close preview">×</button></header>{error && <div className="material-state error">{error}</div>}{!error && !url && <div className="material-state">Loading secure preview…</div>}{url && <iframe title={`${material.title} preview`} src={url} />}</section></div>;
}

export function AdminMaterialsWorkspace({ apiUrl, authenticated }: { apiUrl: string; authenticated: boolean }) {
  const api = useMemo(() => createMaterialApi(apiUrl), [apiUrl]);
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState<SortKey>("date");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<Material | null>(null);
  const [editing, setEditing] = useState<AdminMaterial | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.list({ size: 100 });
      setMaterials(Array.isArray(result) ? result as AdminMaterial[] : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load authorized materials.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (authenticated) void load();
  }, [authenticated, load]);

  const types = useMemo(() => Array.from(new Set(materials.map(materialType))).sort(), [materials]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return materials
      .filter((material) => `${material.title} ${material.fileName || ""} ${material.description || ""} ${material.purpose || ""}`.toLowerCase().includes(normalizedQuery))
      .filter((material) => type === "ALL" || materialType(material) === type)
      .filter((material) => status === "ALL" || material.status === status)
      .sort((left, right) => {
        if (sort === "title") return left.title.localeCompare(right.title);
        if (sort === "size") return (right.fileSize || 0) - (left.fileSize || 0);
        if (sort === "status") return String(left.status || "").localeCompare(String(right.status || ""));
        return new Date(right.uploadedAt || right.createdAt || 0).getTime() - new Date(left.uploadedAt || left.createdAt || 0).getTime();
      });
  }, [materials, query, sort, status, type]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function updateMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api.update(editing.id, {
        title: String(form.get("title") || "").trim(),
        description: String(form.get("description") || "").trim(),
        purpose: String(form.get("purpose") || "").trim(),
        type: String(form.get("type") || "").trim(),
      });
      setMaterials((current) => current.map((material) => material.id === updated.id ? { ...material, ...updated } : material));
      setEditing(null);
      setNotice("Material details updated successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this material.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveMaterial(material: Material) {
    if (!window.confirm(`Archive “${material.title}”?`)) return;
    try {
      const updated = await api.archive(material.id);
      setMaterials((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, status: updated.status || "ARCHIVED" } : item));
      setNotice("Material archived successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not archive this material.");
    }
  }

  async function deleteMaterial(material: Material) {
    if (!window.confirm(`Permanently delete “${material.title}”?`)) return;
    try {
      await api.remove(material.id);
      setMaterials((current) => current.filter((item) => item.id !== material.id));
      setNotice("Material deleted successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete this material.");
    }
  }

  if (!authenticated) {
    return <div className="admin-material-state error"><strong>Admin sign-in required</strong><p>Sign in with an authorized Admin or Super Admin account to manage platform materials.</p></div>;
  }

  return <section className="admin-materials-workspace">
    <header className="admin-materials-heading"><div><span className="catalog-kicker">RESOURCE GOVERNANCE</span><h2>Platform materials</h2><p>Review, maintain, and securely access learning resources across Mentify.</p></div><div className="admin-materials-summary"><strong>{filtered.length}</strong><span>visible materials</span></div></header>
    <div className="admin-materials-toolbar"><label>Search<input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search title, file, purpose" /></label><label>Type<select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}><option value="ALL">All types</option>{types.map((item) => <option key={item}>{item}</option>)}</select></label><label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="PROCESSING">Processing</option><option value="FAILED">Failed</option><option value="ARCHIVED">Archived</option></select></label><label>Sort<select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="date">Newest</option><option value="title">Title</option><option value="size">Largest file</option><option value="status">Status</option></select></label><button type="button" className="secondary-button" onClick={() => void load()}>Refresh</button></div>
    {notice && <div className="admin-material-state success" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}
    {error && <div className="admin-material-state error" role="alert">{error}<button type="button" onClick={() => void load()}>Retry</button></div>}
    {loading ? <div className="admin-material-state">Loading authorized materials…</div> : !visible.length ? <div className="admin-material-empty"><strong>No materials found</strong><p>{materials.length ? "Try a different search or filter." : "Authorized platform materials will appear here."}</p></div> : <div className="admin-material-table-wrap"><table className="admin-material-table"><thead><tr><th>Material</th><th>Purpose / context</th><th>Uploader</th><th>Size</th><th>Status</th><th>Uploaded</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map((material) => <tr key={material.id}><td><div className="admin-material-title"><span>{materialType(material).slice(0, 4)}</span><div><strong>{material.title}</strong><small>{material.fileName || "No file name"}</small></div></div></td><td>{material.purpose || (material.assignmentId ? "Assignment" : material.lessonId ? "Lesson" : material.moduleId ? "Module" : material.courseId ? "Course" : "General")}</td><td>{material.uploaderName || material.uploader || material.uploadedBy || "Authorized uploader"}</td><td>{formatBytes(material.fileSize)}</td><td><StatusBadge status={material.status} /></td><td>{formatDate(material)}</td><td><div className="admin-material-actions"><button type="button" onClick={() => setPreview(material)}>Preview</button><DownloadAction material={material} api={api} onError={setError} /><button type="button" onClick={() => setEditing(material)}>Edit</button><button type="button" onClick={() => void archiveMaterial(material)} disabled={material.status === "ARCHIVED"}>Archive</button><button type="button" className="danger" onClick={() => void deleteMaterial(material)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    <footer className="admin-material-pagination"><span>Page {currentPage} of {pages}</span><div><button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button type="button" disabled={currentPage >= pages} onClick={() => setPage((value) => value + 1)}>Next</button></div></footer>
    {preview && <Preview material={preview} api={api} onClose={() => setPreview(null)} />}
    {editing && <div className="admin-material-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><form className="admin-material-modal" onSubmit={updateMaterial} role="dialog" aria-modal="true" aria-labelledby="edit-material-title"><header><div><span className="catalog-kicker">RESOURCE GOVERNANCE</span><h3 id="edit-material-title">Edit material</h3></div><button type="button" onClick={() => setEditing(null)} aria-label="Close edit dialog">×</button></header><label>Title<input name="title" required defaultValue={editing.title} /></label><label>Description<textarea name="description" defaultValue={editing.description || ""} /></label><label>Purpose<input name="purpose" defaultValue={editing.purpose || ""} placeholder="e.g. Lesson resource" /></label><label>Type<input name="type" defaultValue={editing.type || materialType(editing)} /></label><footer><button type="button" className="secondary-button" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></footer></form></div>}
  </section>;
}
