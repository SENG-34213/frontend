import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  CalendarCheck2,
  MailCheck,
  Award,
  Sparkles,
  ArrowUpRight,
  Send,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RoleBadge } from '../components/RoleBadge';
import { StatusBadge } from '../components/StatusBadge';
import { UserAvatar } from '../components/UserAvatar';
import {
  PlatformKPIs,
  StudentProfile,
  TeacherProfile,
  AcademicEvent,
  AuditEvent,
  AdminRole,
} from '../types';
import { AdminRoute } from '../components/AdminSidebar';

interface AdminDashboardProps {
  kpis: PlatformKPIs;
  students: StudentProfile[];
  teachers: TeacherProfile[];
  events: AcademicEvent[];
  recentLogs: AuditEvent[];
  role: AdminRole;
  onNavigate: (route: AdminRoute) => void;
  onQuickAction: (action: string) => void;
  onResendInvitation: (email: string, role: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  kpis,
  students,
  teachers,
  events,
  recentLogs,
  role,
  onNavigate,
  onQuickAction,
  onResendInvitation,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // SVG Chart data for user growth
  const chartData = {
    '7d': [
      { label: 'Oct 11', students: 1390, teachers: 82 },
      { label: 'Oct 12', students: 1398, teachers: 82 },
      { label: 'Oct 13', students: 1404, teachers: 83 },
      { label: 'Oct 14', students: 1410, teachers: 83 },
      { label: 'Oct 15', students: 1414, teachers: 84 },
      { label: 'Oct 16', students: 1418, teachers: 84 },
      { label: 'Oct 17', students: 1420, teachers: 84 },
    ],
    '30d': [
      { label: 'Sep 18', students: 1250, teachers: 76 },
      { label: 'Sep 25', students: 1295, teachers: 78 },
      { label: 'Oct 02', students: 1340, teachers: 80 },
      { label: 'Oct 09', students: 1385, teachers: 82 },
      { label: 'Oct 17', students: 1420, teachers: 84 },
    ],
    '90d': [
      { label: 'Jul 20', students: 980, teachers: 65 },
      { label: 'Aug 15', students: 1120, teachers: 72 },
      { label: 'Sep 01', students: 1240, teachers: 78 },
      { label: 'Oct 17', students: 1420, teachers: 84 },
    ],
  };

  const currentPoints = chartData[timeRange];
  const maxStudents = Math.max(...currentPoints.map((d) => d.students)) * 1.05;
  const minStudents = Math.min(...currentPoints.map((d) => d.students)) * 0.95;

  // SVG Coordinates calculation
  const svgWidth = 600;
  const svgHeight = 160;
  const pointsString = currentPoints
    .map((p, idx) => {
      const x = (idx / (currentPoints.length - 1)) * (svgWidth - 40) + 20;
      const y =
        svgHeight -
        20 -
        ((p.students - minStudents) / (maxStudents - minStudents || 1)) * (svgHeight - 40);
      return `${x},${y}`;
    })
    .join(' ');

  const pendingInvites = [
    {
      name: 'Amara Okonkwo',
      role: 'STUDENT',
      email: 'amara.okonkwo@mentify.edu',
      date: 'Oct 14, 2026',
      status: 'INVITED' as const,
    },
    {
      name: 'Priya Nambiar',
      role: 'TEACHER',
      email: 'priya.nambiar@mentify.edu',
      date: 'Oct 15, 2026',
      status: 'INVITED' as const,
    },
    ...(role === 'SUPER_ADMIN'
      ? [
          {
            name: 'Benjamin Hayes',
            role: 'ADMIN',
            email: 'benjamin.hayes@mentify.edu',
            date: 'Oct 16, 2026',
            status: 'INVITED' as const,
          },
        ]
      : []),
  ];

  const recentRegistrations = [
    {
      id: 'r1',
      name: 'Elena Rostova',
      role: 'STUDENT' as const,
      email: 'elena.rostova@mentify.edu',
      date: 'Sep 02, 2026',
      status: 'ACTIVE' as const,
      idCode: 'STU-2026-0842',
    },
    {
      id: 'r2',
      name: 'Tariq Mansoor',
      role: 'STUDENT' as const,
      email: 'tariq.mansoor@mentify.edu',
      date: 'Sep 03, 2026',
      status: 'ACTIVE' as const,
      idCode: 'STU-2026-0843',
    },
    {
      id: 'r3',
      name: 'Sarah Jenkins',
      role: 'TEACHER' as const,
      email: 'sarah.jenkins@mentify.edu',
      date: 'Aug 15, 2025',
      status: 'ACTIVE' as const,
      idCode: 'TCH-9104',
    },
    {
      id: 'r4',
      name: 'Chloe Lin',
      role: 'STUDENT' as const,
      email: 'chloe.lin@mentify.edu',
      date: 'Sep 08, 2026',
      status: 'ACTIVE' as const,
      idCode: 'STU-2026-0846',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Saturday, October 17, 2026
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Keycloak SSO Realm: mentify-prod</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Good morning, Alex!</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Platform status is nominal across all 6 microservices. 12 account invitations await
              activation, and 9 institutional examinations are scheduled for next week.
            </p>

            {/* Quick action shortcuts */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onQuickAction('register-student')}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800 transition-colors"
              >
                + Register Student
              </button>
              <button
                onClick={() => onQuickAction('register-teacher')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              >
                + Register Teacher
              </button>
              {role === 'SUPER_ADMIN' && (
                <button
                  onClick={() => onQuickAction('register-admin')}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800 transition-colors"
                >
                  + Register Admin
                </button>
              )}
              <button
                onClick={() => onNavigate('registrations')}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
              >
                View Invitations ({kpis.pendingInvitations})
              </button>
            </div>
          </div>

          {/* Mentify AI Assistant Mini Teaser */}
          <div className="md:w-80 p-4 rounded-xl bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/80 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Mentify AI Quick Assist</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              "Summarize platform activity and quiz failure trends for this week."
            </p>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Launch Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={kpis.totalStudents}
          subtitle="Enrolled in school"
          change="+8.4% term-over-term"
          icon={GraduationCap}
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title="Total Teachers"
          value={kpis.totalTeachers}
          subtitle="4 departments"
          change="+4 hired this month"
          icon={Briefcase}
          onClick={() => onNavigate('teachers')}
        />
        <StatCard
          title="Active Courses"
          value={kpis.totalCourses}
          subtitle="Across Grades 10-12"
          change="3,290 enrollments"
          icon={BookOpen}
          onClick={() => onNavigate('courses')}
        />
        <StatCard
          title="Pending Invitations"
          value={kpis.pendingInvitations}
          subtitle="Awaiting Keycloak activation"
          change="Requires follow-up"
          isPositive={false}
          icon={MailCheck}
          onClick={() => onNavigate('registrations')}
        />
      </div>

      {/* Secondary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[11px] text-slate-500 block">Active Users (7d)</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {kpis.activeUsers.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 block">94.2% engagement</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Active Enrollments</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {kpis.activeEnrollments.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">2.3 courses / student</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Upcoming Examinations</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {kpis.upcomingExams}
          </span>
          <span className="text-[10px] text-indigo-600 block">Oct 25 – Nov 04</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Pending Admin Actions</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {kpis.pendingAdminActions}
          </span>
          <span className="text-[10px] text-amber-600 block">Review capacity & approvals</span>
        </div>
      </div>

      {/* Analytics & Academic Overview 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                User Growth & Registration Velocity
              </h3>
              <p className="text-xs text-slate-500">
                Verified student registrations and faculty onboardings
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Trend Visualization */}
          <div className="h-44 w-full relative flex items-end pt-4">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area */}
              <polygon
                points={`20,${svgHeight - 20} ${pointsString} ${svgWidth - 20},${svgHeight - 20}`}
                fill="url(#growthGradient)"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-4 border-t border-slate-100 dark:border-slate-800 pt-2">
            {currentPoints.map((p, idx) => (
              <span key={idx} className="tabular-nums">
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Operational Pending Invitations Card (1 col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Pending Invitations
              </h3>
              <span className="text-xs text-amber-600 font-medium tabular-nums">
                {pendingInvites.length} eligible
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Registered users who haven't completed their initial Keycloak activation.
            </p>

            <div className="space-y-3">
              {pendingInvites.map((user, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </span>
                      <RoleBadge role={user.role as any} />
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                      {user.email}
                    </span>
                  </div>

                  <button
                    onClick={() => onResendInvitation(user.email, user.role)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Resend</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('registrations')}
              className="w-full text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Full Registration Operations →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Registrations & Upcoming Academic Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registrations Table (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent User Registrations
              </h3>
              <p className="text-xs text-slate-500">
                Latest accounts provisioned across Spring Boot User Services
              </p>
            </div>
            <button
              onClick={() => onNavigate('users')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View directory ({students.length + teachers.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-medium">User</th>
                  <th className="pb-2.5 font-medium">Role</th>
                  <th className="pb-2.5 font-medium">ID / Code</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium">Registered</th>
                  <th className="pb-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRegistrations.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={user.name} size="sm" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-slate-400">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
                      {user.idCode}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="py-2.5 text-slate-500 tabular-nums">{user.date}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() =>
                          onNavigate(user.role === 'STUDENT' ? 'students' : 'teachers')
                        }
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Academic Events (1 col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Upcoming Academic Events
              </h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Calendar
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Classes, deadlines and examination sessions scheduled.
            </p>

            <div className="space-y-3">
              {events.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        evt.type === 'EXAM'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : evt.type === 'DEADLINE'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {evt.type}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">{evt.date}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {evt.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{evt.time}</span>
                    <span>·</span>
                    <span className="truncate">{evt.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('calendar')}
              className="w-full text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Academic Calendar →
            </button>
          </div>
        </div>
      </div>

      {/* Platform Activity Timeline Section */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Administrative Audit Events
            </h3>
            <p className="text-xs text-slate-500">
              Microservice audit trail: Keycloak SSO, AWS S3 Material Service & AI Service
            </p>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Audit Center →
          </button>
        </div>

        <div className="space-y-3">
          {recentLogs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Actor: {log.actorEmail}</span>
                  <span>·</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
