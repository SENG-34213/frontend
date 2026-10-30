import React, { useState } from "react";
import {
  FolderLock,
  Archive,
  Image as ImageIcon,
  Music2,
  Search,
  Table2,
  Type,
  Filter,
  FileText,
  Video,
  Presentation,
  File,
  Download,
  Eye,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { DetailDrawer } from "../components/DetailDrawer";
import { LearningMaterial, Course } from "../types";

interface LearningMaterialManagementProps {
  materials: LearningMaterial[];
  courses: Course[];
}

export const LearningMaterialManagement: React.FC<LearningMaterialManagementProps> = ({
  materials,
  courses,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.s3Key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || m.fileType === typeFilter;
    const matchesCourse = courseFilter === "ALL" || m.courseCode === courseFilter;
    return matchesSearch && matchesType && matchesCourse;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="w-4 h-4 text-rose-500" />;
      case "VIDEO":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "AUDIO":
        return <Music2 className="w-4 h-4 text-pink-500" />;
      case "IMAGE":
        return <ImageIcon className="w-4 h-4 text-cyan-500" />;
      case "SPREADSHEET":
        return <Table2 className="w-4 h-4 text-emerald-500" />;
      case "ARCHIVE":
        return <Archive className="w-4 h-4 text-orange-500" />;
      case "TEXT":
        return <Type className="w-4 h-4 text-slate-500" />;
      case "PRESENTATION":
      case "SLIDES":
        return <Presentation className="w-4 h-4 text-amber-500" />;
      default:
        return <File className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getFileLabel = (type: string) => {
    switch (type) {
      case "PDF":
        return "PDF document";
      case "DOCUMENT":
        return "Document";
      case "PRESENTATION":
      case "SLIDES":
        return "Presentation";
      case "SPREADSHEET":
        return "Spreadsheet";
      case "IMAGE":
        return "Image";
      case "VIDEO":
        return "Video";
      case "AUDIO":
        return "Audio";
      case "ARCHIVE":
        return "Archive";
      case "TEXT":
        return "Text file";
      default:
        return "Other file";
    }
  };

  const totalStorageBytes = materials.reduce((acc, m) => acc + m.fileSizeBytes, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Material Management"
        description="Review course materials and control student access."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Platform Operations" },
          { label: "Learning Materials" },
        ]}
      />

      {/* Learning materials summary */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                Learning materials
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Course resources
              </span>
            </div>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              All uploaded files are securely managed for your courses.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-400 block text-[11px]">Indexed Files</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {materials.length} materials
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Volume</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {(totalStorageBytes / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, file name, or course code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All File Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="DOCUMENT">Documents</option>
            <option value="PRESENTATION">Presentations</option>
            <option value="SLIDES">Legacy Slide Files</option>
            <option value="SPREADSHEET">Spreadsheets</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Videos</option>
            <option value="AUDIO">Audio</option>
            <option value="ARCHIVE">Archives</option>
            <option value="TEXT">Text Files</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Material Title</th>
                <th className="py-3 px-4 font-semibold">Course Code</th>
                <th className="py-3 px-4 font-semibold">Format</th>
                <th className="py-3 px-4 font-semibold">File Size</th>
                <th className="py-3 px-4 font-semibold">File Name</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMaterials.map((mat) => (
                <tr
                  key={mat.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getFileIcon(mat.fileType)}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {mat.title}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {mat.courseCode}
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                    {getFileLabel(mat.fileType)}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono tabular-nums">
                    {(mat.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                    {mat.s3Key.split("/").pop() || mat.s3Key}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={mat.status} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setPreviewMaterial(mat)}
                      className="px-2.5 py-1 text-xs font-medium rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      Inspect Key
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW DRAWER */}
      {previewMaterial && (
        <DetailDrawer
          isOpen={!!previewMaterial}
          title={previewMaterial.title}
          subtitle={`${previewMaterial.courseCode} · Learning Material`}
          onClose={() => setPreviewMaterial(null)}
          width="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[11px]">File name:</span>
              <p className="font-mono text-slate-900 dark:text-white break-all bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                {previewMaterial.s3Key.split("/").pop() || previewMaterial.s3Key}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">File Format</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {getFileLabel(previewMaterial.fileType)}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">File Size</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {(previewMaterial.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="col-span-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Uploaded By</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {previewMaterial.uploadedBy} on{" "}
                  {new Date(previewMaterial.uploadedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};
