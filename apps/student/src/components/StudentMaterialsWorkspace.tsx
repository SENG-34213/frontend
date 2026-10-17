"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { createMaterialApi } from "../../../shared/materials/materialApi";
import type { Material } from "../../../shared/materials/materialTypes";

const PAGE_SIZE = 8;
const typeOf = (material: Material) =>
  (
    material.type ||
    material.contentType ||
    material.fileName?.split(".").pop() ||
    "FILE"
  ).toUpperCase();
const sizeOf = (bytes?: number) =>
  bytes
    ? `${(bytes / 1024 ** (bytes > 1024 * 1024 ? 2 : 1)).toFixed(1)} ${bytes > 1024 * 1024 ? "MB" : "KB"}`
    : "Size unavailable";

export default function StudentMaterialsWorkspace() {
  const api = useMemo(() => createMaterialApi(), []);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    void api
      .list({ size: 50 })
      .then((result) => {
        if (active) setMaterials(Array.isArray(result) ? result : []);
      })
      .catch((caught) => {
        if (active)
          setError(
            caught instanceof Error ? caught.message : "Could not load your authorized materials.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api]);
  const types = useMemo(() => Array.from(new Set(materials.map(typeOf))).sort(), [materials]);
  const filtered = useMemo(
    () =>
      materials.filter(
        (material) =>
          `${material.title} ${material.fileName || ""} ${material.description || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (type === "ALL" || typeOf(material) === type),
      ),
    [materials, query, type],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  async function access(material: Material, shouldPreview: boolean) {
    try {
      const result = await api.download(material.id);
      const url = result.downloadUrl || result.url;
      if (!url) throw new Error("Secure access URL unavailable.");
      if (shouldPreview) {
        setPreview(url);
        setPreviewTitle(material.title);
      } else window.open(url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not access this material.");
    }
  }
  return (
    <section className="student-materials-workspace">
      <header className="student-materials-heading">
        <div>
          <span className="eyebrow">COURSE LIBRARY</span>
          <h2>Learning materials</h2>
          <p>Resources shared with your enrolled courses and learning activities.</p>
        </div>
        <span>{filtered.length} materials</span>
      </header>
      <div className="student-materials-toolbar">
        <label>
          Search
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search title, file, or context"
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
      </div>
      {error && (
        <div className="student-material-state error">
          {error}
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}
      {loading ? (
        <div className="student-material-state">Loading authorized materials…</div>
      ) : !visible.length ? (
        <div className="student-material-empty">
          <strong>No learning materials found</strong>
          <p>
            {materials.length
              ? "Try a different search or type filter."
              : "Materials become available when they are shared with your enrolled courses."}
          </p>
        </div>
      ) : (
        <div className="student-material-grid">
          {visible.map((material) => (
            <article className="student-material-card" key={material.id}>
              <div className="student-material-icon">{typeOf(material).slice(0, 4)}</div>
              <div>
                <div className="student-material-title">
                  <h3>{material.title}</h3>
                  <span>{typeOf(material)}</span>
                </div>
                <p>{material.description || material.fileName || "Learning resource"}</p>
                <dl>
                  <div>
                    <dt>File</dt>
                    <dd>{material.fileName || "—"}</dd>
                  </div>
                  <div>
                    <dt>Size</dt>
                    <dd>{sizeOf(material.fileSize)}</dd>
                  </div>
                  <div>
                    <dt>Context</dt>
                    <dd>
                      {material.assignmentId
                        ? "Assignment"
                        : material.lessonId
                          ? "Lesson"
                          : material.moduleId
                            ? "Module"
                            : "Course"}
                    </dd>
                  </div>
                  <div>
                    <dt>Uploaded</dt>
                    <dd>
                      {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : "—"}
                    </dd>
                  </div>
                </dl>
                <div className="student-material-actions">
                  <button type="button" onClick={() => void access(material, true)}>
                    Preview
                  </button>
                  <button type="button" onClick={() => void access(material, false)}>
                    Secure download
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <footer className="student-material-pagination">
        <span>
          Page {Math.min(page, pages)} of {pages}
        </span>
        <div>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </footer>
      {preview && (
        <div
          className="student-material-preview"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreview("");
          }}
        >
          <section role="dialog" aria-modal="true" aria-label={`${previewTitle} preview`}>
            <header>
              <div>
                <span className="eyebrow">SECURE PREVIEW</span>
                <h3>{previewTitle}</h3>
              </div>
              <button type="button" onClick={() => setPreview("")} aria-label="Close preview">
                ×
              </button>
            </header>
            <iframe title={`${previewTitle} preview`} src={preview} />
          </section>
        </div>
      )}
    </section>
  );
}
