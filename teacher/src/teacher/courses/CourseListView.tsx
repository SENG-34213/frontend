import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Users,
  Layers,
  FileCheck,
  MoreVertical,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Course, NavigationTab } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { CourseThumbnailImage } from "../../components/CourseThumbnailImage";

interface CourseListViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onOpenCreateCourse: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const CourseListView: React.FC<CourseListViewProps> = ({
  courses,
  onSelectCourse,
  onOpenCreateCourse,
  onNavigate,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Draft" | "Archived">("All");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesLevel = levelFilter === "All" || c.level === levelFilter;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your academic curriculum, syllabus modules, enrolled students, and grading
            criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("curriculum")}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Curriculum Builder</span>
          </button>
          <button
            onClick={onOpenCreateCourse}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Course</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by course code, title, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(["All", "Active", "Draft"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Levels</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Graduate">Graduate</option>
            <option value="Foundational">Foundational</option>
          </select>

          {/* Grid/List Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-400 hover:text-slate-600"}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded ${viewMode === "list" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-400 hover:text-slate-600"}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Display */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No courses match your filters</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or filter tags.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const themeColors = course.coverTheme
              ? {
                  indigo: "from-indigo-600 to-indigo-800",
                  violet: "from-violet-600 to-purple-800",
                  emerald: "from-emerald-600 to-teal-800",
                  amber: "from-amber-600 to-orange-700",
                }[course.coverTheme]
              : "from-indigo-600 to-indigo-800";

            return (
              <div
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
              >
                {/* Styled Course Header / Cover */}
                <div className={`relative h-44 bg-gradient-to-r ${themeColors} p-4 text-white`}>
                  {course.courseThumbnail && (
                    <CourseThumbnailImage
                      source={course.courseThumbnail}
                      alt={`${course.title} course cover`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-slate-950/35" />
                  <div className="relative flex items-start justify-between gap-2">
                    <span className="rounded-full border border-white/30 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm">
                      {course.category || "Course"}
                    </span>
                    <span className="rounded-full bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm">
                      {course.status}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                    <span className="rounded-md bg-slate-950/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
                      {course.code}
                    </span>
                    <span className="text-right text-[11px] font-medium text-white/90">
                      {course.level}
                      {course.semester ? ` · ${course.semester}` : ""}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3
                        onClick={() => onSelectCourse(course)}
                        className="line-clamp-2 cursor-pointer text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600"
                      >
                        {course.title}
                      </h3>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {course.enrolledCount} students
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        {course.modulesCount} modules
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-[11px] text-slate-400">
                        Next: {course.nextSession || "Not scheduled"}
                      </span>
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                      >
                        <span>View Course</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 font-mono border border-indigo-100">
                  {course.courseThumbnail ? (
                    <CourseThumbnailImage
                      source={course.courseThumbnail}
                      alt={`${course.title} course cover`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : null}
                  <span className="relative">{course.code.replace("CS-", "")}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-700">
                      {course.code}
                    </span>
                    <h3
                      onClick={() => onSelectCourse(course)}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors truncate"
                    >
                      {course.title}
                    </h3>
                    <StatusBadge status={course.status} />
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{course.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-500 shrink-0">
                <div>
                  <span className="text-slate-400 block text-[10px]">Enrollment</span>
                  <span className="font-semibold text-slate-800 font-mono tabular-nums">
                    {course.enrolledCount} students
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Curriculum</span>
                  <span className="font-semibold text-slate-800 font-mono tabular-nums">
                    {course.modulesCount} modules
                  </span>
                </div>
                <button
                  onClick={() => onSelectCourse(course)}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
