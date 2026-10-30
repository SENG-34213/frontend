import React, { useState, useMemo } from 'react';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Filter,
  GraduationCap,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Video,
} from 'lucide-react';
import { CourseItem, Language } from '../types';
import { SITE_CONFIG } from '../lib/config/site';
import { getTranslation } from '../lib/translations';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Input, Select } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/FeedbackStates';
import { CourseCard } from '../components/courses/CourseCard';
import { Drawer } from '../components/ui/Modal';

export interface CoursesPageProps {
  currentLang: Language;
  courses: CourseItem[];
  onSelectCourse: (course: CourseItem) => void;
  onApplyCourse: (course: CourseItem) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  currentLang,
  courses,
  onSelectCourse,
  onApplyCourse,
}) => {
  const t = (key: string) => getTranslation(currentLang, key);

  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [notifiedList, setNotifiedList] = useState<Record<string, boolean>>({});

  const formats = ['Online Live', 'Physical Classroom', 'Hybrid'];

  const [selectedStage, setSelectedStage] = useState('all');

  const handleNotifyToggle = (id: string) => {
    setNotifiedList((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        search === '' ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()) ||
        course.teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        course.subject.toLowerCase().includes(search.toLowerCase());

      const matchesSubject =
        selectedSubject === 'all' || course.subject.toLowerCase() === selectedSubject.toLowerCase();

      // Check grade match (or stage match if selectedGrade is 'all' and a stage is selected)
      let matchesGrade = true;
      if (selectedGrade !== 'all') {
        matchesGrade = course.gradeId === selectedGrade;
      } else if (selectedStage !== 'all') {
        const gradeObj = SITE_CONFIG.grades.find((g) => g.id === course.gradeId);
        matchesGrade = gradeObj?.stageId === selectedStage;
      }

      const matchesFormat = selectedFormat === 'all' || course.learningFormat === selectedFormat;

      return matchesSearch && matchesSubject && matchesGrade && matchesFormat;
    });
  }, [courses, search, selectedSubject, selectedGrade, selectedStage, selectedFormat]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSubject('all');
    setSelectedGrade('all');
    setSelectedStage('all');
    setSelectedFormat('all');
  };

  const hasActiveFilters =
    search !== '' || selectedSubject !== 'all' || selectedGrade !== 'all' || selectedStage !== 'all' || selectedFormat !== 'all';

  // Count courses per grade
  const gradeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    SITE_CONFIG.grades.forEach((g) => {
      map[g.id] = courses.filter((c) => c.gradeId === g.id).length;
    });
    return map;
  }, [courses]);

  const activeGradeObj = SITE_CONFIG.grades.find((g) => g.id === selectedGrade);

  return (
    <div className="space-y-10 pb-20">
      {/* Header Banner */}
      <section className="pt-12 sm:pt-16 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 pb-12 transition-colors">
        <Container size="md" className="text-center">
          <Badge variant="primary" size="md" className="mb-3">
            Academic Tuition Batches
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Curriculum Batches & Syllabus
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            These are the academic curriculum batches conducted inside our tuition center. Explore syllabus outlines and timetable details below.
          </p>
        </Container>
      </section>

      <Container>
        {/* Stage Filter Tabs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto scrollbar-none max-w-full">
            {SITE_CONFIG.academicStages.map((stage) => {
              const isActive = selectedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    setSelectedStage(stage.id);
                    if (stage.id !== 'all') {
                      const match = SITE_CONFIG.grades.filter((g) => g.stageId === stage.id);
                      if (match.length > 0 && !match.some((g) => g.id === selectedGrade)) {
                        setSelectedGrade('all');
                      }
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {stage.name}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {activeGradeObj ? (
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                Filtered: {activeGradeObj.name} · {activeGradeObj.stage}
              </span>
            ) : selectedStage !== 'all' ? (
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                Stage: {SITE_CONFIG.academicStages.find((s) => s.id === selectedStage)?.name}
              </span>
            ) : (
              <span>All 13 Grades Available</span>
            )}
          </div>
        </div>

        {/* Grade 1 to Grade 13 Card Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-14 gap-2 mb-8">
          <button
            type="button"
            onClick={() => setSelectedGrade('all')}
            className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
              selectedGrade === 'all'
                ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-slate-400">All</span>
            <span className="font-bold text-xs sm:text-sm mt-0.5">All</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{courses.length} courses</span>
          </button>

          {SITE_CONFIG.grades.map((g) => {
            const isSelected = selectedGrade === g.id;
            const count = gradeCounts[g.id] || 0;
            const isStageMatch = selectedStage === 'all' || g.stageId === selectedStage;

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGrade(g.id)}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[66px] ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                    : !isStageMatch
                    ? 'border-slate-200/50 dark:border-slate-800/50 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 opacity-60'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
                    {g.stageId === 'primary' && 'P'}
                    {g.stageId === 'junior' && 'J'}
                    {g.stageId === 'ol' && 'OL'}
                    {g.stageId === 'al' && 'AL'}
                  </span>
                  {g.level === 5 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Scholarship" />}
                  {g.level === 11 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="O/L Exam" />}
                  {g.level === 13 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="A/L Exam" />}
                </div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                  {g.shortName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>{count}</span>
                  {isSelected && <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-8 transition-colors">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5 lg:col-span-4">
              <Input
                placeholder="Search courses, teachers, or topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-2"
              />
            </div>

            {/* Desktop Quick Dropdowns */}
            <div className="hidden lg:grid lg:col-span-6 grid-cols-3 gap-3">
              <Select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                options={[
                  { value: 'all', label: 'All Grades (1–13)' },
                  ...SITE_CONFIG.grades.map((g) => ({ value: g.id, label: g.name })),
                ]}
              />
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={[
                  { value: 'all', label: 'All Subjects' },
                  ...SITE_CONFIG.subjects.map((s) => ({ value: s, label: s })),
                ]}
              />
              <Select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                options={[
                  { value: 'all', label: 'All Formats' },
                  ...formats.map((f) => ({ value: f, label: f })),
                ]}
              />
            </div>

            {/* Filter Toggle on Mobile / Reset Button */}
            <div className="sm:col-span-7 lg:col-span-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setMobileFiltersOpen(true)}
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                className="lg:hidden w-full sm:w-auto"
              >
                Filters {hasActiveFilters && '•'}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredCourses.length}</strong> academic programs
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Curriculum:</span>
            <Badge variant="neutral" size="sm">
              Local G.C.E. & International
            </Badge>
          </div>
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onViewDetails={onSelectCourse}
                onApply={onApplyCourse}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No academic programs found"
            description="We could not find any active courses matching your selected search keywords and filter criteria."
            actionText="Clear Filter Settings"
            onAction={handleResetFilters}
          />
        )}
      </Container>

      {/* Dedicated Paid Courses Section - COMING SOON */}
      <section className="bg-gradient-to-b from-slate-100/70 via-indigo-50/30 to-white dark:from-slate-900/60 dark:via-indigo-950/20 dark:to-slate-950 border-t border-slate-200/80 dark:border-slate-800 py-16 transition-colors">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Coming Soon · Paid Online Courses</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Paid Online Courses & Special Masterclasses
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Self-paced video modules, advanced past-paper revision sprints, and on-demand subject masterclasses will be available for online purchase soon.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>In Development for Next Release</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Masterclass 1 */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:border-amber-500/40 hover:shadow-lg transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full">
                    G.C.E. A/L
                  </span>
                  <span className="text-xs font-bold bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Combined Mathematics Masterclass
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    100+ worked video solutions for Pure & Applied Mathematics, structured unit tests, and rapid IQ problem-solving frameworks.
                  </p>
                </div>

                <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>30+ Hours of 4K Recorded Lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Comprehensive PDF Practice Handbooks</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Self-Paced Course</span>
                <button
                  type="button"
                  onClick={() => handleNotifyToggle('al-maths')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    notifiedList['al-maths']
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-500'
                  }`}
                >
                  {notifiedList['al-maths'] ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Notified</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Me</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Masterclass 2 */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:border-amber-500/40 hover:shadow-lg transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                    Grade 5 Scholarship
                  </span>
                  <span className="text-xs font-bold bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Scholarship IQ & Speed Drills Booster
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Interactive speed tests, pattern recognition mastery, and model paper explanations designed specifically for Grade 5 aspirants.
                  </p>
                </div>

                <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Timed Mock Exams & Video Answers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Parent Progress Dashboard</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Self-Paced Course</span>
                <button
                  type="button"
                  onClick={() => handleNotifyToggle('g5-iq')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    notifiedList['g5-iq']
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-500'
                  }`}
                >
                  {notifiedList['g5-iq'] ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Notified</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Me</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Masterclass 3 */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:border-amber-500/40 hover:shadow-lg transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full">
                    G.C.E. O/L
                  </span>
                  <span className="text-xs font-bold bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Science & Maths Revision Vault
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Complete syllabus review videos, formula cheat sheets, past 10-year paper breakdowns, and exam tip sheets.
                  </p>
                </div>

                <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Full Syllabus Video Archive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Downloadable Marking Keys</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Self-Paced Course</span>
                <button
                  type="button"
                  onClick={() => handleNotifyToggle('ol-vault')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    notifiedList['ol-vault']
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-500'
                  }`}
                >
                  {notifiedList['ol-vault'] ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Notified</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Me</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filter Academic Courses"
      >
        <div className="space-y-5">
          <Select
            label="Subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={[
              { value: 'all', label: 'All Subjects' },
              ...SITE_CONFIG.subjects.map((s) => ({ value: s, label: s })),
            ]}
          />

          <Select
            label="Grade / Target Stream"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            options={[
              { value: 'all', label: 'All Grades' },
              ...SITE_CONFIG.grades.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />

          <Select
            label="Learning Format"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            options={[
              { value: 'all', label: 'All Formats' },
              ...formats.map((f) => ({ value: f, label: f })),
            ]}
          />

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleResetFilters}
              className="w-1/2 justify-center"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-1/2 justify-center"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
