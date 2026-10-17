import React, { useState } from 'react';
import { FileCheck2, Search, Calendar, User, Clock, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Assignment } from '../types';

interface AssignmentOversightProps {
  assignments: Assignment[];
}

export const AssignmentOversight: React.FC<AssignmentOversightProps> = ({ assignments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'ALL' || a.courseCode === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment Oversight"
        description="Monitor course problem sets, coding deliverables, submission completion rates, and faculty grading backlogs."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Academic Management' }, { label: 'Assignments' }]}
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments by title, course, or teacher..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="ALL">All Courses</option>
          <option value="MATH-401">MATH-401</option>
          <option value="CS-302">CS-302</option>
          <option value="BIO-204">BIO-204</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Assignment Title</th>
                <th className="py-3 px-4 font-semibold">Course & Faculty</th>
                <th className="py-3 px-4 font-semibold">Submission Progress</th>
                <th className="py-3 px-4 font-semibold">Graded Velocity</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssignments.map((asg) => {
                const gradedPercent = Math.round(
                  (asg.gradedSubmissions / (asg.totalSubmissions || 1)) * 100
                );

                return (
                  <tr
                    key={asg.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {asg.title}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Max Score: {asg.maxPoints} pts
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                        {asg.courseCode}
                      </span>
                      <span className="text-slate-500">{asg.teacherName}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white tabular-nums">
                      {asg.totalSubmissions} submissions
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                          {asg.gradedSubmissions} / {asg.totalSubmissions}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${gradedPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(asg.dueDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={asg.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
