import React, { useState } from "react";
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  FileText,
  Video,
  Presentation,
  File,
  Download,
  Eye,
  CheckCircle2,
  X,
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
  onUploadMaterial: (mat: LearningMaterial) => void;
}

export const LearningMaterialManagement: React.FC<LearningMaterialManagementProps> = ({
  materials,
  courses,
  onUploadMaterial,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  // Upload Form
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "MATH-401",
    fileType: "PDF" as "PDF" | "VIDEO" | "SLIDES" | "DOCUMENT" | "AUDIO",
    fileName: "lecture_notes_fall2026.pdf",
    fileSizeMb: 5.4,
  });

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
      case "SLIDES":
        return <Presentation className="w-4 h-4 text-amber-500" />;
      default:
        return <File className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newMat: LearningMaterial = {
      id: `mat-${Date.now()}`,
      title: formData.title,
      courseId: "crs-101",
      courseCode: formData.courseCode,
      fileType: formData.fileType,
      s3Key: `courses/${formData.courseCode.toLowerCase()}/materials/${formData.fileName}`,
      fileSizeBytes: Math.round(formData.fileSizeMb * 1024 * 1024),
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Alex Mercer",
      status: "READY",
    };

    onUploadMaterial(newMat);
    setIsUploadOpen(false);
    setFormData({
      title: "",
      courseCode: "MATH-401",
      fileType: "PDF",
      fileName: "lecture_notes_fall2026.pdf",
      fileSizeMb: 5.4,
    });
  };

  const totalStorageBytes = materials.reduce((acc, m) => acc + m.fileSizeBytes, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Material Management"
        description="Inspect cloud storage asset repositories, upload pedagogical media, and verify student access integrity."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Platform Operations" },
          { label: "Learning Materials" },
        ]}
        actions={
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        }
      />

      {/* S3 Storage Stats Bar */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                Secure learning storage
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                mentify-course-assets-prod
              </span>
            </div>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              Region: us-east-1 · AES-256 Server-Side Encryption Enforced
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-400 block text-[11px]">Indexed Files</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {materials.length} assets
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
            placeholder="Search by title, S3 key, or course code..."
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
            <option value="VIDEO">Videos</option>
            <option value="SLIDES">Slide Presentations</option>
            <option value="DOCUMENT">Code / Archives</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Asset Title</th>
                <th className="py-3 px-4 font-semibold">Course Code</th>
                <th className="py-3 px-4 font-semibold">Format</th>
                <th className="py-3 px-4 font-semibold">File Size</th>
                <th className="py-3 px-4 font-semibold">S3 Object Key</th>
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
                    {mat.fileType}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono tabular-nums">
                    {(mat.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                    {mat.s3Key}
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

      {/* UPLOAD MATERIAL MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upload Learning Material
                </h3>
                <p className="text-xs text-slate-500">Files are uploaded securely</p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Material Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chapter 4 Differential Equations Lecture Slides"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Associated Course
                  </label>
                  <select
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Format
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="VIDEO">Video (MP4)</option>
                    <option value="SLIDES">Slides (PPTX)</option>
                    <option value="DOCUMENT">Zip / Code</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  File Attachment (Simulated S3 Upload)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center bg-slate-50 dark:bg-slate-800/40">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-slate-600 dark:text-slate-300 block font-medium">
                    {formData.fileName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formData.fileSizeMb} MB · Ready to sync
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Confirm & Sync to S3
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW DRAWER */}
      {previewMaterial && (
        <DetailDrawer
          isOpen={!!previewMaterial}
          title={previewMaterial.title}
          subtitle={`${previewMaterial.courseCode} · S3 Asset Record`}
          onClose={() => setPreviewMaterial(null)}
          width="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[11px]">File location:</span>
              <p className="font-mono text-slate-900 dark:text-white break-all bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                s3://mentify-course-assets-prod/{previewMaterial.s3Key}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">File Format</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {previewMaterial.fileType}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Byte Size</span>
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
