import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  Eye,
  Edit3,
  Check,
  FileText,
  Upload,
  Download,
  FileArchive,
} from "lucide-react";
import { Lesson, Module } from "../types";
import { deleteModuleMaterial } from "../api/courseContentApi";
import { getMaterialDownload } from "../api/materialApi";
import { ConfirmModal } from "../components/ActionModal";

interface LessonEditorModalProps {
  isOpen: boolean;
  lesson: Lesson | null;
  module: Module | null;
  onClose: () => void;
  onSave: (updatedLesson: Lesson, pendingFiles: File[]) => void | Promise<void>;
  uploadProgress?: {
    current: number;
    total: number;
    fileName: string;
    status: "uploading" | "complete" | "error";
  } | null;
}

const PendingFilePreview: React.FC<{ file: File }> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file.type.startsWith("image/") && previewUrl) {
    return (
      <img
        src={previewUrl}
        alt=""
        className="h-11 w-14 rounded-md object-cover border border-indigo-200"
      />
    );
  }
  if (file.type === "application/pdf" && previewUrl) {
    return (
      <iframe
        title={`${file.name} preview`}
        src={previewUrl}
        className="h-11 w-14 rounded-md border border-indigo-200"
      />
    );
  }
  return file.type.includes("zip") || file.type.includes("archive") ? (
    <FileArchive className="w-5 h-5 text-amber-600 shrink-0" />
  ) : (
    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
  );
};

export const LessonEditorModal: React.FC<LessonEditorModalProps> = ({
  isOpen,
  lesson,
  module,
  onClose,
  onSave,
  uploadProgress = null,
}) => {
  // Keep hooks unconditional. This modal is mounted even while it is closed,
  // and returning before hooks run causes React's static-flag error when it
  // transitions between open and closed states.
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(lesson?.durationMinutes ?? 0);
  const [contentType, setContentType] = useState(lesson?.contentType ?? "Lecture");
  const [status, setStatus] = useState(lesson?.status ?? "Draft");
  const [contentMarkdown, setContentMarkdown] = useState(
    lesson?.contentMarkdown ||
      `### Learning Objectives\n- Master fundamental asymptotic invariants.\n- Implement core balancing rotations without memory leaks.\n- Benchmark algorithmic execution against baseline implementations.`,
  );
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isSaved, setIsSaved] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachedMaterials, setAttachedMaterials] = useState<NonNullable<Lesson["materials"]>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [downloadingMaterialId, setDownloadingMaterialId] = useState<string | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [materialToRemove, setMaterialToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (!lesson) return;
    setTitle(lesson.title);
    setDescription(lesson.description);
    setDurationMinutes(lesson.durationMinutes);
    setContentType(lesson.contentType);
    setStatus(lesson.status);
    setContentMarkdown(lesson.contentMarkdown || "");
    setPendingFiles([]);
    setAttachedMaterials(lesson.materials || []);
    setMode("edit");
    setIsSaved(false);
  }, [lesson]);

  const handleSave = async () => {
    if (!lesson) return;
    setIsSaving(true);
    const updated: Lesson = {
      ...lesson,
      title,
      description,
      durationMinutes: Number(durationMinutes),
      contentType,
      status,
      contentMarkdown,
      materials: attachedMaterials,
    };
    try {
      await onSave(updated, pendingFiles);
      setIsSaved(true);
      setPendingFiles([]);
    } finally {
      setIsSaving(false);
    }
  };

  const materials = attachedMaterials;
  const isUploading = uploadProgress?.status === "uploading";
  const materialLabel = (material: (typeof materials)[number]) =>
    material.originalFilename || material.title || "Learning material";
  const formatBytes = (bytes?: number) => {
    if (!bytes) return "Size unavailable";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadMaterial = async (materialId: string) => {
    setDownloadingMaterialId(materialId);
    setMaterialError(null);
    try {
      const result = await getMaterialDownload(materialId);
      const url = result.downloadUrl;
      if (!url) throw new Error("A secure material URL was not returned.");
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "";
      downloadLink.target = "_blank";
      downloadLink.rel = "noopener noreferrer";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (error) {
      setMaterialError(error instanceof Error ? error.message : "Material could not be opened.");
    } finally {
      setDownloadingMaterialId(null);
    }
  };

  const removeMaterial = async () => {
    const materialId = materialToRemove;
    if (!module?.courseId || !materialId) {
      return;
    }
    setMaterialError(null);
    try {
      await deleteModuleMaterial(module.courseId, module.id, materialId);
      setAttachedMaterials((current) => current.filter((material) => material.id !== materialId));
      setMaterialToRemove(null);
    } catch (error) {
      setMaterialError(error instanceof Error ? error.message : "Material could not be removed.");
    }
  };

  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>{module?.title || "Module"}</span>
              <span>·</span>
              <span className="font-semibold text-indigo-600">Lesson Editor</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{title || "Edit Lesson"}</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`px-3 py-1 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  mode === "edit"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`px-3 py-1 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  mode === "preview"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {mode === "edit" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab Exercise</option>
                    <option value="Reading">Reading Material</option>
                    <option value="Discussion">Class Discussion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(e.target.value === "" ? 0 : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Published">Published to Students</option>
                    <option value="Draft">Draft (Faculty Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brief Overview
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden resize-none"
                />
              </div>

              <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                      Lesson materials
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload any approved learning resource format. Files are stored securely.
                    </p>
                  </div>
                  <label className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${isUploading ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : "cursor-pointer border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"}`}>
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? "Uploading…" : materials.length || pendingFiles.length ? "Add more files" : "Add files"}
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      disabled={isUploading}
                      onChange={(event) => {
                        setPendingFiles((current) => [
                          ...current,
                          ...Array.from(event.target.files || []),
                        ]);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                {uploadProgress && (
                  <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${uploadProgress.status === "error" ? "bg-rose-50 text-rose-700" : uploadProgress.status === "complete" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"}`}>
                    <span className="font-semibold">
                      {uploadProgress.status === "complete"
                        ? "Upload complete"
                        : uploadProgress.status === "error"
                          ? "Upload failed"
                          : `Uploading ${uploadProgress.current + 1} of ${uploadProgress.total}`}
                    </span>
                    <span className="truncate pl-3 text-[11px]">{uploadProgress.fileName}</span>
                  </div>
                )}
                {materials.length === 0 && pendingFiles.length === 0 && (
                  <p className="text-xs text-slate-500">No materials are attached yet.</p>
                )}
                {materialError && <p className="text-xs text-rose-600">{materialError}</p>}
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white border border-slate-200 px-3 py-2"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => material.materialId && void downloadMaterial(material.materialId)}
                          disabled={!material.materialId || downloadingMaterialId === material.materialId}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-default disabled:opacity-60"
                          aria-label={`Download ${materialLabel(material)}`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {materialLabel(material)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {material.type || material.contentType || "FILE"} ·{" "}
                            {formatBytes(material.fileSize)} · {material.status || "AVAILABLE"}
                          </p>
                        </div>
                      </div>
                      {material.materialId && (
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void downloadMaterial(material.materialId as string)}
                            disabled={downloadingMaterialId === material.materialId}
                            className="text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50 flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {downloadingMaterialId === material.materialId ? "Downloading…" : "Download"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setMaterialToRemove(material.id)}
                            className="text-xs text-rose-600 hover:text-rose-800"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {pendingFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <PendingFilePreview file={file} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-indigo-900 truncate">{file.name}</p>
                            <p className="text-[11px] text-indigo-700">
                              Preview ready · {formatBytes(file.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        className="text-xs text-rose-600 hover:text-rose-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {uploadProgress && (
                  <div className="rounded-lg border border-indigo-200 bg-white p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-800">
                      <span>
                        {uploadProgress.status === "complete"
                          ? "All files uploaded"
                          : uploadProgress.status === "error"
                            ? "Upload failed"
                            : `Uploading file ${uploadProgress.current} of ${uploadProgress.total}`}
                      </span>
                      <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-indigo-100">
                      <div
                        className={`h-full rounded-full transition-all ${uploadProgress.status === "error" ? "bg-rose-500" : "bg-indigo-600"}`}
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="truncate text-[11px] text-slate-500">{uploadProgress.fileName}</p>
                  </div>
                )}
              </section>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lesson Body & Objectives (Markdown Supported)
                </label>
                <textarea
                  rows={8}
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {contentType} · {durationMinutes} Minutes
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">{title}</h2>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              </div>

              <pre className="prose prose-sm max-w-none text-xs text-slate-700 space-y-2 whitespace-pre-wrap leading-relaxed font-sans">
                {contentMarkdown}
              </pre>
              <section className="border-t border-slate-200 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">
                  Materials ({materials.length})
                </h3>
                <div className="space-y-2">
                  {materials.length ? (
                    materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center gap-2 text-xs text-slate-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="truncate">{materialLabel(material)}</span>
                        <span className="text-slate-400">
                          ({material.type || material.contentType || "FILE"})
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No materials attached.</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">Changes are saved automatically</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving…" : "Save Lesson"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={Boolean(materialToRemove)}
        title="Remove learning material?"
        description="This removes the material from this lesson and cannot be undone."
        onClose={() => setMaterialToRemove(null)}
        onConfirm={removeMaterial}
      />
    </div>
  );
};
