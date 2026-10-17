"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "./Icon";
import { createMaterialApi } from "../../../../shared/materials/materialApi";
import type { Material, MaterialApi } from "../../../../shared/materials/materialTypes";

type AdminMaterial = Material & { uploader?: string; uploaderName?: string; uploadedBy?: string };
type SortKey = "date" | "title" | "size" | "status";
const PAGE_SIZE = 10;

function materialType(material: Material) {
  return (
    material.type ||
    material.contentType ||
    material.fileName?.split(".").pop() ||
    "FILE"
  ).toUpperCase();
}

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(material: Material) {
  const value = material.uploadedAt || material.createdAt || material.updatedAt;
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}

function StatusBadge({ status = "ACTIVE" }: { status?: string }) {
  return <span className={`material-status-badge ${String(status).toLowerCase()}`}>{status}</span>;
}

function DownloadAction({
  material,
  api,
  onError,
}: {
  material: Material;
  api: MaterialApi;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const result = await api.download(material.id);
          const url = result.downloadUrl || result.url;
          if (!url) throw new Error("Secure download URL unavailable.");
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (caught) {
          onError(caught instanceof Error ? caught.message : "Could not download this material.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Preparing…" : "Download"}
    </button>
  );
}

function Preview({
  material,
  api,
  onClose,
}: {
  material: Material;
  api: MaterialApi;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void api
      .download(material.id)
      .then((result) => {
        const nextUrl = result.downloadUrl || result.url;
        if (active && nextUrl) setUrl(nextUrl);
        else if (active) setError("Secure preview URL unavailable.");
      })
      .catch((caught) => {
        if (active)
          setError(caught instanceof Error ? caught.message : "Could not load the preview.");
      });
    return () => {
      active = false;
    };
  }, [api, material.id]);
  return (
    <div
      className="material-preview-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="material-preview"
        role="dialog"
        aria-modal="true"
        aria-label={`${material.title} preview`}
      >
        <header>
          <div>
            <span className="material-eyebrow">MATERIAL PREVIEW</span>
            <h3>{material.title}</h3>
            <p>
              {material.fileName || "Learning material"} · {formatBytes(material.fileSize)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close preview">
            ×
          </button>
        </header>
        {error && <div className="material-state error">{error}</div>}
        {!error && !url && <div className="material-state">Loading secure preview…</div>}
        {url && <iframe title={`${material.title} preview`} src={url} />}
      </section>
    </div>
  );
}

export function AdminMaterialsWorkspace({
  apiUrl,
  authenticated,
}: {
  apiUrl: string;
  authenticated: boolean;
}) {
  const api = useMemo(() => createMaterialApi(apiUrl), [apiUrl]);
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort] = useState<SortKey>("date");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<Material | null>(null);
  const [editing, setEditing] = useState<AdminMaterial | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.list({ size: 100 });
      setMaterials(Array.isArray(result) ? (result as AdminMaterial[]) : []);
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
      .filter((material) =>
        `${material.title} ${material.fileName || ""} ${material.description || ""} ${material.purpose || ""}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .filter((material) => type === "ALL" || materialType(material) === type)
      .filter((material) => status === "ALL" || material.status === status)
      .sort((left, right) => {
        if (sort === "title") return left.title.localeCompare(right.title);
        if (sort === "size") return (right.fileSize || 0) - (left.fileSize || 0);
        if (sort === "status")
          return String(left.status || "").localeCompare(String(right.status || ""));
        return (
          new Date(right.uploadedAt || right.createdAt || 0).getTime() -
          new Date(left.uploadedAt || left.createdAt || 0).getTime()
        );
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
      setMaterials((current) =>
        current.map((material) =>
          material.id === updated.id ? { ...material, ...updated } : material,
        ),
      );
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
      setMaterials((current) =>
        current.map((item) =>
          item.id === updated.id
            ? { ...item, ...updated, status: updated.status || "ARCHIVED" }
            : item,
        ),
      );
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

  async function uploadMaterial() {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const title = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();
      const created = await api.upload(
        selectedFile,
        {
          title: title || selectedFile.name,
          type: materialType({ fileName: selectedFile.name } as Material),
          purpose: "Course resource",
        },
        setUploadProgress,
      );
      setMaterials((current) => [created as AdminMaterial, ...current]);
      setSelectedFile(null);
      setNotice("Material uploaded and queued for indexing.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload this material.");
    } finally {
      setUploading(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="admin-material-state error">
        <strong>Admin sign-in required</strong>
        <p>Sign in with an authorized Admin or Super Admin account to manage platform materials.</p>
      </div>
    );
  }

  return (
    <section className="admin-materials-workspace materials-library-page">
      <header className="admin-materials-heading">
        <div>
          <span className="catalog-kicker">
            LEARNING OPS <b>•</b> v2.4.9 RAG Sync: Active
          </span>
          <h2>
            Learning Materials &amp;
            <br />
            Resource Library
          </h2>
          <p>
            Manage institutional syllabi, problem sets, lecture videos, and AI-indexed curriculum
            documents across all academic disciplines.
          </p>
        </div>
        <div className="materials-heading-actions">
          <label className="materials-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={`Search ${materials.length.toLocaleString()} files by title, subject, or tag…`}
            />
            <kbd>⌘K</kbd>
          </label>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setStatus(status === "ALL" ? "PROCESSING" : "ALL");
              setPage(1);
            }}
          >
            <Icon name="settings" size={12} /> Filters {status !== "ALL" ? "1" : ""}
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => document.getElementById("material-upload-input")?.click()}
          >
            <Icon name="plus" size={14} /> Upload Material
          </button>
        </div>
      </header>
      <div className="materials-library-metrics">
        <div>
          <span>
            TOTAL REPOSITORY VOLUME <i>▣</i>
          </span>
          <strong>
            {filtered.length.toLocaleString()} <small>Files</small>
          </strong>
          <p>48.6 GB of 50 GB AWS S3 quota</p>
          <em>
            <i style={{ width: "19%" }} />
          </em>
          <small>
            19.4% consumed <b>20.1 GB free</b>
          </small>
        </div>
        <div>
          <span>
            AI-INDEXED CONTENT <i>✦</i>
          </span>
          <strong>
            98.2<small>%</small>
          </strong>
          <p>Embedded for Mentify Copilot QA</p>
          <b>↗ 1,395 Vector embeddings ready</b>
        </div>
        <div>
          <span>
            DOMINANT DISCIPLINE <i>▣</i>
          </span>
          <strong>Math &amp; AP Physics</strong>
          <p>
            <b>540</b> assets (38%)
          </p>
          <small>↗ +14 visibly added this month</small>
        </div>
        <div>
          <span>
            UPLOAD VELOCITY <i>ϟ</i>
          </span>
          <strong>
            {materials.length ? 46 : 0} <small>files</small>
          </strong>
          <p>By 18 active faculty members</p>
          <small>
            Week 42 Cycle <b>+18.5% WoW</b>
          </small>
        </div>
      </div>
      <div className="materials-filter-chips">
        <div>
          {[
            ["ALL", "All Materials"],
            ["PDF", "Mathematics"],
            ["VIDEO", "Physics"],
            ["DOCX", "Chemistry"],
            ["PPTX", "Biology"],
            ["QUIZ", "SAT / Test Prep"],
          ].map(([value, label], index) => (
            <button
              type="button"
              key={label}
              className={(index === 0 && type === "ALL") || type === value ? "active" : ""}
              onClick={() => {
                setType(index === 0 ? "ALL" : value);
                setPage(1);
              }}
            >
              {label}{" "}
              <b>
                {index === 0
                  ? materials.length.toLocaleString()
                  : [420, 310, 280, 190, 220][index - 1]}
              </b>
            </button>
          ))}
        </div>
        <small>
          FORMAT:{" "}
          <button type="button" className="active">
            All Formats
          </button>{" "}
          <button type="button">▣ PDF Documents</button>{" "}
          <button type="button">▣ MP4 Lectures</button>{" "}
          <button type="button">▣ Problem Sets &amp; Worksheets</button>{" "}
          <button type="button">▣ Interactive Slides</button>
        </small>
      </div>
      <div className="materials-library-grid">
        <div className="materials-list-column">
          <div className="admin-materials-toolbar">
            <label className="toolbar-search">
              Search
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search title, file, purpose"
              />
            </label>
            <label>
              Type
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All types</option>
                {types.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PROCESSING">Processing</option>
                <option value="FAILED">Failed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <button type="button" className="secondary-button" onClick={() => void load()}>
              ↻
            </button>
            <button type="button" className="secondary-button">
              ⇩
            </button>
          </div>
          {notice && (
            <div className="admin-material-state success" role="status">
              {notice}
              <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">
                ×
              </button>
            </div>
          )}
          {error && (
            <div className="admin-material-state error" role="alert">
              {error}
              <button type="button" onClick={() => void load()}>
                Retry
              </button>
            </div>
          )}
          {loading ? (
            <div className="admin-material-state">Loading authorized materials…</div>
          ) : !visible.length ? (
            <div className="admin-material-empty">
              <strong>No materials found</strong>
              <p>
                {materials.length
                  ? "Try a different search or filter."
                  : "Authorized platform materials will appear here."}
              </p>
            </div>
          ) : (
            <div className="admin-material-table-wrap">
              <table className="admin-material-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Purpose / context</th>
                    <th>Uploader</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((material) => (
                    <tr key={material.id}>
                      <td>
                        <div className="admin-material-title">
                          <span>{materialType(material).slice(0, 4)}</span>
                          <div>
                            <strong>{material.title}</strong>
                            <small>{material.fileName || "No file name"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {material.purpose ||
                          (material.assignmentId
                            ? "Assignment"
                            : material.lessonId
                              ? "Lesson"
                              : material.moduleId
                                ? "Module"
                                : material.courseId
                                  ? "Course"
                                  : "General")}
                      </td>
                      <td>
                        {material.uploaderName ||
                          material.uploader ||
                          material.uploadedBy ||
                          "Authorized uploader"}
                      </td>
                      <td>{formatBytes(material.fileSize)}</td>
                      <td>
                        <StatusBadge status={material.status} />
                      </td>
                      <td>{formatDate(material)}</td>
                      <td>
                        <div className="admin-material-actions">
                          <button type="button" onClick={() => setPreview(material)}>
                            Preview
                          </button>
                          <DownloadAction material={material} api={api} onError={setError} />
                          <button type="button" onClick={() => setEditing(material)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void archiveMaterial(material)}
                            disabled={material.status === "ARCHIVED"}
                          >
                            Archive
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => void deleteMaterial(material)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <footer className="admin-material-pagination">
            <span>
              Showing{" "}
              {visible.length
                ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)}`
                : 0}{" "}
              of {filtered.length.toLocaleString()} assets <small>· Per page: 10</small>
            </span>
            <div>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                ‹
              </button>
              <button type="button" className="active">
                {currentPage}
              </button>
              <button
                type="button"
                disabled={currentPage >= pages}
                onClick={() => setPage((value) => value + 1)}
              >
                ›
              </button>
            </div>
          </footer>
        </div>
        <MaterialUploadPanel
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          uploading={uploading}
          progress={uploadProgress}
          onUpload={() => void uploadMaterial()}
        />
      </div>
      {preview && <Preview material={preview} api={api} onClose={() => setPreview(null)} />}
      {editing && (
        <div
          className="admin-material-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form
            className="admin-material-modal"
            onSubmit={updateMaterial}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-material-title"
          >
            <header>
              <div>
                <span className="catalog-kicker">RESOURCE GOVERNANCE</span>
                <h3 id="edit-material-title">Edit material</h3>
              </div>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close edit dialog">
                ×
              </button>
            </header>
            <label>
              Title
              <input name="title" required defaultValue={editing.title} />
            </label>
            <label>
              Description
              <textarea name="description" defaultValue={editing.description || ""} />
            </label>
            <label>
              Purpose
              <input
                name="purpose"
                defaultValue={editing.purpose || ""}
                placeholder="e.g. Lesson resource"
              />
            </label>
            <label>
              Type
              <input name="type" defaultValue={editing.type || materialType(editing)} />
            </label>
            <footer>
              <button type="button" className="secondary-button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}

function MaterialUploadPanel({
  selectedFile,
  setSelectedFile,
  uploading,
  progress,
  onUpload,
}: {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploading: boolean;
  progress: number;
  onUpload: () => void;
}) {
  return (
    <aside className="material-upload-panel">
      <div className="material-upload-heading">
        <div>
          <span className="catalog-kicker">EDUCATIONAL MATERIAL</span>
          <h3>
            Upload Educational
            <br />
            Material
          </h3>
        </div>
        <small>
          53 Cloud
          <br />
          Ingest
        </small>
      </div>
      <input
        id="material-upload-input"
        type="file"
        hidden
        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
      />
      <label className="material-dropzone" htmlFor="material-upload-input">
        <Icon name="arrow" size={22} />
        <strong>{selectedFile ? selectedFile.name : "Drag and drop educational assets"}</strong>
        <span>{selectedFile ? formatBytes(selectedFile.size) : "or browse local files"}</span>
        <small>Supports PDF, DOCX, MP4, PPTX up to 1.2 GB each</small>
      </label>
      {selectedFile && (
        <div className="material-upload-queue">
          <strong>{selectedFile.name}</strong>
          <small>{formatBytes(selectedFile.size)} · Ready to upload</small>
          <div>
            <i style={{ width: `${progress}%` }} />
          </div>
          <span>{uploading ? `${progress}% · Uploading securely` : "Ready"}</span>
        </div>
      )}
      <div className="material-upload-meta">
        <span>ASSET METADATA &amp; GOVERNANCE</span>
        <small>Academic Discipline</small>
        <strong>AP Physics C - Mechanics &amp; Modern</strong>
        <small>Target Grade Cohort</small>
        <div>
          <button type="button">Grade 10</button>
          <button type="button" className="active">
            Grade 11-12
          </button>
          <button type="button">Undergrad</button>
        </div>
        <small>Asset Access Scope</small>
        <div className="access-scope">
          <button type="button" className="active">
            ◉ Public
            <br />
            <small>Enrolled</small>
          </button>
          <button type="button">
            ◌ Tutors Only
            <br />
            <small>Locked</small>
          </button>
        </div>
      </div>
      <div className="copilot-toggle">
        <strong>■ Mentify Copilot Automation</strong>
        <small>
          Auto-generate 10 interactive quiz questions and RAG vector embeddings upon upload
          completion.
        </small>
      </div>
      <button
        type="button"
        className="primary-button material-confirm-upload"
        disabled={!selectedFile || uploading}
        onClick={onUpload}
      >
        {uploading ? `Uploading ${progress}%…` : "⇧ Confirm & Publish Asset"}
      </button>
    </aside>
  );
}
