import React, { useState } from "react";
import {
  Layers,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  HelpCircle,
  FileText,
  Plus,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { CurriculumModule, Course } from "../types";

interface CurriculumManagementProps {
  curriculum: CurriculumModule[];
  courses: Course[];
}

export const CurriculumManagement: React.FC<CurriculumManagementProps> = ({
  curriculum,
  courses,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState("MATH-401");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "mod-1": true,
    "mod-2": true,
  });

  const activeCourse = courses.find((c) => c.code === selectedCourseCode) || courses[0];

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules & Lessons Explorer"
        description="Inspect syllabi structures, lesson delivery sequences, attached formative assessments, and published statuses."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Modules & Lessons" },
        ]}
      />

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourseCode(course.code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCourseCode === course.code
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="font-mono font-bold mr-1.5">{course.code}</span>
            <span>{course.title}</span>
          </button>
        ))}
      </div>

      {/* Course Info Banner */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Faculty Lead</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {activeCourse.teacherName}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Target Grade Level</span>
          <span className="font-semibold text-slate-900 dark:text-white">{activeCourse.grade}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Total Curriculum Modules</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {activeCourse.modulesCount} Modules
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Approval Status</span>
          <StatusBadge status="PUBLISHED" />
        </div>
      </div>

      {/* Modules Explorer Accordion */}
      <div className="space-y-4">
        {curriculum.map((mod) => {
          const isExpanded = expandedModules[mod.id] ?? true;

          return (
            <div
              key={mod.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {mod.title}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {mod.lessons.length} structured instructional lessons
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                  {mod.lessons.map((les, lIdx) => (
                    <div
                      key={les.id}
                      className="p-3.5 pl-6 sm:pl-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="text-slate-400 font-mono text-[11px] shrink-0">
                          0{lIdx + 1}.
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block sm:inline">
                            {les.title}
                          </span>
                          <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5 sm:mt-0 sm:inline sm:ml-3">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {les.durationMinutes}m
                            </span>
                            <span>·</span>
                            <span>{les.materialCount} attachments</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {les.hasQuiz && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Quiz Attached
                          </span>
                        )}
                        <StatusBadge status={les.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
