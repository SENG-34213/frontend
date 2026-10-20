import React, { useState } from "react";
import {
  FileCheck2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const AssignmentsView: React.FC = () => {
  const { assignments, setSelectedAssignmentId, setCurrentView } = useStudent();
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "SUBMITTED" | "GRADED" | "OVERDUE"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssignments = assignments.filter((a) => {
    const matchesTab = activeTab === "ALL" || a.status === activeTab;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            <span>Pending Submission</span>
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Submitted (Under Review)</span>
          </span>
        );
      case "GRADED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Graded & Published</span>
          </span>
        );
      case "OVERDUE":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3 w-3" />
            <span>Past Due</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assignments & Coursework
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit algorithm solutions, design prototypes, and view graded evaluation rubrics
          </p>
        </div>
      </div>

      {/* Filter and Tabs Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments by title or course code..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            {(["ALL", "PENDING", "SUBMITTED", "GRADED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {tab.toLowerCase()} (
                {tab === "ALL"
                  ? assignments.length
                  : assignments.filter((a) => a.status === tab).length}
                )
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <FileCheck2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 font-display text-sm font-bold text-slate-900 dark:text-white">
              No assignments found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              No coursework matches the active tab or search query.
            </p>
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const isPending = asg.status === "PENDING";
            const isGraded = asg.status === "GRADED";

            return (
              <div
                key={asg.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {asg.courseCode}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{asg.courseTitle}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    {getStatusBadge(asg.status)}
                    {asg.priority === "HIGH" && (
                      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                        Priority
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-3xl">
                    {asg.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Deadline:{" "}
                        {new Date(asg.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    <span>·</span>
                    <span>Total Marks: {asg.maxScore} pts</span>
                    {isGraded && (
                      <>
                        <span>·</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Score: {asg.grade}/{asg.maxScore} ({asg.letterGrade})
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedAssignmentId(asg.id);
                      setCurrentView("assignment-details");
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-2xs transition-colors ${
                      isPending
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : isGraded
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span>
                      {isPending ? "Submit Work" : isGraded ? "Review Feedback" : "View Submission"}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
