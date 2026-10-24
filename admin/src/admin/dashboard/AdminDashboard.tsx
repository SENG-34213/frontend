import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Plus,
  Sparkles,
  Users,
  UserRoundCheck,
  Zap,
} from "lucide-react";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import {
  PlatformKPIs,
  StudentProfile,
  TeacherProfile,
  AcademicEvent,
  AuditEvent,
  AdminRole,
} from "../types";
import { AdminRoute } from "../components/AdminSidebar";
import type { RegistrationOverview } from "../api/dashboardApi";
import type { AdminAnalyticsOverview } from "../api/analyticsApi";

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
  registrationOverview?: RegistrationOverview | null;
  registrationOverviewLoading?: boolean;
  registrationOverviewError?: string;
  analytics?: AdminAnalyticsOverview | null;
  analyticsLoading?: boolean;
  analyticsError?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  kpis,
  students,
  events,
  recentLogs,
  role,
  onNavigate,
  onQuickAction,
  registrationOverview,
  registrationOverviewLoading = false,
  registrationOverviewError,
  analytics,
  analyticsLoading = false,
  analyticsError,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [hoveredGrowthPoint, setHoveredGrowthPoint] = useState<number | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const metricColorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  };
  const metricArrowColorClasses: Record<string, string> = {
    indigo: "text-indigo-500 group-hover:text-indigo-600",
    violet: "text-violet-500 group-hover:text-violet-600",
    sky: "text-sky-500 group-hover:text-sky-600",
    amber: "text-amber-500 group-hover:text-amber-600",
  };
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  const latestRegistrations = useMemo(() => {
    if (!registrationOverview) return [];
    return [...registrationOverview.recentStudents, ...registrationOverview.recentTeachers]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }, [registrationOverview]);
  const accountMix = useMemo(() => {
    const colors: Record<string, string> = {
      STUDENT: "bg-indigo-500",
      TEACHER: "bg-violet-500",
      ADMIN: "bg-sky-400",
      SUPER_ADMIN: "bg-slate-300",
    };
    const analyticsUsers = analytics?.users;
    const source = analyticsUsers
      ? {
          STUDENT: analyticsUsers.students,
          TEACHER: analyticsUsers.teachers,
          ADMIN: analyticsUsers.admins,
        }
      : (registrationOverview?.usersByRole ?? {
          STUDENT: kpis.totalStudents,
          TEACHER: kpis.totalTeachers,
        });
    const totalUsers =
      analyticsUsers?.totalUsers ??
      registrationOverview?.totalUsers ??
      kpis.totalStudents + kpis.totalTeachers;
    if (!source || !totalUsers) return [];

    return Object.entries(source)
      .filter(([, value]) => typeof value === "number" && value > 0)
      .map(([roleName, value]) => ({
        label: roleName.replaceAll("_", " "),
        value: value as number,
        percentage: Math.round(((value as number) / totalUsers) * 100),
        color: colors[roleName] ?? "bg-slate-300",
      }));
  }, [analytics, kpis.totalStudents, kpis.totalTeachers, registrationOverview]);
  const accountMixTotal = accountMix.reduce((sum, item) => sum + item.value, 0);
  const accountMixGradient = useMemo(() => {
    if (!accountMixTotal) return "conic-gradient(#cbd5e1 0 100%)";
    let start = 0;
    const colors: Record<string, string> = {
      STUDENT: "#6366f1",
      TEACHER: "#8b5cf6",
      ADMIN: "#38bdf8",
      SUPER_ADMIN: "#94a3b8",
    };
    const stops = accountMix.map((item) => {
      const roleName = item.label.replaceAll(" ", "_");
      const end = start + (item.value / accountMixTotal) * 100;
      const stop = `${colors[roleName] ?? "#94a3b8"} ${start}% ${end}%`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [accountMix, accountMixTotal]);
  const enrollmentTrend = useMemo(() => {
    return [
      { label: "Jan", value: 120 },
      { label: "Feb", value: 168 },
      { label: "Mar", value: 215 },
      { label: "Apr", value: 248 },
      { label: "May", value: 302 },
      { label: "Jun", value: 365 },
      { label: "Jul", value: 418 },
      { label: "Aug", value: 486 },
    ];
  }, []);
  const isSampleEnrollmentTrend = true;
  const maxEnrollmentTrend = Math.max(...enrollmentTrend.map((point) => point.value), 1);
  const revenueTrend = [
    { label: "Jan", value: 185000 },
    { label: "Feb", value: 224000 },
    { label: "Mar", value: 208000 },
    { label: "Apr", value: 276000 },
    { label: "May", value: 318000 },
    { label: "Jun", value: 362000 },
    { label: "Jul", value: 405000 },
    { label: "Aug", value: 468000 },
  ];
  const maxRevenue = Math.max(...revenueTrend.map((point) => point.value), 1);
  const calendarCells = useMemo(() => {
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(1 - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return { date, key, isCurrentMonth: date.getMonth() === calendarMonth.getMonth() };
    });
  }, [calendarMonth]);
  const selectedDayEvents = events
    .filter((event) => event.date === selectedCalendarDate)
    .slice(0, 3);
  const monthLabel = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const openQuickActions = (action: string) => {
    setShowActions(false);
    onQuickAction(action);
  };
  const liveStudents = analytics?.users?.students ?? kpis.totalStudents;
  const liveTeachers = analytics?.users?.teachers ?? kpis.totalTeachers;
  const liveCourses =
    analytics?.courses?.activeCourses ?? analytics?.courses?.totalCourses ?? kpis.totalCourses;
  const liveActiveUsers = analytics?.users?.accountStatusMix?.ACTIVE ?? kpis.activeUsers;
  const liveEnrollments = analytics?.enrollment?.activeEnrollments ?? kpis.activeEnrollments;
  const liveAttendance = analytics?.attendance?.averageAttendance;
  const analyticsIsPartial = analytics?.partial === true;
  return (
    <div className="flex flex-col space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-indigo-950/10 sm:px-8">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-48 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
              Platform overview <span className="text-slate-500">/</span> {todayLabel}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting}, administrator.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Here’s the latest pulse of your institution. Engagement is up, registrations are
              moving steadily, and there are a few actions ready for your attention.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowActions((open) => !open)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-indigo-50"
              >
                <Plus className="h-4 w-4" />
                Quick action
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showActions ? "rotate-180" : ""}`}
                />
              </button>
              <button
                onClick={() => onNavigate("analytics")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                View analytics
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {showActions && (
              <div className="mt-3 flex w-fit flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-md">
                <button
                  onClick={() => openQuickActions("register-student")}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/20"
                >
                  Register student
                </button>
                <button
                  onClick={() => openQuickActions("register-teacher")}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/20"
                >
                  Register teacher
                </button>
                {role === "SUPER_ADMIN" && (
                  <button
                    onClick={() => openQuickActions("register-admin")}
                    className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/20"
                  >
                    Register admin
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[390px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
              <Activity className="mb-5 h-4 w-4 text-indigo-300" />
              <p className="text-2xl font-semibold tabular-nums">
                {liveActiveUsers.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Active this week</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
              <UserRoundCheck className="mb-5 h-4 w-4 text-emerald-300" />
              <p className="text-2xl font-semibold tabular-nums">
                {analyticsLoading
                  ? "…"
                  : analyticsError
                    ? "—"
                    : analyticsIsPartial
                      ? "Partial"
                      : "Live"}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Analytics status</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm sm:col-span-1">
              <Bell className="mb-5 h-4 w-4 text-amber-300" />
              <p className="text-2xl font-semibold tabular-nums">{kpis.pendingAdminActions}</p>
              <p className="mt-1 text-[11px] text-slate-400">Needs attention</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total students",
            value: liveStudents,
            note: "Live platform total",
            icon: GraduationCap,
            color: "indigo",
            route: "students" as AdminRoute,
            stroke: "#6366f1",
          },
          {
            title: "Total teachers",
            value: liveTeachers,
            note: "Live registered total",
            icon: Users,
            color: "violet",
            route: "teachers" as AdminRoute,
            stroke: "#8b5cf6",
          },
          {
            title: "Active courses",
            value: liveCourses,
            note: "Live course total",
            icon: BookOpen,
            color: "sky",
            route: "courses" as AdminRoute,
            stroke: "#0ea5e9",
          },
          {
            title: "Pending invitations",
            value: kpis.pendingInvitations,
            note: "Live invitation queue",
            icon: Mail,
            color: "amber",
            route: "registrations" as AdminRoute,
            stroke: "#f59e0b",
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.title}
              onClick={() => onNavigate(metric.route)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700/60 dark:hover:shadow-none"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${metricColorClasses[metric.color]}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Live
                </span>
              </div>
              <p className="mt-5 text-xs font-medium text-slate-500">{metric.title}</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {metric.value.toLocaleString()}
                </p>
                <Zap
                  className={`mb-1 h-4 w-4 transition ${metricArrowColorClasses[metric.color]}`}
                />
              </div>
              <p
                className={`mt-2 text-[11px] ${metric.color === "amber" ? "text-amber-600" : "text-emerald-600"}`}
              >
                {metric.note}
              </p>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  Community growth
                </h2>
                <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                  Sample preview
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Example enrollment growth preview</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              {isSampleEnrollmentTrend
                ? "Sample"
                : analyticsLoading
                  ? "Refreshing"
                  : analyticsError
                    ? "Unavailable"
                    : "Live"}
            </span>
          </div>
          {enrollmentTrend.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 dark:from-indigo-950/30 dark:via-slate-950/30 dark:to-violet-950/20 sm:p-5">
              <svg
                viewBox="0 0 800 260"
                className="h-[245px] w-full min-w-[560px]"
                role="img"
                aria-label="Sample community enrollment growth line chart"
              >
                <defs>
                  <linearGradient id="community-growth-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((line) => {
                  const y = 24 + line * 55;
                  return (
                    <line
                      key={line}
                      x1="42"
                      x2="778"
                      y1={y}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.12"
                      strokeDasharray="4 6"
                    />
                  );
                })}
                <polyline
                  points={enrollmentTrend
                    .map((point, index) => {
                      const x = 48 + (index / Math.max(enrollmentTrend.length - 1, 1)) * 720;
                      const y = 190 - (point.value / maxEnrollmentTrend) * 150;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#6366f1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                <polygon
                  points={`48,190 ${enrollmentTrend
                    .map((point, index) => {
                      const x = 48 + (index / Math.max(enrollmentTrend.length - 1, 1)) * 720;
                      const y = 190 - (point.value / maxEnrollmentTrend) * 150;
                      return `${x},${y}`;
                    })
                    .join(" ")} 768,190`}
                  fill="url(#community-growth-area)"
                />
                {enrollmentTrend.map((point, index) => {
                  const x = 48 + (index / Math.max(enrollmentTrend.length - 1, 1)) * 720;
                  const y = 190 - (point.value / maxEnrollmentTrend) * 150;
                  const tooltipX = Math.min(Math.max(x - 58, 4), 680);
                  const tooltipY = Math.max(y - 58, 4);
                  return (
                    <g
                      key={`${point.label}-${index}`}
                      onMouseEnter={() => setHoveredGrowthPoint(index)}
                      onMouseLeave={() => setHoveredGrowthPoint(null)}
                      onFocus={() => setHoveredGrowthPoint(index)}
                      onBlur={() => setHoveredGrowthPoint(null)}
                      tabIndex={0}
                      className="cursor-pointer outline-none"
                    >
                      {hoveredGrowthPoint === index && (
                        <g pointerEvents="none">
                          <rect
                            x={tooltipX}
                            y={tooltipY}
                            width="116"
                            height="40"
                            rx="8"
                            fill="#0f172a"
                            stroke="#6366f1"
                            strokeWidth="1"
                          />
                          <text
                            x={tooltipX + 58}
                            y={tooltipY + 16}
                            textAnchor="middle"
                            fill="#c7d2fe"
                            className="text-[10px] font-semibold"
                          >
                            {point.label}
                          </text>
                          <text
                            x={tooltipX + 58}
                            y={tooltipY + 31}
                            textAnchor="middle"
                            fill="#ffffff"
                            className="text-[11px] font-bold"
                          >
                            {point.value.toLocaleString()} enrollments
                          </text>
                        </g>
                      )}
                      <circle cx={x} cy={y} r="7" fill="#ffffff" stroke="#6366f1" strokeWidth="4" />
                      <text
                        x={x}
                        y="222"
                        textAnchor="middle"
                        className="fill-slate-500 text-[11px]"
                      >
                        {point.label}
                      </text>
                      <title>{`${point.label}: ${point.value.toLocaleString()} enrollments`}</title>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-8 text-center dark:border-indigo-900/60 dark:bg-indigo-950/20">
              <Activity className="mx-auto h-8 w-8 text-indigo-300 dark:text-indigo-500" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Enrollment activity is being collected
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Current live enrollment totals are available below while trend history is prepared.
              </p>
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-4 text-[11px] text-slate-500 dark:border-slate-800">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Students{" "}
              <strong className="text-slate-900 dark:text-white">
                {liveStudents.toLocaleString()}
              </strong>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Teachers{" "}
              <strong className="text-slate-900 dark:text-white">
                {liveTeachers.toLocaleString()}
              </strong>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active enrollments{" "}
              <strong className="text-slate-900 dark:text-white">
                {liveEnrollments.toLocaleString()}
              </strong>
            </span>
            {liveAttendance !== undefined && (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Attendance{" "}
                <strong className="text-slate-900 dark:text-white">
                  {liveAttendance.toFixed(1)}%
                </strong>
              </span>
            )}
            {registrationOverviewLoading && (
              <span className="text-indigo-500">Refreshing data…</span>
            )}
            {registrationOverviewError && (
              <span className="text-rose-500">Live data unavailable</span>
            )}
            {analyticsLoading && <span className="text-indigo-500">Refreshing analytics…</span>}
            {analyticsError && <span className="text-rose-500">Analytics unavailable</span>}
            {analyticsIsPartial && !analyticsError && (
              <span className="text-amber-600 dark:text-amber-400">
                Some analytics sections unavailable
              </span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Account mix
              </h2>
              <p className="mt-1 text-xs text-slate-500">Registered users by role</p>
            </div>
            <button
              onClick={() => onNavigate("enrollments")}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <div
              className="relative h-44 w-44 rounded-full shadow-inner"
              style={{ background: accountMixGradient }}
            >
              <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                <span className="text-3xl font-semibold text-slate-950 dark:text-white">
                  {(
                    analytics?.users?.totalUsers ?? registrationOverview?.totalUsers
                  )?.toLocaleString() ?? "—"}
                </span>
                <span className="mt-1 text-[11px] text-slate-500">registered users</span>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3">
            {accountMix.length > 0 ? (
              accountMix.map(({ label, value, percentage, color }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    {label}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {value.toLocaleString()} ({percentage}%)
                  </span>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-xs text-slate-500">Account mix is unavailable.</p>
            )}
          </div>
        </div>
      </section>

      <section className="order-4 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Recent registrations
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                The newest members across your institution
              </p>
            </div>
            <button
              onClick={() => onNavigate("registrations")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View registrations <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {latestRegistrations.length ? (
              latestRegistrations.map((user) => {
                const name = `${user.firstName} ${user.lastName}`.trim();
                const userRole = user.role;
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:px-6"
                  >
                    <UserAvatar name={name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-950 dark:text-white">
                        {name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{user.email}</p>
                    </div>
                    <RoleBadge role={userRole} />
                    <span className="hidden text-[11px] text-slate-400 md:block">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => onNavigate(userRole === "STUDENT" ? "students" : "teachers")}
                      className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="px-5 py-8 text-center text-xs text-slate-400 sm:px-6">
                No recent registrations yet.
              </p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Needs attention
              </h2>
              <p className="mt-1 text-xs text-slate-500">A few items need your review</p>
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              {kpis.pendingAdminActions} open
            </span>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <button
              onClick={() => onNavigate("registrations")}
              className="flex w-full items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 text-left transition hover:border-amber-200 dark:border-amber-900/50 dark:bg-amber-950/20"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Pending invitations
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                  {kpis.pendingInvitations} people are waiting to activate their accounts.
                </span>
              </span>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-600" />
            </button>
            <button
              onClick={() => onNavigate("calendar")}
              className="flex w-full items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-left transition hover:border-indigo-200 dark:border-indigo-900/50 dark:bg-indigo-950/20"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <CalendarDays className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Upcoming schedule
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                  {kpis.upcomingExams} examinations and academic events are coming up.
                </span>
              </span>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-indigo-600" />
            </button>
            <button
              onClick={() => onNavigate("courses")}
              className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-left transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Course capacity
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                  Review course sections and enrollment distribution.
                </span>
              </span>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      <section className="order-3 overflow-hidden rounded-[24px] border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/70 p-5 shadow-sm shadow-indigo-100/50 dark:border-indigo-950/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 sm:p-6">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Academic calendar
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              A quick view of classes, exams, and deadlines
            </p>
          </div>
          <button
            onClick={() => onNavigate("calendar")}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
          >
            Open full calendar <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
            <div>
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-indigo-100/80 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                <button
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                    )
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {monthLabel}
                </span>
                <button
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                    )
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <span key={day} className="py-2">
                      {day.slice(0, 2)}
                    </span>
                  ))}
                  {calendarCells.map((cell) => {
                    const dayEvents = events.filter((event) => event.date === cell.key);
                    const isSelected = selectedCalendarDate === cell.key;
                    return (
                      <button
                        key={cell.key}
                        onClick={() => setSelectedCalendarDate(cell.key)}
                        className={`relative min-h-12 rounded-xl p-2 text-xs transition ${isSelected ? "bg-indigo-600 font-bold text-white shadow-md shadow-indigo-200 dark:shadow-none" : cell.isCurrentMonth ? "text-slate-700 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-indigo-950/40" : "text-slate-300 dark:text-slate-700"}`}
                      >
                        <span>{cell.date.getDate()}</span>
                        {dayEvents.length > 0 && (
                          <span
                            className={`absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${isSelected ? "bg-white" : "bg-indigo-500"}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-5 text-white shadow-lg shadow-indigo-200/40 dark:bg-indigo-950/70 dark:shadow-none">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-indigo-500/30 blur-2xl" />
              <div className="flex items-center justify-between">
                <div className="relative">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
                    Selected day
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {new Date(`${selectedCalendarDate}T00:00:00`).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="relative rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-indigo-100 ring-1 ring-white/15">
                  {selectedDayEvents.length} events
                </span>
              </div>
              <div className="relative mt-5 space-y-2.5">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onNavigate("calendar")}
                      className="flex w-full items-start gap-2.5 rounded-xl bg-white p-3 text-left shadow-sm transition hover:ring-2 hover:ring-indigo-200 dark:bg-slate-900 dark:hover:ring-indigo-800"
                    >
                      <span
                        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${event.type === "EXAM" ? "bg-rose-500" : event.type === "DEADLINE" ? "bg-amber-500" : "bg-indigo-500"}`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold text-slate-900 dark:text-white">
                          {event.title}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {event.time} · {event.location}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="py-7 text-center">
                    <CalendarDays className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-xs text-slate-200">No events scheduled</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Select another day to explore the schedule.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm dark:border-emerald-950/60 dark:bg-slate-900/70 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                    Income &amp; revenue
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Sample monthly revenue growth</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Sample
              </span>
            </div>
            <div className="mt-6 overflow-x-auto rounded-2xl bg-emerald-50/60 p-3 dark:bg-emerald-950/20">
              <svg
                viewBox="0 0 520 245"
                className="h-[230px] min-w-[460px] w-full"
                role="img"
                aria-label="Sample monthly income and revenue line chart"
              >
                {[0, 1, 2, 3].map((line) => {
                  const y = 25 + line * 48;
                  return (
                    <line
                      key={line}
                      x1="34"
                      x2="500"
                      y1={y}
                      y2={y}
                      stroke="#10b981"
                      strokeOpacity="0.18"
                      strokeDasharray="4 5"
                    />
                  );
                })}
                <polyline
                  points={revenueTrend
                    .map((point, index) => {
                      const x = 38 + (index / (revenueTrend.length - 1)) * 454;
                      const y = 180 - (point.value / maxRevenue) * 135;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#059669"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                {revenueTrend.map((point, index) => {
                  const x = 38 + (index / (revenueTrend.length - 1)) * 454;
                  const y = 180 - (point.value / maxRevenue) * 135;
                  return (
                    <g key={`${point.label}-${index}`}>
                      <circle cx={x} cy={y} r="6" fill="#ffffff" stroke="#059669" strokeWidth="4" />
                      <text
                        x={x}
                        y="214"
                        textAnchor="middle"
                        className="fill-slate-500 text-[10px]"
                      >
                        {point.label}
                      </text>
                      <title>{`${point.label}: LKR ${point.value.toLocaleString()}`}</title>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-100 pt-4 dark:border-emerald-950/60">
              <span className="text-xs text-slate-500">August revenue</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                LKR {revenueTrend[revenueTrend.length - 1].value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="order-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Upcoming events
              </h2>
              <p className="mt-1 text-xs text-slate-500">Stay ahead of the academic calendar</p>
            </div>
            <button
              onClick={() => onNavigate("calendar")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
            >
              Open calendar
            </button>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            {events.slice(0, 4).map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${event.type === "EXAM" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"}`}
                  >
                    {event.type}
                  </span>
                  <span className="text-[11px] text-slate-400">{event.date}</span>
                </div>
                <h3 className="mt-3 truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {event.title}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  {event.time}
                  <span>·</span>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Latest activity
              </h2>
              <p className="mt-1 text-xs text-slate-500">Recent changes across the platform</p>
            </div>
            <button
              onClick={() => onNavigate("audit")}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            {recentLogs.slice(0, 4).map((log, index) => (
              <div key={log.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${index === 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"}`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  {index < Math.min(recentLogs.length, 4) - 1 && (
                    <span className="absolute top-9 h-8 w-px bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {log.action}
                    </p>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="order-6 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/60 px-5 py-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Need a deeper read?
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Ask TiT AI to summarize trends across your institution.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("ai-assistant")}
          className="hidden rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:block"
        >
          Launch assistant <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
