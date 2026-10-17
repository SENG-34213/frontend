import React, { useState } from 'react';
import { Award, Calendar, Search, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Examination } from '../types';

interface ExaminationManagementProps {
  examinations: Examination[];
}

export const ExaminationManagement: React.FC<ExaminationManagementProps> = ({ examinations }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExams = examinations.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination Management"
        description="Formal summative examinations, hall schedules, candidate room allocations, and proctor verification."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Academic Management' }, { label: 'Examinations' }]}
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exam code, course, or title..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Exam Code</th>
                <th className="py-3 px-4 font-semibold">Title & Course</th>
                <th className="py-3 px-4 font-semibold">Date & Window</th>
                <th className="py-3 px-4 font-semibold">Venue / Venue Mode</th>
                <th className="py-3 px-4 font-semibold">Candidates</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExams.map((exam) => (
                <tr
                  key={exam.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {exam.code}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {exam.title}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{exam.courseCode}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <span className="font-medium block tabular-nums">{exam.examDate}</span>
                    <span className="text-[11px] text-slate-400">
                      {exam.startTime} – {exam.endTime}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {exam.hallOrPlatform}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white tabular-nums">
                    {exam.candidateCount} enrolled
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={exam.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
