import React, { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { DetailDrawer } from "../components/DetailDrawer";

interface ReportTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  frequency: string;
  lastGenerated: string;
}

export const ReportsManagement: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);

  const reports: ReportTemplate[] = [
    {
      id: "rep-1",
      title: "Institutional User Registration & Account Activity",
      category: "User Management",
      description:
        "Detailed breakdown of newly registered students, appointed faculty, account activation times, and invitation issues.",
      frequency: "Weekly",
      lastGenerated: "Oct 16, 2026",
    },
    {
      id: "rep-2",
      title: "Term 1 Course Enrollment & Section Capacity Digest",
      category: "Academic Operations",
      description:
        "Audits student enrollment saturation per subject department, pending approval queues, and faculty course loads.",
      frequency: "Bi-Weekly",
      lastGenerated: "Oct 15, 2026",
    },
    {
      id: "rep-3",
      title: "Comprehensive Academic Gradebook & Assessment Summary",
      category: "Assessment & Grading",
      description:
        "Aggregate analysis of quiz scores, assignment submission velocities, letter grade distributions, and student evaluation remarks.",
      frequency: "Monthly",
      lastGenerated: "Oct 12, 2026",
    },
    {
      id: "rep-4",
      title: "Classroom & Online LMS Attendance Compliance Log",
      category: "Attendance",
      description:
        "Per-course physical and synchronous online roll-call logs, unexcused absence frequencies, and guardian alert logs.",
      frequency: "Weekly",
      lastGenerated: "Oct 16, 2026",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Reports"
        description="Generate certified administrative audits, enrollment digests, and compliance reporting packages."
        breadcrumbs={[{ label: "Admin" }, { label: "Platform Operations" }, { label: "Reports" }]}
      />

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {report.category}
                </span>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  Last generated: {report.lastGenerated}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{report.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{report.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Cadence: {report.frequency}</span>
              <button
                onClick={() => setSelectedReport(report)}
                className="px-2.5 py-1 text-xs font-medium rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                Inspect Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Schema Drawer */}
      {selectedReport && (
        <DetailDrawer
          isOpen={!!selectedReport}
          title={selectedReport.title}
          subtitle={`Report Schema · ${selectedReport.category}`}
          onClose={() => setSelectedReport(null)}
          width="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedReport.description}
            </p>

            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium block">Included Data Fields:</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block">
                • record number, name, email, role
              </span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block">
                • status, created date, activation date, sign-in location
              </span>
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};
