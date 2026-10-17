import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  CalendarCheck2,
  BookOpen,
  Award,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { PlatformKPIs } from '../types';

interface AnalyticsDashboardProps {
  kpis: PlatformKPIs;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ kpis }) => {
  const [timeFilter, setTimeFilter] = useState<'30d' | '90d' | '1y'>('30d');

  // Distribution chart data
  const departmentEnrollments = [
    { name: 'Mathematics', count: 1240, percentage: 38 },
    { name: 'Computer Science', count: 980, percentage: 30 },
    { name: 'Natural Sciences', count: 650, percentage: 20 },
    { name: 'Humanities & Social', count: 420, percentage: 12 },
  ];

  const attendanceWeekly = [
    { day: 'Mon', rate: 96.4 },
    { day: 'Tue', rate: 95.8 },
    { day: 'Wed', rate: 97.2 },
    { day: 'Thu', rate: 94.1 },
    { day: 'Fri', rate: 92.5 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Analytics & Reporting"
        description="Cross-service operational intelligence, longitudinal registration velocity, and cohort performance distributions."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Platform Operations' }, { label: 'Analytics' }]}
        actions={
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {(['30d', '90d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeFilter(r)}
                className={`px-3 py-1 font-medium rounded-md capitalize transition-colors ${
                  timeFilter === r
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : 'Past Year'}
              </button>
            ))}
          </div>
        }
      />

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Student Population"
          value={kpis.totalStudents}
          subtitle="Enrolled active learners"
          change="+8.4% YoY"
          icon={GraduationCap}
        />
        <StatCard
          title="Active Course Enrollments"
          value={kpis.activeEnrollments}
          subtitle="2.3 per student avg"
          change="+14.2% YoY"
          icon={BookOpen}
        />
        <StatCard
          title="Attendance Compliance"
          value="95.1%"
          subtitle="Roll call verified"
          change="+1.1% vs term target"
          icon={CalendarCheck2}
        />
        <StatCard
          title="Formative Pass Median"
          value="88.2%"
          subtitle="Across 48 courses"
          change="+3.4% vs benchmark"
          icon={Award}
        />
      </div>

      {/* 2-Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Enrollment Distribution Bar Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Enrollment Distribution by Academic Faculty
            </h3>
            <p className="text-xs text-slate-500">
              Active student enrollments partitioned by subject department
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {departmentEnrollments.map((dept, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {dept.name}
                  </span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {dept.count.toLocaleString()} seats ({dept.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${dept.percentage * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Attendance Trend Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Weekly Attendance Compliance Trends
            </h3>
            <p className="text-xs text-slate-500">
              Daily percentage of confirmed present roll calls across all sessions
            </p>
          </div>

          <div className="h-44 flex items-end justify-between gap-4 pt-6 pb-2 px-2">
            {attendanceWeekly.map((item, idx) => {
              const heightPct = (item.rate - 85) * 6.5; // Scale from 85% to 100%

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {item.rate}%
                  </span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-28 flex items-end">
                    <div
                      className="w-full bg-emerald-500 rounded-t-lg transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
