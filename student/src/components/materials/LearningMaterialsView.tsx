import React, { useState } from "react";
import {
  Search,
  Archive,
  FileText,
  Video,
  Code,
  Sliders,
  Download,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  BookOpen,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  Music2,
  Type,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { LearningMaterial } from "../../types";
import { EmptyState } from "../../../../shared/ui/EmptyState";

export const LearningMaterialsView: React.FC = () => {
  const { materials, courses, showToast, downloadMaterial } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  const materialTypes = [
    "All",
    "PDF",
    "DOCUMENT",
    "PRESENTATION",
    "SLIDES",
    "SPREADSHEET",
    "IMAGE",
    "VIDEO",
    "AUDIO",
    "ARCHIVE",
    "TEXT",
    "CODE",
    "OTHER",
  ];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = selectedCourse === "All" || m.courseCode === selectedCourse;
    const matchesType = selectedType === "All" || m.type === selectedType;

    return matchesSearch && matchesCourse && matchesType;
  });

  const getFileIcon = (type: LearningMaterial["type"]) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
      case "CODE":
        return <Code className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "SLIDES":
        return <Sliders className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case "VIDEO":
        return <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "AUDIO":
        return <Music2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />;
      case "IMAGE":
        return <ImageIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />;
      case "ARCHIVE":
        return <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case "TEXT":
        return <Type className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
      case "PRESENTATION":
        return <Sliders className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case "SPREADSHEET":
        return <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const fileTypeLabel = (type: LearningMaterial["type"]) => {
    const labels: Record<string, string> = {
      PDF: "PDF document",
      DOCUMENT: "Document",
      PRESENTATION: "Presentation",
      SLIDES: "Presentation",
      SPREADSHEET: "Spreadsheet",
      IMAGE: "Image",
      VIDEO: "Video",
      AUDIO: "Audio",
      ARCHIVE: "Archive",
      TEXT: "Text file",
      CODE: "Code file",
      OTHER: "Other file",
    };
    return labels[type] || "Other file";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Learning Materials & Library
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access authoritative lecture slides, mathematical proofs, reference codebases, and reading
          packets
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference notes, handouts, code files..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filter Dropdown */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              aria-label="Filter by course"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Courses</option>
              {courses
                .filter((c) => c.enrolled)
                .map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}
                  </option>
                ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${
                  viewMode === "list"
                    ? "bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Type Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">File Type:</span>
          {materialTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors ${
                selectedType === t
                  ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No materials found"
          description="No document matches your filter parameters."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {getFileIcon(mat.type)}
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {mat.courseCode}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {mat.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span>Size: {mat.fileSize}</span>
                  {mat.downloadsCount !== undefined && <span>{mat.downloadsCount} downloads</span>}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setPreviewMaterial(mat)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() =>
                    downloadMaterial(mat.id).catch((error) =>
                      showToast(error instanceof Error ? error.message : "Download failed."),
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  {getFileIcon(mat.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {mat.courseCode}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{fileTypeLabel(mat.type)}</span>
                  </div>
                  <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {mat.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline text-xs text-slate-400">{mat.fileSize}</span>
                <button
                  onClick={() => setPreviewMaterial(mat)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Preview
                </button>
                <button
                  onClick={() => showToast(`Downloaded: ${mat.title}`)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewMaterial && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Material document viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setPreviewMaterial(null)}
        >
          <div
            className="relative flex h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  {getFileIcon(previewMaterial.type)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                    {previewMaterial.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {previewMaterial.courseCode} · {fileTypeLabel(previewMaterial.type)} ·{" "}
                    {previewMaterial.fileSize}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    downloadMaterial(previewMaterial.id).catch((error) =>
                      showToast(error instanceof Error ? error.message : "Download failed."),
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setPreviewMaterial(null)}
                  aria-label="Close preview"
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Document Viewer simulator */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-slate-950">
              <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 font-serif leading-relaxed text-slate-800 dark:text-slate-200">
                <div className="border-b border-slate-100 pb-4 mb-6 font-sans">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
                    {fileTypeLabel(previewMaterial.type)} · {previewMaterial.fileSize}
                  </span>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {previewMaterial.title}
                  </h2>
                </div>

                <div className="text-xs sm:text-sm space-y-4 whitespace-pre-line font-sans">
                  {previewMaterial.contentSnippet || previewMaterial.description}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              <span>Material preview</span>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="font-medium hover:text-slate-900 dark:hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
