"use client";

import { useEffect, useMemo, useState } from "react";
import type { Material, MaterialApi, MaterialStatus, MaterialUploadDraft } from "./materialTypes";

function formatBytes(bytes?: number) {
  if (!bytes) return "Size unavailable";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}
function materialType(material: Material) {
  return (
    material.type ||
    material.contentType ||
    material.fileName?.split(".").pop() ||
    "FILE"
  ).toUpperCase();
}
function materialDate(material: Material) {
  const value = material.uploadedAt || material.createdAt || material.updatedAt;
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";
}
function isPreviewable(material: Material) {
  return (
    /^(PDF|IMAGE|PNG|JPG|JPEG|GIF|WEBP|VIDEO|MP4|TEXT|TXT)$/i.test(materialType(material)) ||
    /\.(pdf|png|jpe?g|gif|webp|mp4|txt)$/i.test(material.fileName || "")
  );
}

export function MaterialStatusBadge({ status = "ACTIVE" }: { status?: MaterialStatus }) {
  return <span className={`material-status-badge ${String(status).toLowerCase()}`}>{status}</span>;
}

export function MaterialDownloadAction({
  material,
  api,
  onError,
}: {
  material: Material;
  api: MaterialApi;
  onError?: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="material-download-action"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const result = await api.download(material.id);
          const url = result.downloadUrl || result.url;
          if (!url) throw new Error("The material service did not return a secure download URL.");
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (error) {
          onError?.(error instanceof Error ? error.message : "Could not download this material.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Preparing…" : "Download"}
    </button>
  );
}

export function MaterialPreview({
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
        else if (active) setError("Preview URL unavailable.");
      })
      .catch((caught) => {
        if (active)
          setError(caught instanceof Error ? caught.message : "Could not load the preview.");
      });
    return () => {
      active = false;
    };
  }, [api, material.id]);
  const type = materialType(material);
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
        {url && /^PDF$/i.test(type) && <iframe title={`${material.title} preview`} src={url} />}
        {url && /^(PNG|JPG|JPEG|GIF|WEBP|IMAGE)$/i.test(type) && (
          <img src={url} alt={material.title} />
        )}
        {url && /^(VIDEO|MP4)$/i.test(type) && <video src={url} controls />}
        {url && !/^(PDF|PNG|JPG|JPEG|GIF|WEBP|IMAGE|VIDEO|MP4)$/i.test(type) && (
          <div className="material-preview-fallback">
            <p>This file type is available for secure download.</p>
            <a href={url} target="_blank" rel="noreferrer">
              Open material
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

export function MaterialCard({
  material,
  api,
  onPreview,
  onError,
}: {
  material: Material;
  api: MaterialApi;
  onPreview: (material: Material) => void;
  onError: (message: string) => void;
}) {
  return (
    <article className="material-card">
      <div className="material-card-icon">{materialType(material).slice(0, 4)}</div>
      <div className="material-card-copy">
        <div className="material-card-heading">
          <h3>{material.title}</h3>
          <MaterialStatusBadge status={material.status} />
        </div>
        <p>{material.description || material.fileName || "Learning material"}</p>
        <dl>
          <div>
            <dt>Type</dt>
            <dd>{materialType(material)}</dd>
          </div>
          <div>
            <dt>File</dt>
            <dd title={material.fileName}>{material.fileName || "—"}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{formatBytes(material.fileSize)}</dd>
          </div>
          <div>
            <dt>Uploaded</dt>
            <dd>{materialDate(material)}</dd>
          </div>
        </dl>
        <div className="material-card-actions">
          {isPreviewable(material) && (
            <button
              type="button"
              className="material-preview-action"
              onClick={() => onPreview(material)}
            >
              Preview
            </button>
          )}
          <MaterialDownloadAction material={material} api={api} onError={onError} />
        </div>
      </div>
    </article>
  );
}

export function MaterialUploader({
  api,
  defaults,
  onUploaded,
}: {
  api: MaterialApi;
  defaults?: Partial<MaterialUploadDraft>;
  onUploaded: (material: Material) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function choose(next: File | null) {
    setFile(next);
    if (next && !title) setTitle(next.name.replace(/\.[^.]+$/, ""));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const uploaded = await api.upload(
        file,
        {
          ...defaults,
          title: title.trim() || file.name,
          description: description.trim(),
          type: file.type || file.name.split(".").pop()?.toUpperCase(),
        },
        setProgress,
      );
      onUploaded(uploaded);
      setFile(null);
      setTitle("");
      setDescription("");
      setProgress(100);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload the material.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="material-uploader" onSubmit={submit}>
      <div className="material-uploader-heading">
        <div>
          <span className="material-eyebrow">ADD RESOURCE</span>
          <h2>Upload material</h2>
          <p>Share a secure learning resource with the selected audience.</p>
        </div>
        <span className="material-upload-limit">PDF, DOCX, PPTX, images, video</span>
      </div>
      <label className="material-dropzone">
        <input type="file" onChange={(event) => choose(event.target.files?.[0] || null)} />
        {file ? (
          <>
            <strong>{file.name}</strong>
            <span>{formatBytes(file.size)} selected</span>
          </>
        ) : (
          <>
            <strong>Choose a file</strong>
            <span>or drag and drop it here</span>
          </>
        )}
      </label>
      <div className="material-upload-fields">
        <label>
          Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Material title"
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional description"
          />
        </label>
      </div>
      {error && <div className="material-state error">{error}</div>}
      {busy && (
        <div className="material-progress">
          <span style={{ width: `${progress}%` }} />
          <small>Uploading {progress}%</small>
        </div>
      )}
      <button type="submit" className="material-upload-button" disabled={busy}>
        {busy ? "Uploading…" : "Upload material"}
      </button>
    </form>
  );
}

export function MaterialList({
  api,
  canUpload = false,
  uploadDefaults,
  title = "Learning materials",
}: {
  api: MaterialApi;
  canUpload?: boolean;
  uploadDefaults?: Partial<MaterialUploadDraft>;
  title?: string;
}) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [preview, setPreview] = useState<Material | null>(null);
  const [notice, setNotice] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.list();
      setMaterials(Array.isArray(result) ? result : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load materials.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [api]);
  const types = useMemo(() => Array.from(new Set(materials.map(materialType))).sort(), [materials]);
  const filtered = useMemo(
    () =>
      materials.filter((material) => {
        const haystack =
          `${material.title} ${material.fileName || ""} ${material.description || ""}`.toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) &&
          (type === "ALL" || materialType(material) === type) &&
          (status === "ALL" || material.status === status)
        );
      }),
    [materials, query, status, type],
  );
  return (
    <section className="materials-workspace">
      {canUpload && (
        <MaterialUploader
          api={api}
          defaults={uploadDefaults}
          onUploaded={(material) => {
            setMaterials((current) => [material, ...current]);
            setNotice("Material uploaded successfully.");
          }}
        />
      )}
      <header className="materials-heading">
        <div>
          <span className="material-eyebrow">RESOURCE LIBRARY</span>
          <h1>{title}</h1>
          <p>Find, preview, and securely access course resources.</p>
        </div>
        <span className="materials-count">{filtered.length} materials</span>
      </header>
      <div className="materials-toolbar">
        <label className="materials-search">
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or file name"
          />
        </label>
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="ALL">All types</option>
            {types.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
        <button type="button" className="materials-refresh" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      {notice && <div className="material-state success">{notice}</div>}
      {error && (
        <div className="material-state error">
          {error}
          <button type="button" onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}
      {loading ? (
        <div className="material-state">Loading materials…</div>
      ) : !filtered.length ? (
        <div className="material-empty">
          <strong>No materials found</strong>
          <p>
            {materials.length
              ? "Try a different search or filter."
              : "Uploaded learning resources will appear here."}
          </p>
        </div>
      ) : (
        <div className="material-grid">
          {filtered.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              api={api}
              onPreview={setPreview}
              onError={setError}
            />
          ))}
        </div>
      )}
      {preview && <MaterialPreview material={preview} api={api} onClose={() => setPreview(null)} />}
    </section>
  );
}
