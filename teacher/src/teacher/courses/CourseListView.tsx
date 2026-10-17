import React, { useState } from 'react';
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
} from 'lucide-react';
import { Course, NavigationTab } from '../types';
import { StatusBadge } from '../components/StatusBadge';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Draft' | 'Archived'>('All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesLevel = levelFilter === 'All' || c.level === levelFilter;
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
            Manage your academic curriculum, syllabus modules, enrolled students, and grading criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('curriculum')}
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
            {(['All', 'Active', 'Draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
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
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
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
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter tags.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const themeColors = {
              indigo: 'from-indigo-600 to-indigo-800',
              violet: 'from-violet-600 to-purple-800',
              emerald: 'from-emerald-600 to-teal-800',
              amber: 'from-amber-600 to-orange-700',
            }[course.coverTheme] || 'from-indigo-600 to-indigo-800';

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col group"
              >
                {/* Styled Course Header / Cover */}
                <div className={`h-24 bg-gradient-to-r ${themeColors} p-4 flex flex-col justify-between text-white relative`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                      {course.code}
                    </span>
                    <span className="text-xs bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded">
                      {course.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/80 font-medium">
                    {course.semester} · {course.academicYear}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3
                        onClick={() => onSelectCourse(course)}
                        className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
                      >
                        {course.title}
                      </h3>
                      <StatusBadge status={course.status} />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Metrics bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="block text-[10px] text-slate-400 font-medium">Students</span>
                        <span className="font-bold text-slate-900 font-mono tabular-nums">
                          {course.enrolledCount}/{course.maxCapacity}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="block text-[10px] text-slate-400 font-medium">Modules</span>
                        <span className="font-bold text-slate-900 font-mono tabular-nums">
                          {course.modulesCount}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="block text-[10px] text-slate-400 font-medium">Avg Grade</span>
                        <span className="font-bold text-slate-900 font-mono tabular-nums">
                          {course.averageGrade > 0 ? `${course.averageGrade}%` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        Next: {course.nextSession || 'Not scheduled'}
                      </span>
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>Manage Course</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 font-mono border border-indigo-100">
                  {course.code.replace('CS-', '')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-700">{course.code}</span>
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
