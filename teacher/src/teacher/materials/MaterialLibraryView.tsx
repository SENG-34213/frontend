import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  File,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  Grid,
  Info,
  List,
  Loader2,
  Music,
  PlayCircle,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  Video,
  Clock,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import {
  archiveMaterial,
  deleteMaterial,
  getMaterialDownload,
  getMaterials,
  type Material,
  type MaterialFilters,
  type MaterialPage,
  type MaterialPurpose,
  type MaterialStatus,
  type MaterialType,
  updateMaterial,
  uploadMaterial,
} from "../api/materialApi";

type Props = { backendCourses?: BackendCourse[] };
const emptyPage: MaterialPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true,
};
const purposes: [MaterialPurpose, string][] = [
  ["LEARNING_MATERIAL", "Learning material"],
  ["ASSIGNMENT_ATTACHMENT", "Assignment attachment"],
  ["AI_SOURCE", "AI source"],
  ["OTHER", "Other"],
];
const types: [MaterialType, string][] = [
  ["PDF", "PDF"],
  ["DOCUMENT", "Document"],
  ["PRESENTATION", "Presentation"],
  ["SPREADSHEET", "Spreadsheet"],
  ["IMAGE", "Image"],
  ["VIDEO", "Video"],
  ["AUDIO", "Audio"],
  ["ARCHIVE", "Archive"],
];
function bytes(value: number) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}
function typeIcon(type: MaterialType, className = "h-5 w-5") {
  if (type === "VIDEO" || type === "AUDIO") return <PlayCircle className={className} />;
  if (type === "IMAGE") return <FileImage className={className} />;
  if (type === "ARCHIVE") return <FileArchive className={className} />;
  return type === "PDF" ? <FileText className={className} /> : <File className={className} />;
}
function statusClass(status: MaterialStatus) {
  if (status === "AVAILABLE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "ARCHIVED") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "FAILED") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}
function materialError(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load this resource.";
}

export const MaterialLibraryView: React.FC<Props> = ({ backendCourses = [] }) => {
  const [filters, setFilters] = useState<MaterialFilters>({
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });
  const [page, setPage] = useState(emptyPage);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [active, setActive] = useState<Material | null>(null);
  const [modal, setModal] = useState<
    "upload" | "edit" | "details" | "preview" | "archive" | "delete" | null
  >(null);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const assignedCourseIds = backendCourses
          .map((course) => course.id)
          .filter((courseId): courseId is string => Boolean(courseId));
        const courseIds = filters.courseId
          ? assignedCourseIds.filter((courseId) => courseId === filters.courseId)
          : assignedCourseIds;

        if (!courseIds.length) {
          setPage({ ...emptyPage, size: filters.size || emptyPage.size });
          return;
        }

        const { page: requestedPage, size: requestedSize, sort: _sort, ...queryFilters } = filters;
        const materialsByCourse = await Promise.all(
          courseIds.map(async (courseId) => {
            const materials: Material[] = [];
            let pageNumber = 0;

            do {
              const result = await getMaterials(
                {
                  ...queryFilters,
                  courseId,
                  page: pageNumber,
                  // Fetch every page for each assigned course, then paginate the
                  // combined result so one course cannot hide another course's materials.
                  size: 100,
                },
                signal,
              );
              materials.push(...result.content);
              if (result.last || !result.content.length) break;
              pageNumber += 1;
            } while (!signal?.aborted);

            return materials;
          }),
        );

        const allMaterials = materialsByCourse.flat();
        const sort = filters.sort || "createdAt,desc";
        const [sortField, direction] = sort.split(",");
        const multiplier = direction === "asc" ? 1 : -1;
        allMaterials.sort((left, right) => {
          if (sortField === "title,asc" || sortField === "title") {
            return left.title.localeCompare(right.title) * multiplier;
          }
          if (sortField === "fileSize") {
            return (left.fileSize - right.fileSize) * multiplier;
          }
          return (
            (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * multiplier
          );
        });

        const size = requestedSize || emptyPage.size;
        const pageNumber = requestedPage || 0;
        const start = pageNumber * size;
        const content = allMaterials.slice(start, start + size);
        setPage({
          content,
          totalElements: allMaterials.length,
          totalPages: Math.ceil(allMaterials.length / size),
          size,
          number: pageNumber,
          first: pageNumber === 0,
          last: start + size >= allMaterials.length,
          numberOfElements: content.length,
          empty: content.length === 0,
        });
      } catch (err) {
        if (!signal?.aborted) setError(materialError(err));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [backendCourses, filters],
  );
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const courseName = (id: string | null) =>
    backendCourses.find((course) => course.id === id)?.subject ||
    backendCourses.find((course) => course.id === id)?.courseName ||
    id ||
    "—";
  const changeFilter = (next: Partial<MaterialFilters>) =>
    setFilters((current) => ({ ...current, ...next, page: 0 }));
  const download = async (material: Material) => {
    try {
      const result = await getMaterialDownload(material.id);
      window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
      setNotice(`Download link issued for “${material.originalFilename}”.`);
    } catch (err) {
      setError(materialError(err));
    }
  };
  const action = async (kind: "archive" | "delete", material: Material) => {
    try {
      if (kind === "archive") await archiveMaterial(material.id);
      else await deleteMaterial(material.id);
      setModal(null);
      setActive(null);
      setNotice(kind === "archive" ? "Material archived." : "Material deleted.");
      load();
    } catch (err) {
      setError(materialError(err));
    }
  };
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {notice && (
        <div className="pointer-events-auto fixed bottom-5 right-5 z-[70] flex w-[min(calc(100vw-2.5rem),24rem)] items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-white shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <p className="min-w-0 flex-1 font-semibold leading-5">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 p-0.5 text-slate-400 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Course Learning Materials
            </h1>
            <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
              Learning Resources Ready
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manage, upload, preview, and organize learning resources for your assigned courses.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setViewMode("grid")}
              className={`rounded p-1.5 ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Table view"
              onClick={() => setViewMode("table")}
              className={`rounded p-1.5 ${viewMode === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setModal("upload")}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Course Material
          </button>
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm">
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search || ""}
              onChange={(event) => changeFilter({ search: event.target.value })}
              placeholder="Search by title, original filename..."
              className="w-full max-w-md rounded-xl border border-slate-200 px-3 py-2 pl-9 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.courseId || ""}
              onChange={(event) => changeFilter({ courseId: event.target.value || undefined })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="">All Courses</option>
              {backendCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.subject || course.courseName}
                </option>
              ))}
            </select>
            <select
              value={filters.type || ""}
              onChange={(event) =>
                changeFilter({
                  type: (event.target.value || undefined) as MaterialType | undefined,
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="">All Types</option>
              {types.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filters.purpose || ""}
              onChange={(event) =>
                changeFilter({
                  purpose: (event.target.value || undefined) as MaterialPurpose | undefined,
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="">All Purposes</option>
              {purposes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filters.status || ""}
              onChange={(event) =>
                changeFilter({
                  status: (event.target.value || undefined) as MaterialStatus | undefined,
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="AVAILABLE">Available</option>
              <option value="PROCESSING">Processing</option>
              <option value="ARCHIVED">Archived</option>
              <option value="FAILED">Failed</option>
            </select>
            <select
              value={filters.sort || "createdAt,desc"}
              onChange={(event) => changeFilter({ sort: event.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="createdAt,desc">Newest First</option>
              <option value="createdAt,asc">Oldest First</option>
              <option value="title,asc">Title (A-Z)</option>
              <option value="fileSize,desc">Largest File</option>
            </select>
            <button
              type="button"
              onClick={() => load()}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              aria-label="Refresh materials"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="mt-5 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : page.empty || !page.content.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center">
          <FolderOpen className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">No learning materials found</h3>
          <p className="mt-1 text-xs text-slate-500">No resources match the active filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {page.content.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              courseName={courseName(material.courseId)}
              onPreview={() => {
                setActive(material);
                setModal("preview");
              }}
              onDownload={() => download(material)}
              onDetails={() => {
                setActive(material);
                setModal("details");
              }}
              onEdit={() => {
                setActive(material);
                setModal("edit");
              }}
              onArchive={() => {
                setActive(material);
                setModal("archive");
              }}
              onDelete={() => {
                setActive(material);
                setModal("delete");
              }}
            />
          ))}
        </div>
      ) : (
        <MaterialTable
          materials={page.content}
          courseName={courseName}
          onPreview={(material) => {
            setActive(material);
            setModal("preview");
          }}
          onDownload={download}
          onEdit={(material) => {
            setActive(material);
            setModal("edit");
          }}
          onArchive={(material) => {
            setActive(material);
            setModal("archive");
          }}
          onDelete={(material) => {
            setActive(material);
            setModal("delete");
          }}
        />
      )}
      {!loading && page.totalElements > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
          <span>
            {page.totalElements} material{page.totalElements === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-3">
            <select
              value={filters.size}
              onChange={(event) => changeFilter({ size: Number(event.target.value) })}
              className="rounded border border-slate-200 bg-white px-2 py-1"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
            <button
              type="button"
              disabled={page.first}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.max(0, (current.page || 0) - 1),
                }))
              }
              className="rounded p-1 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              Page {page.number + 1} of {Math.max(1, page.totalPages)}
            </span>
            <button
              type="button"
              disabled={page.last}
              onClick={() =>
                setFilters((current) => ({ ...current, page: (current.page || 0) + 1 }))
              }
              className="rounded p-1 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {modal === "upload" && (
        <UploadModal
          courses={backendCourses}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            setNotice("Material uploaded successfully.");
            load();
          }}
        />
      )}
      {modal === "edit" && active && (
        <EditModal
          material={active}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            setNotice("Material updated successfully.");
            load();
          }}
        />
      )}
      {modal === "details" && active && (
        <DetailsModal
          material={active}
          onClose={() => setModal(null)}
          onPreview={() => setModal("preview")}
          onEdit={() => setModal("edit")}
          onArchive={() => setModal("archive")}
          onDelete={() => setModal("delete")}
        />
      )}
      {modal === "preview" && active && (
        <PreviewModal
          material={active}
          onClose={() => setModal(null)}
          onOpenDetails={() => setModal("details")}
        />
      )}
      {modal === "archive" && active && (
        <ConfirmModal
          title="Archive material?"
          message={`“${active.title}” will no longer appear as an active material.`}
          actionLabel="Archive"
          onClose={() => setModal(null)}
          onConfirm={() => action("archive", active)}
        />
      )}
      {modal === "delete" && active && (
        <ConfirmModal
          title="Delete material?"
          message={`This permanently deletes “${active.title}” from your resources.`}
          actionLabel="Delete"
          danger
          onClose={() => setModal(null)}
          onConfirm={() => action("delete", active)}
        />
      )}
    </div>
  );
};

function MaterialCard({
  material,
  courseName,
  onPreview,
  onDownload,
  onDetails,
  onEdit,
  onArchive,
  onDelete,
}: {
  material: Material;
  courseName: string;
  onPreview: () => void;
  onDownload: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
            {courseName}
          </span>
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${statusClass(material.status)}`}
          >
            {material.status}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-indigo-600">
            {typeIcon(material.type)}
          </div>
          <div className="min-w-0">
            <h3
              className="line-clamp-2 cursor-pointer text-sm font-bold text-slate-900 hover:text-indigo-600"
              onClick={onPreview}
            >
              {material.title}
            </h3>
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
              {material.originalFilename}
            </p>
          </div>
        </div>
        {material.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {material.description}
          </p>
        )}
      </div>
      <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
        <div className="flex justify-between font-mono text-[11px] text-slate-400">
          <span>{bytes(material.fileSize)}</span>
          <span>{new Date(material.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onPreview}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              type="button"
              disabled={material.status !== "AVAILABLE"}
              onClick={onDownload}
              title="Download"
              className="rounded-lg p-1.5 text-slate-500 hover:text-indigo-600 disabled:opacity-30"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onDetails}
              title="Details"
              className="rounded p-1 text-slate-500 hover:bg-slate-50"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onEdit}
              title="Edit"
              className="rounded p-1 text-slate-500 hover:bg-slate-50"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {material.status !== "ARCHIVED" && (
              <button
                type="button"
                onClick={onArchive}
                title="Archive"
                className="rounded p-1 text-slate-500 hover:text-amber-600"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              title="Delete"
              className="rounded p-1 text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialTable({
  materials,
  courseName,
  onPreview,
  onDownload,
  onEdit,
  onArchive,
  onDelete,
}: {
  materials: Material[];
  courseName: (id: string | null) => string;
  onPreview: (material: Material) => void;
  onDownload: (material: Material) => void;
  onEdit: (material: Material) => void;
  onArchive: (material: Material) => void;
  onDelete: (material: Material) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Material", "Course", "Purpose", "Size", "Status", "Created", "Actions"].map(
                (title) => (
                  <th key={title} className="whitespace-nowrap px-4 py-3">
                    {title}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-slate-50/60">
                <td className="max-w-xs px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-indigo-600">
                      {typeIcon(material.type, "h-4 w-4")}
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onPreview(material)}
                        className="max-w-xs truncate text-left font-semibold text-slate-900 hover:text-indigo-600"
                      >
                        {material.title}
                      </button>
                      <p className="truncate font-mono text-[11px] text-slate-400">
                        {material.originalFilename}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-indigo-700">
                  {courseName(material.courseId)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {material.purpose.replaceAll("_", " ")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-500">
                  {bytes(material.fileSize)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${statusClass(material.status)}`}
                  >
                    {material.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(material.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onPreview(material)}
                      title="Preview"
                      className="p-1.5 text-slate-500"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={material.status !== "AVAILABLE"}
                      onClick={() => onDownload(material)}
                      title="Download"
                      className="p-1.5 text-slate-500 disabled:opacity-30"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(material)}
                      title="Edit"
                      className="p-1.5 text-slate-500"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {material.status !== "ARCHIVED" && (
                      <button
                        type="button"
                        onClick={() => onArchive(material)}
                        title="Archive"
                        className="p-1.5 text-slate-500"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(material)}
                      title="Delete"
                      className="p-1.5 text-slate-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="font-mono text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UploadModal({
  courses,
  onClose,
  onSuccess,
}: {
  courses: BackendCourse[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [purpose, setPurpose] = useState<MaterialPurpose>("LEARNING_MATERIAL");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = 500 * 1024 * 1024;
  const selectFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > maxFileSize) {
      setError("File exceeds maximum size limit of 500 MB.");
      return;
    }
    if (selectedFile.size === 0) {
      setError("Selected file is empty.");
      return;
    }
    setFile(selectedFile);
    if (!title.trim()) {
      setTitle(
        selectedFile.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .slice(0, 200),
      );
    }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title must not be blank.");
      return;
    }
    if (!courseId) {
      setError("Please select a course.");
      return;
    }
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await uploadMaterial(
        { title: title.trim(), description: description.trim(), purpose, courseId, file },
        setProgress,
      );
      onSuccess();
    } catch (err) {
      setError(materialError(err));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      title="Upload Learning Material"
      subtitle="Add a new resource to your course"
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4 p-5">
        {error && <p className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{error}</p>}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            File Attachment <span className="text-rose-500">*</span>
          </label>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (event.dataTransfer.files[0]) selectFile(event.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200 bg-slate-50/50 hover:border-indigo-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => event.target.files?.[0] && selectFile(event.target.files[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <File className="h-8 w-8 text-indigo-600" />
                <div className="text-left">
                  <p className="max-w-xs truncate text-xs font-bold text-slate-900">{file.name}</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {bytes(file.size)} · {file.type || "application/octet-stream"}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 underline">Change</span>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-2 h-8 w-8 text-indigo-500" />
                <p className="text-xs font-bold text-slate-800">
                  Drag and drop file here, or{" "}
                  <span className="text-indigo-600 underline">browse</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Max size: 500 MB</p>
              </>
            )}
          </div>
        </div>
        <label className="block text-xs font-semibold text-slate-700">
          Title <span className="text-rose-500">*</span>
          <input
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Lecture 12: AVL Trees & Rotations Invariant"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Description (Optional)
          <textarea
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Provide context, syllabus objectives, or instructions..."
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Authorized Course <span className="text-rose-500">*</span>
            <select
              required
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.subject || course.courseName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Material Purpose
            <select
              value={purpose}
              onChange={(event) => setPurpose(event.target.value as MaterialPurpose)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"
            >
              {purposes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {saving && (
          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Uploading multipart data...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" /> Upload Material
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditModal({
  material,
  onClose,
  onSuccess,
}: {
  material: Material;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(material.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    if (!title.trim()) {
      setErrorMessage("Title must not be blank.");
      return;
    }
    if (title.length > 200) {
      setErrorMessage("Title cannot exceed 200 characters.");
      return;
    }
    if (description.length > 2000) {
      setErrorMessage("Description cannot exceed 2,000 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateMaterial(material.id, {
        title: title.trim(),
        description: description.trim() || null,
      });
      onSuccess();
    } catch (err) {
      setErrorMessage(materialError(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Material Metadata</h3>
              <p className="font-mono text-xs text-slate-500">Update the resource details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-2.5 font-mono text-[11px] text-slate-500">
          <span>
            Filename: <strong className="text-slate-700">{material.originalFilename}</strong>
          </span>
          <span>
            Immutable Type: <strong className="text-slate-700">{material.type}</strong>
          </span>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                Title <span className="text-rose-500">*</span>
              </label>
              <span className="font-mono text-[10px] text-slate-400">{title.length}/200</span>
            </div>
            <input
              type="text"
              value={title}
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="font-semibold text-slate-700">Description (Optional)</label>
              <span className="font-mono text-[10px] text-slate-400">
                {description.length}/2000
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Provide educational context or guidelines for students..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
            Note: The file itself cannot be changed here. Update the title or description as needed.
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailsModal({
  material,
  onClose,
  onPreview,
  onEdit,
  onArchive,
  onDelete,
}: {
  material: Material;
  onClose: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError("");
    try {
      const response = await getMaterialDownload(material.id);
      if (!response.downloadUrl) throw new Error("This resource is not available for download.");
      window.open(response.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setDownloadError(materialError(err));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Material Resource Details</h3>
              <p className="text-[11px] text-slate-400">Resource details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5 overflow-y-auto p-6 text-xs">
          {downloadError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              {downloadError}
            </div>
          )}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-indigo-700">
                {material.type}
              </span>
              <span
                className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${statusClass(material.status)}`}
              >
                {material.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{material.title}</h2>
            {material.description ? (
              <p className="pt-1 leading-relaxed text-slate-600">{material.description}</p>
            ) : (
              <p className="pt-1 text-[11px] italic text-slate-400">No description provided.</p>
            )}
          </div>
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-[11px]">
            <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Resource Details
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Meta label="Original Filename" value={material.originalFilename} />
              <Meta label="File Type" value={material.contentType} />
              <Meta
                label="File Size"
                value={`${bytes(material.fileSize)} (${material.fileSize.toLocaleString()} bytes)`}
              />
              <Meta label="Purpose" value={material.purpose.replaceAll("_", " ")} />
              <Meta label="Course" value={material.courseId || "None"} />
              <Meta label="Uploaded By" value={material.uploadedBy} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2 font-sans text-[10px] text-slate-500">
              <div>
                <span className="block text-slate-400">Created At:</span>
                {new Date(material.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="block text-slate-400">Last Updated:</span>
                {new Date(material.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPreview();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={isDownloading || material.status !== "AVAILABLE"}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isDownloading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {isDownloading ? "Preparing download..." : "Download"}
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                title="Edit Metadata"
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              {material.status !== "ARCHIVED" && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onArchive();
                  }}
                  title="Archive Material"
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete();
                }}
                title="Delete Material"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block font-sans text-[10px] text-slate-400">{label}</span>
      <span className="block truncate text-slate-800" title={value}>
        {value}
      </span>
    </div>
  );
}
function PreviewModal({
  material,
  onClose,
  onOpenDetails,
}: {
  material: Material;
  onClose: () => void;
  onOpenDetails: () => void;
}) {
  const [downloadData, setDownloadData] = useState<{
    downloadUrl: string;
    expiresAt: string;
  } | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 8;

  const fetchDownloadUrl = useCallback(async () => {
    setIsLoadingUrl(true);
    setUrlError("");
    try {
      setDownloadData(await getMaterialDownload(material.id));
    } catch (err) {
      setUrlError(materialError(err));
    } finally {
      setIsLoadingUrl(false);
    }
  }, [material.id]);

  useEffect(() => {
    setCurrentPage(1);
    setZoomLevel(100);
    void fetchDownloadUrl();
  }, [fetchDownloadUrl]);

  const isExpired = Boolean(
    downloadData && new Date(downloadData.expiresAt).getTime() <= Date.now(),
  );
  const handleAuthorizedDownload = () => {
    if (isExpired || !downloadData?.downloadUrl) {
      void fetchDownloadUrl();
    } else {
      window.open(downloadData.downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="shrink-0 rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700">
              {material.type}
            </span>
            <h3 className="truncate text-sm font-bold text-slate-900" title={material.title}>
              {material.title}
            </h3>
            <span className="hidden font-mono text-[11px] text-slate-400 sm:inline">
              ({bytes(material.fileSize)})
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDetails();
              }}
              className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-100 sm:block"
            >
              Metadata Details
            </button>
            <button
              type="button"
              onClick={handleAuthorizedDownload}
              disabled={isLoadingUrl || material.status !== "AVAILABLE"}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoadingUrl ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {isExpired ? "Refresh Download" : "Ready to Download"}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-400">
              Original File: <strong className="text-slate-200">{material.originalFilename}</strong>
            </span>
            {material.status !== "AVAILABLE" && (
              <span className="hidden items-center gap-1 text-[11px] font-semibold text-amber-400 sm:flex">
                <Clock className="h-3.5 w-3.5" />
                Processing Material... Preview might be restricted.
              </span>
            )}
          </div>
          {downloadData && (
            <div className="hidden items-center gap-2 font-mono text-[11px] text-slate-400 sm:flex">
              <Clock className="h-3 w-3 text-emerald-400" />
              Download available until:{" "}
              {new Date(downloadData.expiresAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>

        {material.type === "PDF" && (
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded p-1 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-mono text-[11px]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="rounded p-1 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((zoom) => Math.max(50, zoom - 25))}
                className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 text-center font-mono text-[11px]">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((zoom) => Math.min(200, zoom + 25))}
                className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-900 p-4 sm:p-8">
          {urlError ? (
            <div className="max-w-md space-y-3 rounded-xl border border-slate-700 bg-slate-800 p-6 text-center text-slate-200">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
              <p className="text-xs font-semibold text-rose-400">{urlError}</p>
              <button
                type="button"
                onClick={() => void fetchDownloadUrl()}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : material.type === "PDF" ? (
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className="min-h-[600px] w-full max-w-2xl space-y-6 rounded-xl bg-white p-8 text-slate-900 shadow-2xl transition-transform sm:p-12"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    TiT Educational Material Viewer
                  </span>
                  <h2 className="mt-1 text-base font-bold sm:text-lg">{material.title}</h2>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="space-y-4 text-xs leading-relaxed text-slate-700 sm:text-sm">
                <p>{material.description || "Verified course curriculum document stream."}</p>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800">
                  <div className="border-b border-slate-200 pb-1 text-[11px] text-slate-400">
                    Section {currentPage}.0 — Document Preview
                  </div>
                  <p>This file is ready to preview. File type: {material.contentType}.</p>
                </div>
              </div>
            </div>
          ) : material.type === "VIDEO" ? (
            <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-800 bg-black shadow-2xl">
              <div className="relative flex aspect-video items-center justify-center bg-slate-950">
                <Video className="h-16 w-16 text-indigo-500 opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg bg-black/60 p-3 font-mono text-xs text-white">
                  <span>{material.originalFilename}</span>
                  <span>{bytes(material.fileSize)}</span>
                </div>
              </div>
            </div>
          ) : material.type === "AUDIO" ? (
            <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Music className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{material.title}</h4>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {material.originalFilename}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
                Audio preview ready
              </div>
            </div>
          ) : material.type === "ARCHIVE" ? (
            <div className="w-full max-w-2xl space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-indigo-400">Archive Preview</span>
                <span className="text-slate-500">{bytes(material.fileSize)}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <p className="font-bold text-emerald-400">{material.originalFilename}</p>
                <p className="pt-2 text-[11px] leading-relaxed text-slate-400">
                  {material.description ||
                    "Source code archive. Ready for authorized download and extraction."}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl space-y-4 rounded-xl bg-white p-8 text-center text-slate-900 shadow-2xl">
              <FileText className="mx-auto h-12 w-12 text-indigo-500" />
              <h3 className="text-base font-bold">{material.title}</h3>
              <p className="font-mono text-xs text-slate-500">{material.originalFilename}</p>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-slate-600">
                {material.description ||
                  "This document can be opened and downloaded using your authenticated institutional credentials."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function ConfirmModal({
  title,
  message,
  actionLabel,
  danger = false,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  actionLabel: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4 p-5">
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs text-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-xs font-semibold text-white ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"}`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
