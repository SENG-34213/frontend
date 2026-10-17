import React, { useState } from 'react';
import {
  Award,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { GradebookRow, NavigationTab } from '../types';
import { mockGradebookRows, mockCourses, mockAssignments, mockQuizzes } from '../data/mockData';

interface GradebookViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({ onNavigate }) => {
  const [courseFilter, setCourseFilter] = useState('crs-201');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<GradebookRow[]>(mockGradebookRows);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const selectedCourse = mockCourses.find((c) => c.id === courseFilter) || mockCourses[0];

  const filteredRows = rows.filter((r) =>
    r.studentName.toLowerCase().includes(search.toLowerCase()) ||
    r.studentIdNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Gradebook & Academic Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Spreadsheet-grade evaluation ledger calculating continuous assessment and examination percentiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden shadow-2xs"
          >
            {mockCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Class Grade Average</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            86.1%
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Median B+ letter grade</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Roster Size</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {rows.length} students
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Enrolled for credit</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Highest Score</span>
          <div className="text-2xl font-bold text-indigo-700 font-mono mt-1 tabular-nums">
            98.2%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Elena Rostova (A+)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">At-Risk Threshold (&lt;70%)</span>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-1 tabular-nums">
            1 student
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Devon Vance (67.2%)</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students in gradebook..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Grading Scale: Standard University 4.0
        </span>
      </div>

      {/* Spreadsheet-Style Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[750px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3 sticky left-0 bg-slate-50 z-10">Student</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3 text-right">Asg 1 (100m)</th>
              <th className="px-4 py-3 text-right">Asg 2 (100m)</th>
              <th className="px-4 py-3 text-right">Quiz 1 (30m)</th>
              <th className="px-4 py-3 text-right">Quiz 2 (25m)</th>
              <th className="px-4 py-3 text-right">Midterm (100m)</th>
              <th className="px-4 py-3 text-right">Overall %</th>
              <th className="px-5 py-3 text-center">Letter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredRows.map((row) => (
              <tr key={row.studentId} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5 sticky left-0 bg-white font-sans font-semibold text-slate-900">
                  {row.studentName}
                </td>
                <td className="px-4 py-3.5 text-slate-500">{row.studentIdNumber}</td>
                <td className="px-4 py-3.5 text-right tabular-nums text-slate-800">
                  {row.assignmentScores['asg-01'] ?? '—'}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-slate-400">
                  {row.assignmentScores['asg-04'] ?? 'Pending'}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-slate-800">
                  {row.quizScores['qiz-101'] ?? '—'}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-slate-800">
                  {row.quizScores['qiz-102'] ?? '—'}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-slate-400">
                  {row.examScores['exm-01'] ?? 'Oct 28'}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums font-bold text-slate-900">
                  {row.overallPercent.toFixed(1)}%
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-sans ${
                      row.letterGrade.startsWith('A')
                        ? 'bg-emerald-50 text-emerald-700'
                        : row.letterGrade.startsWith('B')
                        ? 'bg-indigo-50 text-indigo-700'
                        : row.letterGrade.startsWith('C')
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {row.letterGrade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
