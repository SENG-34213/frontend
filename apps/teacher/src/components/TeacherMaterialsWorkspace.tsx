"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createMaterialApi } from "../../../shared/materials/materialApi";
import type { Material } from "../../../shared/materials/materialTypes";
import {
  teacherApi,
  type CourseLesson,
  type CourseModule,
  type TeacherAssignment,
  type TeacherCourse,
} from "../lib/teacherApi";

const PAGE_SIZE = 6;
const readableSize = (bytes?: number) => (bytes ? `${Math.round(bytes / 1024)} KB` : "—");
const materialType = (material: Material) =>
  (
    material.type ||
    material.contentType ||
    material.fileName?.split(".").pop() ||
    "FILE"
  ).toUpperCase();

export default function TeacherMaterialsWorkspace({ courses }: { courses: TeacherCourse[] }) {
  const api = useMemo(() => createMaterialApi(), []);
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    moduleId: "",
    lessonId: "",
    assignmentId: "",
  });
  const [editing, setEditing] = useState<Material | null>(null);
  const [previewUrl, setPreviewUrlState] = useState("");
  const setPreviewUrl = (url = "") => setPreviewUrlState(url);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async (nextCourseId = courseId) => {
    setLoading(true);
    setError("");
    try {
      const [nextMaterials, nextModules, nextAssignments] = await Promise.all([
        api.list({ courseId: nextCourseId, size: 50 }),
        teacherApi.modules(nextCourseId).catch(() => []),
        teacherApi.assignments(nextCourseId).catch(() => []),
      ]);
      setMaterials(Array.isArray(nextMaterials) ? nextMaterials : []);
      setModules(nextModules);
      setAssignments(nextAssignments);
      const lessonGroups = await Promise.all(
        nextModules.map((module) => teacherApi.lessons(nextCourseId, module.id).catch(() => [])),
      );
      setLessons(lessonGroups.flat());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load authorized materials.");
    } finally {
      setLoading(false);
    }
  };
  // Material loading intentionally starts after the selected course is known.
  useEffect(() => {
    if (courseId) {
      // The loader updates the request state after the selected course changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load(courseId);
    }
    // The loader is intentionally tied only to the selected course.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);
  const types = useMemo(() => Array.from(new Set(materials.map(materialType))).sort(), [materials]);
  const filtered = useMemo(
    () =>
      materials.filter((material) => {
        const haystack =
          `${material.title} ${material.fileName || ""} ${material.description || ""}`.toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) &&
          (type === "ALL" || materialType(material) === type) &&
          (status === "ALL" || (material.status || "ACTIVE") === status)
        );
      }),
    [materials, query, status, type],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  function chooseFile(next: File | null) {
    setFile(next);
    if (next && !draft.title)
      setDraft((current) => ({ ...current, title: next.name.replace(/\.[^.]+$/, "") }));
  }
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file || !courseId) return;
    setBusy(true);
    setError("");
    setNotice("");
    setProgress(0);
    try {
      const created = await api.upload(
        file,
        {
          title: draft.title.trim() || file.name,
          description: draft.description.trim(),
          courseId,
          moduleId: draft.moduleId || undefined,
          lessonId: draft.lessonId || undefined,
          assignmentId: draft.assignmentId || undefined,
          type: file.type || file.name.split(".").pop()?.toUpperCase(),
        },
        setProgress,
      );
      setMaterials((current) => [created, ...current]);
      setFile(null);
      setDraft({ title: "", description: "", moduleId: "", lessonId: "", assignmentId: "" });
      setNotice("Material uploaded successfully.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Upload failed. The server may have rejected this course attachment.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function download(material: Material, preview = false) {
    try {
      const result = await api.download(material.id);
      const url = result.downloadUrl || result.url;
      if (!url) throw new Error("Secure access URL unavailable.");
      if (preview) setPreviewUrl(url);
      else window.open(url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not access this material.");
    }
  }
  async function saveMetadata(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      const updated = await api.update(editing.id, {
        title: editing.title,
        description: editing.description,
        type: editing.type,
        courseId: editing.courseId,
        moduleId: editing.moduleId,
        lessonId: editing.lessonId,
        assignmentId: editing.assignmentId,
      });
      setMaterials((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setEditing(null);
      setNotice("Material details updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update material details.");
    } finally {
      setBusy(false);
    }
  }
  async function archive(material: Material) {
    setBusy(true);
    try {
      const updated = await api.archive(material.id);
      setMaterials((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice("Material archived.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not archive material.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(material: Material) {
    if (!window.confirm(`Delete “${material.title}”?`)) return;
    setBusy(true);
    try {
      await api.remove(material.id);
      setMaterials((current) => current.filter((item) => item.id !== material.id));
      setNotice("Material deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete material.");
    } finally {
      setBusy(false);
    }
  }
  async function attach(
    material: Material,
    target: { moduleId?: string; lessonId?: string; assignmentId?: string },
  ) {
    setBusy(true);
    try {
      const updated = await api.attach(material.id, { courseId, ...target });
      setMaterials((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice("Material attachment updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The backend rejected this attachment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="materials-workspace teacher-material-manager">
      <header className="materials-heading">
        <div>
          <span className="material-eyebrow">TEACHER RESOURCE MANAGEMENT</span>
          <h1>Course materials</h1>
          <p>Upload, organize, and manage resources for your authorized course content.</p>
        </div>
        <label className="teacher-material-course">
          Course
          <select
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setPage(1);
            }}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </label>
      </header>
      <form className="material-uploader" onSubmit={upload}>
        <div className="material-uploader-heading">
          <div>
            <span className="material-eyebrow">ADD RESOURCE</span>
            <h2>Upload material</h2>
            <p>
              Attach it to a course, module, lesson, or assignment. Authorization is enforced by the
              Material Service.
            </p>
          </div>
        </div>
        <label className="material-dropzone">
          <input
            type="file"
            required
            onChange={(event) => chooseFile(event.target.files?.[0] || null)}
          />
          {file ? (
            <>
              <strong>{file.name}</strong>
              <span>{readableSize(file.size)} selected</span>
            </>
          ) : (
            <>
              <strong>Choose a file</strong>
              <span>PDF, DOCX, PPTX, images, or video</span>
            </>
          )}
        </label>
        <div className="material-upload-fields">
          <label>
            Title
            <input
              required
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Material title"
            />
          </label>
          <label>
            Description
            <textarea
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="Optional description"
            />
          </label>
        </div>
        <div className="teacher-material-attach-fields">
          <label>
            Module
            <select
              value={draft.moduleId}
              onChange={(event) =>
                setDraft({ ...draft, moduleId: event.target.value, lessonId: "" })
              }
            >
              <option value="">Course only</option>
              {modules.map((module) => (
                <option value={module.id} key={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lesson
            <select
              value={draft.lessonId}
              onChange={(event) => setDraft({ ...draft, lessonId: event.target.value })}
            >
              <option value="">No lesson</option>
              {lessons
                .filter((lesson) => !draft.moduleId || lesson.id)
                .map((lesson) => (
                  <option value={lesson.id} key={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Assignment
            <select
              value={draft.assignmentId}
              onChange={(event) => setDraft({ ...draft, assignmentId: event.target.value })}
            >
              <option value="">No assignment</option>
              {assignments.map((assignment) => (
                <option value={assignment.id} key={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        {busy && (
          <div className="material-progress">
            <span style={{ width: `${progress}%` }} />
            <small>Uploading {progress}%</small>
          </div>
        )}
        <button type="submit" className="material-upload-button" disabled={busy || !file}>
          {busy ? "Uploading…" : "Upload material"}
        </button>
      </form>
      {error && <div className="material-state error">{error}</div>}
      {notice && <div className="material-state success">{notice}</div>}
      <div className="materials-toolbar">
        <label className="materials-search">
          Search
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search title or file name"
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
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
        <button type="button" className="materials-refresh" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="material-state">Loading authorized materials…</div>
      ) : !visible.length ? (
        <div className="material-empty">
          <strong>No materials found</strong>
          <p>
            {materials.length
              ? "Try a different search or filter."
              : "Your authorized course materials will appear here."}
          </p>
        </div>
      ) : (
        <div className="material-grid">
          {visible.map((material) => (
            <article className="material-card" key={material.id}>
              <div className="material-card-icon">{materialType(material).slice(0, 4)}</div>
              <div className="material-card-copy">
                <div className="material-card-heading">
                  <h3>{material.title}</h3>
                  <span
                    className={`material-status-badge ${String(material.status || "ACTIVE").toLowerCase()}`}
                  >
                    {material.status || "ACTIVE"}
                  </span>
                </div>
                <p>{material.fileName || material.description || "Learning material"}</p>
                <dl>
                  <div>
                    <dt>Type</dt>
                    <dd>{materialType(material)}</dd>
                  </div>
                  <div>
                    <dt>File</dt>
                    <dd>{readableSize(material.fileSize)}</dd>
                  </div>
                  <div>
                    <dt>Scope</dt>
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
                <div className="material-card-actions">
                  <button
                    type="button"
                    className="material-preview-action"
                    onClick={() => void download(material, true)}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    className="material-download-action"
                    onClick={() => void download(material)}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="material-preview-action"
                    onClick={() => setEditing({ ...material })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="material-preview-action"
                    disabled={busy}
                    onClick={() => void archive(material)}
                  >
                    Archive
                  </button>
                  <button
                    type="button"
                    className="material-preview-action"
                    disabled={busy}
                    onClick={() => void remove(material)}
                  >
                    Delete
                  </button>
                </div>
                <div className="teacher-material-quick-attach">
                  <select
                    defaultValue=""
                    onChange={(event) => {
                      const [kind, id] = event.target.value.split(":");
                      if (id)
                        void attach(material, {
                          ...(kind === "module"
                            ? { moduleId: id }
                            : kind === "lesson"
                              ? { lessonId: id }
                              : { assignmentId: id }),
                        });
                    }}
                  >
                    <option value="">Attach to…</option>
                    {modules.map((module) => (
                      <option key={`module:${module.id}`} value={`module:${module.id}`}>
                        Module · {module.title}
                      </option>
                    ))}
                    {lessons.map((lesson) => (
                      <option key={`lesson:${lesson.id}`} value={`lesson:${lesson.id}`}>
                        Lesson · {lesson.title}
                      </option>
                    ))}
                    {assignments.map((assignment) => (
                      <option
                        key={`assignment:${assignment.id}`}
                        value={`assignment:${assignment.id}`}
                      >
                        Assignment · {assignment.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="teacher-material-pagination">
        <span>
          Page {Math.min(page, pages)} of {pages} · {filtered.length} materials
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
      </div>
      {editing && (
        <div className="material-preview-backdrop" role="presentation">
          <form className="material-preview teacher-material-edit-modal" onSubmit={saveMetadata}>
            <header>
              <div>
                <span className="material-eyebrow">EDIT METADATA</span>
                <h3>{editing.title}</h3>
                <p>{editing.fileName || "Material details"}</p>
              </div>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close editor">
                ×
              </button>
            </header>
            <div className="material-edit-fields">
              <label>
                Title
                <input
                  required
                  value={editing.title}
                  onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  value={editing.description || ""}
                  onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                />
              </label>
              <label>
                Module
                <select
                  value={editing.moduleId || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, moduleId: event.target.value || undefined })
                  }
                >
                  <option value="">Course only</option>
                  {modules.map((module) => (
                    <option value={module.id} key={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Lesson
                <select
                  value={editing.lessonId || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, lessonId: event.target.value || undefined })
                  }
                >
                  <option value="">No lesson</option>
                  {lessons.map((lesson) => (
                    <option value={lesson.id} key={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Assignment
                <select
                  value={editing.assignmentId || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, assignmentId: event.target.value || undefined })
                  }
                >
                  <option value="">No assignment</option>
                  {assignments.map((assignment) => (
                    <option value={assignment.id} key={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" className="material-upload-button" disabled={busy}>
              Save changes
            </button>
          </form>
        </div>
      )}
      {previewUrl && (
        <div
          className="material-preview-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewUrl("");
          }}
        >
          <section className="material-preview" role="dialog" aria-modal="true">
            <header>
              <div>
                <span className="material-eyebrow">SECURE PREVIEW</span>
                <h3>Material preview</h3>
              </div>
              <button type="button" onClick={() => setPreviewUrl()} aria-label="Close preview">
                ×
              </button>
            </header>
            <iframe title="Secure material preview" src={previewUrl} />
          </section>
        </div>
      )}
    </section>
  );
}
