import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  FileCode,
  Video,
  Upload,
  Check,
  X,
  File,
  Sparkles,
} from 'lucide-react';
import { LearningMaterial, NavigationTab } from '../types';
import { mockMaterials, mockCourses } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';

export const MaterialLibraryView: React.FC = () => {
  const [materials, setMaterials] = useState<LearningMaterial[]>(mockMaterials);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCourseId, setUploadCourseId] = useState(mockCourses[0]?.id || '');
  const [uploadFileType, setUploadFileType] = useState<'PDF' | 'ZIP' | 'DOCX' | 'VIDEO' | 'SLIDES'>('PDF');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'All' || m.courseId === courseFilter;
    const matchesType = typeFilter === 'All' || m.fileType === typeFilter;
    return matchesSearch && matchesCourse && matchesType;
  });

  const handleStartUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          const course = mockCourses.find((c) => c.id === uploadCourseId) || mockCourses[0];
          const newMat: LearningMaterial = {
            id: `mat-${Date.now()}`,
            courseId: course.id,
            courseCode: course.code,
            title: uploadTitle.endsWith(`.${uploadFileType.toLowerCase()}`)
              ? uploadTitle
              : `${uploadTitle}.${uploadFileType.toLowerCase()}`,
            description: 'Uploaded by Prof. Alex Rivera via S3 direct multipart pipeline.',
            fileType: uploadFileType,
            fileSize: '3.4 MB',
            uploadDate: 'Just now',
            s3Key: `mentify-materials/${course.code.toLowerCase()}/${Date.now()}.${uploadFileType.toLowerCase()}`,
            downloadsCount: 0,
            visibility: 'Published',
          };

          setMaterials([newMat, ...materials]);
          setTimeout(() => {
            setIsUploadOpen(false);
            setUploadProgress(0);
            setUploadTitle('');
          }, 600);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Learning Material Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cloud-backed lecture slide decks, starter code archives, and reading materials hosted on AWS S3.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search learning materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Courses</option>
            {mockCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All File Formats</option>
            <option value="PDF">PDF Decks</option>
            <option value="ZIP">ZIP Archives</option>
            <option value="DOCX">DOCX Documents</option>
            <option value="VIDEO">Video Recordings</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mat) => {
          let typeIcon = FileText;
          let iconBg = 'bg-indigo-50 text-indigo-700 border-indigo-100';
          if (mat.fileType === 'ZIP') {
            typeIcon = FileCode;
            iconBg = 'bg-amber-50 text-amber-700 border-amber-100';
          } else if (mat.fileType === 'VIDEO') {
            typeIcon = Video;
            iconBg = 'bg-rose-50 text-rose-700 border-rose-100';
          }
          const Icon = typeIcon;

          return (
            <div
              key={mat.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {mat.courseCode}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-medium">
                      {mat.fileType}
                    </span>
                  </div>
                  <StatusBadge status={mat.visibility} />
                </div>

                <div className="flex items-start gap-3 mt-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {mat.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-mono">{mat.fileSize}</span>
                  <span>·</span>
                  <span>{mat.downloadsCount} downloads</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 border border-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => alert(`Starting download for ${mat.title} from S3...`)}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1 border border-indigo-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload Learning Material</h3>
                <p className="text-xs text-slate-500">Direct multipart streaming to Mentify S3 Storage</p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartUpload} className="p-6 space-y-4">
              {/* Drag and Drop Box Simulation */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 cursor-pointer">
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: PDF, ZIP, DOCX, MP4, PPTX (Max 500 MB)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lecture 14 Slide Deck: Dynamic Programming.pdf"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Tag
                  </label>
                  <select
                    value={uploadCourseId}
                    onChange={(e) => setUploadCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    {mockCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    File Type
                  </label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="PDF">PDF Slides</option>
                    <option value="ZIP">ZIP Archive</option>
                    <option value="DOCX">Document</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
              </div>

              {/* Progress bar if uploading */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Streaming to S3...</span>
                    <span className="font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {previewMaterial.courseCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{previewMaterial.title}</h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
              <File className="w-12 h-12 text-indigo-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">{previewMaterial.title}</h4>
              <p className="text-xs text-slate-500 font-mono">
                S3 Key: {previewMaterial.s3Key} · Size: {previewMaterial.fileSize}
              </p>
              <p className="text-xs text-slate-600 max-w-md mx-auto pt-2">
                {previewMaterial.description}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloading ${previewMaterial.title}...`);
                  setPreviewMaterial(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download S3 File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
