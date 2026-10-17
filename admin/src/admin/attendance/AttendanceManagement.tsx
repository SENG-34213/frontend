import React, { useState } from 'react';
import { CalendarCheck2, Search, Filter, Clock, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { AttendanceSession } from '../types';

interface AttendanceManagementProps {
  sessions: AttendanceSession[];
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ sessions }) => {
  const [courseFilter, setCourseFilter] = useState('ALL');

  const filteredSessions = sessions.filter(
    (s) => courseFilter === 'ALL' || s.courseCode === courseFilter
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Monitor physical classroom, hybrid, and synchronous online session roll calls, compliance rates, and absences."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Academic Management' }, { label: 'Attendance' }]}
      />

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Average Platform Attendance</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            95.1%
          </span>
          <span className="text-[11px] text-emerald-600 block mt-1">+1.2% attendance compliance</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Recorded Sessions This Week</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            48 Sessions
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">100% verified by faculty</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Unexcused Absence Rate</span>
          <span className="text-2xl font-bold text-amber-600 tabular-nums">3.8%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Automated guardian SMS alerted</span>
        </div>
      </div>

      {/* Filter and Sessions Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recorded Attendance Sessions
          </h3>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Courses</option>
            <option value="MATH-401">MATH-401</option>
            <option value="CS-302">CS-302</option>
            <option value="BIO-204">BIO-204</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Course Code & Title</th>
                <th className="py-3 px-4 font-semibold">Session Date</th>
                <th className="py-3 px-4 font-semibold">Time Window</th>
                <th className="py-3 px-4 font-semibold">Mode</th>
                <th className="py-3 px-4 font-semibold">Present / Enrolled</th>
                <th className="py-3 px-4 font-semibold">Absences</th>
                <th className="py-3 px-4 font-semibold">Marked By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSessions.map((session) => {
                const presentPct = Math.round((session.presentCount / session.totalStudents) * 100);

                return (
                  <tr
                    key={session.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                        {session.courseCode}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">{session.courseTitle}</span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white tabular-nums">
                      {session.date}
                    </td>

                    <td className="py-3 px-4 text-slate-500 tabular-nums">{session.timeSlot}</td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {session.mode.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600 tabular-nums">
                          {session.presentCount} / {session.totalStudents} ({presentPct}%)
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-rose-600 font-medium tabular-nums">
                      {session.absentCount} absent · {session.lateCount} late
                    </td>

                    <td className="py-3 px-4 text-slate-500">{session.markedBy}</td>
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
