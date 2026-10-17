import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Calendar,
} from 'lucide-react';
import { mockCourses, mockStudents } from '../data/mockData';
import { NavigationTab } from '../types';

interface TeacherAnalyticsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const TeacherAnalyticsView: React.FC<TeacherAnalyticsViewProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'Term' | 'Month' | 'Week'>('Term');
  const atRiskStudents = mockStudents.filter((s) => s.status === 'At Risk');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Teaching Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Diagnostic insights into grade distributions, assessment turnaround times, and student retention.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          {(['Term', 'Month', 'Week'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeRange === r
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-slate-500">Overall GPA</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">3.68</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+0.14 vs last cohort</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-slate-500">Submission Rate</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">96.2%</div>
          <p className="text-[11px] text-slate-400 mt-1">Across 4 assigned milestones</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-slate-500">Attendance Average</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">94.8%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Compliant with accreditation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-xs font-medium text-rose-900">Intervention Alerts</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums">2</div>
          <p className="text-[11px] text-rose-600 mt-1">Students below 75% attendance</p>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Grade Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Grade Distribution by Letter
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Fall 2026 Academic Cohort (142 students)</p>
            </div>
          </div>

          {/* Bar Distribution */}
          <div className="space-y-3 pt-2">
            {[
              { grade: 'A / A- (90-100%)', pct: 44, count: 62, color: 'bg-indigo-600' },
              { grade: 'B+ / B / B- (80-89%)', pct: 36, count: 51, color: 'bg-violet-600' },
              { grade: 'C+ / C (70-79%)', pct: 14, count: 20, color: 'bg-amber-500' },
              { grade: 'D / F (<70%)', pct: 6, count: 9, color: 'bg-rose-500' },
            ].map((item) => (
              <div key={item.grade} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.grade}</span>
                  <span className="font-mono text-slate-600 tabular-nums">
                    {item.count} students ({item.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention & Attendance Correlation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Attendance vs. Assessment Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Empirical correlation across lectures</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { bracket: '90% - 100% Attendance', avgScore: 92.4, color: 'bg-emerald-600' },
              { bracket: '80% - 89% Attendance', avgScore: 84.8, color: 'bg-indigo-600' },
              { bracket: '70% - 79% Attendance', avgScore: 75.1, color: 'bg-amber-500' },
              { bracket: '< 70% Attendance', avgScore: 61.2, color: 'bg-rose-500' },
            ].map((b) => (
              <div key={b.bracket} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{b.bracket}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    Avg {b.avgScore}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.avgScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Students Needing Pedagogical Attention */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-rose-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
              Students Needing Early Intervention ({atRiskStudents.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">Flagged based on attendance and submission thresholds</span>
        </div>

        <div className="divide-y divide-slate-100">
          {atRiskStudents.map((st) => (
            <div
              key={st.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center ${st.avatarBg}`}>
                  {st.initials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {st.studentId} · Attendance: <span className="text-rose-600 font-bold">{st.attendanceRate}%</span> · Grade Avg: {st.recentGradeAvg}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('messages')}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                >
                  Schedule Office Hours
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
