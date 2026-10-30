import React, { useState, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Filter,
  GraduationCap,
  Info,
  Layers,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  Video,
  X,
} from 'lucide-react';
import { CourseItem } from '../../types';
import { SITE_CONFIG } from '../../lib/config/site';
import { CourseCard } from './CourseCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/FormControls';

export interface GradeCourseExplorerProps {
  courses: CourseItem[];
  onSelectCourse: (course: CourseItem) => void;
  onApplyCourse: (course: CourseItem) => void;
  initialGradeId?: string;
  showAllGradesOption?: boolean;
}

type ExplorerViewMode = 'grid' | 'timetable' | 'curriculum';

interface TimetableSlot {
  courseId: string;
  courseTitle: string;
  subject: string;
  grade: string;
  day: string;
  time: string;
  format: 'Online Live' | 'Physical Classroom' | 'Hybrid' | 'Self-Paced';
  teacherName: string;
  feeAmount: number;
  originalCourse: CourseItem;
}

export const GradeCourseExplorer: React.FC<GradeCourseExplorerProps> = ({
  courses,
  onSelectCourse,
  onApplyCourse,
  initialGradeId = 'grade-5',
  showAllGradesOption = true,
}) => {
  // Current active stage filter ('all' | 'primary' | 'junior' | 'ol' | 'al')
  const [activeStage, setActiveStage] = useState<string>('all');
  // Selected grade ID ('all' or 'grade-1' ... 'grade-13')
  const [selectedGradeId, setSelectedGradeId] = useState<string>(initialGradeId);
  // View mode: 'grid' (cards) | 'timetable' (weekly schedule) | 'curriculum' (milestone topics)
  const [viewMode, setViewMode] = useState<ExplorerViewMode>('grid');
  // Search query within the explorer
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Subject filter within the selected grade
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  // Format filter: 'all' | 'Online Live' | 'Hybrid'
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  // Preview Course Syllabus Drawer State
  const [previewCourse, setPreviewCourse] = useState<CourseItem | null>(null);

  // All 13 grades from config
  const allGrades = SITE_CONFIG.grades;

  // Filter grades list based on selected stage
  const visibleGrades = useMemo(() => {
    if (activeStage === 'all') return allGrades;
    return allGrades.filter((g) => g.stageId === activeStage);
  }, [activeStage, allGrades]);

  // When stage changes, if the selected grade is no longer in visibleGrades, select the first one
  const handleStageChange = (stageId: string) => {
    setActiveStage(stageId);
    if (stageId !== 'all') {
      const match = allGrades.filter((g) => g.stageId === stageId);
      if (match.length > 0 && !match.some((g) => g.id === selectedGradeId)) {
        setSelectedGradeId(match[0].id);
        setSelectedSubject('all');
      }
    }
  };

  // Currently active grade object (or null if 'all' is selected)
  const currentGrade = useMemo(() => {
    if (selectedGradeId === 'all') return null;
    return allGrades.find((g) => g.id === selectedGradeId) || allGrades[0];
  }, [selectedGradeId, allGrades]);

  // Course counts per grade
  const courseCountByGrade = useMemo(() => {
    const counts: Record<string, number> = {};
    allGrades.forEach((g) => {
      counts[g.id] = courses.filter((c) => c.gradeId === g.id).length;
    });
    return counts;
  }, [courses, allGrades]);

  // Courses available for the current selection
  const gradeCourses = useMemo(() => {
    return courses.filter((course) => {
      // Grade match
      const matchesGrade =
        selectedGradeId === 'all'
          ? activeStage === 'all'
            ? true
            : allGrades.find((g) => g.id === course.gradeId)?.stageId === activeStage
          : course.gradeId === selectedGradeId;

      // Search match
      const matchesSearch =
        searchQuery === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Subject filter match
      const matchesSubject =
        selectedSubject === 'all' ||
        course.subject.toLowerCase() === selectedSubject.toLowerCase();

      // Format filter match
      const matchesFormat =
        selectedFormat === 'all' || course.learningFormat === selectedFormat;

      return matchesGrade && matchesSearch && matchesSubject && matchesFormat;
    });
  }, [courses, selectedGradeId, activeStage, searchQuery, selectedSubject, selectedFormat, allGrades]);

  // Unique subjects available within the selected grade
  const availableSubjects = useMemo(() => {
    const relevant =
      selectedGradeId === 'all'
        ? courses
        : courses.filter((c) => c.gradeId === selectedGradeId);
    const map = new Map<string, number>();
    relevant.forEach((c) => {
      map.set(c.subject, (map.get(c.subject) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [courses, selectedGradeId]);

  // Total enrolled students in currently viewed courses
  const totalEnrolledInSelection = useMemo(() => {
    return gradeCourses.reduce((sum, c) => sum + (c.enrolledStudentsCount || 0), 0);
  }, [gradeCourses]);

  // Previous and Next Grade Navigation
  const currentIndex = allGrades.findIndex((g) => g.id === selectedGradeId);
  const handlePrevGrade = () => {
    if (currentIndex > 0) {
      setSelectedGradeId(allGrades[currentIndex - 1].id);
      setSelectedSubject('all');
    }
  };
  const handleNextGrade = () => {
    if (currentIndex < allGrades.length - 1 && currentIndex >= 0) {
      setSelectedGradeId(allGrades[currentIndex + 1].id);
      setSelectedSubject('all');
    }
  };

  // Helper to extract day and time from schedule string
  const timetableSlots = useMemo<TimetableSlot[]>(() => {
    return gradeCourses.map((c) => {
      let day = 'Scheduled Session';
      let time = c.schedule;
      if (c.schedule.includes(':')) {
        const parts = c.schedule.split(':');
        day = parts[0].trim();
        time = parts.slice(1).join(':').trim();
      }
      return {
        courseId: c.id,
        courseTitle: c.title,
        subject: c.subject,
        grade: c.grade,
        day,
        time,
        format: c.learningFormat,
        teacherName: c.teacher.name,
        feeAmount: c.fee.amount,
        originalCourse: c,
      };
    });
  }, [gradeCourses]);

  return (
    <div className="space-y-6">
      {/* 1. TOP BAR: Stage Tabs & View Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Academic Tier Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
            {SITE_CONFIG.academicStages.map((stage) => {
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleStageChange(stage.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {stage.id === 'all' && <Compass className="w-3.5 h-3.5" />}
                  {stage.id === 'primary' && <Award className="w-3.5 h-3.5" />}
                  {stage.id === 'junior' && <BookOpen className="w-3.5 h-3.5" />}
                  {stage.id === 'ol' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {stage.id === 'al' && <GraduationCap className="w-3.5 h-3.5" />}
                  <span>{stage.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isActive ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {stage.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Cards vs. Timetable vs. Curriculum) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Course Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timetable')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timetable'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Weekly Timetable</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('curriculum')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'curriculum'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>Syllabus Topics</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CLEAN & PROPER GRADE SELECTOR CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {activeStage === 'all'
                ? 'All Academic Grades (Grade 1 to 13)'
                : SITE_CONFIG.academicStages.find((s) => s.id === activeStage)?.name || 'Select Grade'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click a grade to view active batches and syllabi
            </span>
          </div>

          {selectedGradeId !== 'all' && (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={handlePrevGrade}
                disabled={currentIndex <= 0}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Grade"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Grade {currentGrade?.level} of 13
              </span>
              <button
                type="button"
                onClick={handleNextGrade}
                disabled={currentIndex >= allGrades.length - 1}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Grade"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Clean Responsive Grade Deck */}
        <div
          className={`grid gap-3 ${
            activeStage === 'ol' || activeStage === 'al'
              ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
              : activeStage === 'primary'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
              : activeStage === 'junior'
              ? 'grid-cols-2 sm:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7'
          }`}
        >
          {/* "All Grades" Card when viewing All stage */}
          {showAllGradesOption && activeStage === 'all' && (
            <button
              type="button"
              onClick={() => {
                setSelectedGradeId('all');
                setSelectedSubject('all');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                selectedGradeId === 'all'
                  ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Overview</span>
                <Compass className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="my-2">
                <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  All Grades
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Grades 1 – 13
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{courses.length} Total Batches</span>
                {selectedGradeId === 'all' && <span>✓ Active</span>}
              </div>
            </button>
          )}

          {visibleGrades.map((grade) => {
            const isSelected = selectedGradeId === grade.id;
            const count = courseCountByGrade[grade.id] || 0;

            // Milestone badge styling
            let milestoneTag: { label: string; badgeClass: string } | null = null;
            if (grade.level === 5) {
              milestoneTag = {
                label: 'Scholarship Exam',
                badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60',
              };
            } else if (grade.level === 10) {
              milestoneTag = {
                label: 'O/L Theory Year',
                badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300/60',
              };
            } else if (grade.level === 11) {
              milestoneTag = {
                label: 'O/L National Exam',
                badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300/60',
              };
            } else if (grade.level === 12) {
              milestoneTag = {
                label: 'A/L Theory Stream',
                badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300/60',
              };
            } else if (grade.level === 13) {
              milestoneTag = {
                label: 'A/L Final Revision',
                badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300/60',
              };
            }

            return (
              <button
                key={grade.id}
                type="button"
                onClick={() => {
                  setSelectedGradeId(grade.id);
                  setSelectedSubject('all');
                }}
                className={`group p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                {/* Top: Stage Tag & Milestone Pill */}
                <div className="flex items-center justify-between gap-1 w-full mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {grade.stage}
                  </span>
                  {milestoneTag && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${milestoneTag.badgeClass}`}>
                      {milestoneTag.label}
                    </span>
                  )}
                </div>

                {/* Grade Name & Highlight */}
                <div className="my-1">
                  <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                    {grade.shortName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {grade.highlight}
                  </div>
                </div>

                {/* Bottom: Batch count and selection indicator */}
                <div className="flex items-center justify-between text-xs pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {count} {count === 1 ? 'batch' : 'batches'}
                  </span>
                  {isSelected ? (
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>Active</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 group-hover:text-indigo-500 transition-colors">
                      Select
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. COMPACT SEARCH & SUBJECT FILTER STRIP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSubject === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Subjects</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedSubject === 'all'
                  ? 'bg-indigo-700 text-indigo-100'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {gradeCourses.length}
            </span>
          </button>

          {availableSubjects.map((sub) => (
            <button
              key={sub.name}
              type="button"
              onClick={() => setSelectedSubject(sub.name)}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedSubject === sub.name
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{sub.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedSubject === sub.name
                    ? 'bg-indigo-700 text-indigo-100'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {sub.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Format Filter Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Input
              placeholder={currentGrade ? `Search ${currentGrade.shortName}...` : 'Search courses...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
              className="py-1.5 text-xs pr-7"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium shrink-0"
          >
            <option value="all">All Formats</option>
            <option value="Online Live">Live Stream</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* 4. MAIN VIEW CONTENT: Cards OR Timetable OR Curriculum */}
      {viewMode === 'grid' && (
        <>
          {gradeCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gradeCourses.map((course) => (
                <div key={course.id} className="relative group">
                  <CourseCard
                    course={course}
                    onViewDetails={onSelectCourse}
                    onApply={onApplyCourse}
                  />
                  {/* Quick Syllabus Peek Button */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewCourse(course);
                      }}
                      className="bg-slate-900/85 hover:bg-slate-950 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-md shadow-md flex items-center gap-1"
                      title="Quick preview syllabus"
                    >
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      <span>Syllabus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyCoursesFallback
              searchQuery={searchQuery}
              currentGradeName={currentGrade?.name}
              onClear={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedFormat('all');
              }}
            />
          )}
        </>
      )}

      {/* 5. TIMETABLE VIEW: Weekly Schedule for Selected Grade */}
      {viewMode === 'timetable' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h5 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Weekly Class Timetable · {currentGrade?.name || 'All Selected Batches'}
                </h5>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All classes are conducted with live interactive chat, whiteboard streaming, and replay archives.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Timezone: IST (Sri Lanka Time · GMT+5:30)
            </div>
          </div>

          {timetableSlots.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {timetableSlots.map((slot) => (
                <div
                  key={slot.courseId}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex flex-col items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {slot.subject}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {slot.grade}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          slot.format === 'Online Live'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {slot.format}
                        </span>
                      </div>

                      <h6 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                        {slot.courseTitle}
                      </h6>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          📅 {slot.day}: {slot.time}
                        </span>
                        <span>·</span>
                        <span>Instructor: <strong>{slot.teacherName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-auto pt-2 md:pt-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400">Monthly Tuition</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        LKR {slot.feeAmount.toLocaleString()}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectCourse(slot.originalCourse)}
                      className="text-xs"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onApplyCourse(slot.originalCourse)}
                      className="text-xs"
                    >
                      Enquire / Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">
              No timetable entries found for this filter.
            </div>
          )}
        </div>
      )}

      {/* 6. CURRICULUM & SYLLABUS TOPICS VIEW */}
      {viewMode === 'curriculum' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gradeCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {course.subject} · {course.grade}
                  </span>
                  <h5 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                    {course.title}
                  </h5>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    LKR {course.fee.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/ month</span>
                </div>
              </div>

              {/* Syllabus Terms Roadmap */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Curriculum Breakdown & Terms</span>
                </div>
                <div className="space-y-2">
                  {course.syllabus.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{s.term}</span>
                        <span className="text-[10px] text-slate-500">{s.weeks} Weeks</span>
                      </div>
                      <ul className="mt-1.5 space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400 text-[11px]">
                        {s.topics.map((t, tIdx) => (
                          <li key={tIdx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Outcomes:
                </div>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {course.outcomes.slice(0, 2).map((outcome, oIdx) => (
                    <li key={oIdx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Instructor: <strong>{course.teacher.name}</strong>
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onApplyCourse(course)}
                  className="text-xs"
                >
                  Apply Online
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. QUICK SYLLABUS PEEK MODAL */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {previewCourse.grade} · {previewCourse.subject}
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {previewCourse.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Taught by {previewCourse.teacher.name} ({previewCourse.teacher.title})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCourse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Syllabus Modules & Timetable
              </h5>
              {previewCourse.syllabus.map((term, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white">
                    <span>{term.term}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{term.weeks} Weeks</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                    {term.topics.map((top, tIdx) => (
                      <li key={tIdx}>{top}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  onSelectCourse(previewCourse);
                  setPreviewCourse(null);
                }}
              >
                Full Course Page
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onApplyCourse(previewCourse);
                  setPreviewCourse(null);
                }}
              >
                Apply for Batch
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface EmptyCoursesFallbackProps {
  searchQuery: string;
  currentGradeName?: string;
  onClear: () => void;
}

const EmptyCoursesFallback: React.FC<EmptyCoursesFallbackProps> = ({
  searchQuery,
  currentGradeName,
  onClear,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center space-y-3 bg-white dark:bg-slate-900">
      <BookOpen className="w-10 h-10 text-slate-400 mx-auto stroke-[1.5]" />
      <h4 className="text-base font-bold text-slate-900 dark:text-white">
        No courses found for this criteria
      </h4>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        {searchQuery
          ? `No batches matching "${searchQuery}" in ${currentGradeName || 'this grade'}. Try adjusting your search term.`
          : `New batches for ${currentGradeName || 'this grade'} are currently being scheduled for the upcoming intake.`}
      </p>
      <Button variant="outline" size="sm" onClick={onClear} className="text-xs mt-2">
        Clear Filters
      </Button>
    </div>
  );
};
