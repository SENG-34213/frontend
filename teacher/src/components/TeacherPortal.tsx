"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type View =
  | "dashboard" | "calendar" | "notifications" | "courses" | "content" | "students"
  | "enrollments" | "attendance" | "materials" | "assignments" | "quizzes" | "exams"
  | "grades" | "analytics" | "messages" | "ai" | "profile" | "settings";

type NavItem = { id: View; label: string; icon: string; badge?: string };

const groups: { label: string; items: NavItem[] }[] = [
  { label: "OVERVIEW", items: [{ id: "dashboard", label: "Dashboard", icon: "▦" }, { id: "calendar", label: "My Calendar", icon: "□", badge: "Today" }, { id: "notifications", label: "Notifications", icon: "◌", badge: "3" }] },
  { label: "TEACHING", items: [{ id: "courses", label: "My Courses", icon: "▤", badge: "4" }, { id: "content", label: "Course Content", icon: "⌘" }, { id: "students", label: "My Students", icon: "♙", badge: "142" }, { id: "enrollments", label: "Enrollments", icon: "+", badge: "8" }, { id: "attendance", label: "Attendance", icon: "✓" }, { id: "materials", label: "Learning Materials", icon: "▱" }] },
  { label: "ASSESSMENTS", items: [{ id: "assignments", label: "Assignments", icon: "☑", badge: "18" }, { id: "quizzes", label: "Quizzes", icon: "?" }, { id: "exams", label: "Examinations", icon: "◇" }, { id: "grades", label: "Grades & Results", icon: "★" }] },
  { label: "INSIGHTS & COMMUNICATION", items: [{ id: "analytics", label: "Analytics", icon: "▥" }, { id: "messages", label: "Messages", icon: "□", badge: "5" }, { id: "ai", label: "Mentify AI", icon: "✦", badge: "Pro" }] },
  { label: "ACCOUNT", items: [{ id: "profile", label: "My Profile", icon: "○" }, { id: "settings", label: "Settings", icon: "⚙" }] },
];

const courses = [
  { code: "CS-201", title: "Algorithms", description: "Design, analysis, and problem-solving fundamentals.", students: 48, avg: "86.4%", color: "from-indigo-600 to-violet-600" },
  { code: "CS-350", title: "Web Systems", description: "Modern full-stack systems and web architecture.", students: 38, avg: "88.2%", color: "from-fuchsia-600 to-indigo-600" },
  { code: "CS-420", title: "AI & Machine Learning", description: "Practical models, evaluation, and responsible AI.", students: 42, avg: "81.4%", color: "from-emerald-600 to-teal-500" },
];

const students = [
  ["Amara Silva", "CS-201 · Algorithms", "92%", "On track"],
  ["Dilan Perera", "CS-350 · Web Systems", "78%", "Needs review"],
  ["Nethmi Fernando", "CS-420 · AI & ML", "88%", "On track"],
  ["Sahan Jayasuriya", "CS-201 · Algorithms", "69%", "Intervention"],
];

const assignments = [
  ["AVL Tree Implementation", "CS-201", "18 pending", "Oct 20"],
  ["REST API Milestone", "CS-350", "6 pending", "Oct 23"],
  ["Model Evaluation Report", "CS-420", "12 pending", "Oct 28"],
];

function Icon({ children }: { children: ReactNode }) {
  return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{children}</span>;
}

function Button({ children, onClick, secondary = false }: { children: ReactNode; onClick?: () => void; secondary?: boolean }) {
  return <button type="button" onClick={onClick} className={secondary ? "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" : "rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"}>{children}</button>;
}

function Header({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold tracking-[0.2em] text-indigo-600">TEACHER WORKSPACE</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p></div>{action && <Button onClick={onAction}>+ {action}</Button>}</div>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

function Dashboard({ go }: { go: (view: View) => void }) {
  return <div className="space-y-6"><div className="rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 p-6 text-white shadow-lg sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">Monday, October 17, 2026</p><div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-bold sm:text-3xl">Good morning, Anuradha</h2><p className="mt-2 max-w-xl text-sm text-indigo-100">Here is what needs your attention across your teaching workspace today.</p></div><Button onClick={() => go("ai")}>Open Mentify AI</Button></div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Active students", "142", "Across 4 courses", "♙"], ["Active courses", "4", "This semester", "▤"], ["Pending review", "18", "Ready to grade", "☑"], ["Attendance rate", "93.2%", "Last 30 days", "✓"]].map(([label, value, note, icon]) => <Card key={label} className="p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-slate-500">{label}</p><Icon>{icon}</Icon></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-500">{note}</p></Card>)}</div><div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><div className="space-y-6"><Card className="p-5"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><h2 className="text-sm font-bold text-slate-900">Today&apos;s teaching schedule</h2><p className="mt-1 text-xs text-slate-500">Two classes are scheduled for today.</p></div><button onClick={() => go("calendar")} className="text-xs font-semibold text-indigo-600">Full calendar →</button></div><div className="mt-4 space-y-3">{[["10:00 AM", "Algorithms · Lecture 12", "Room 204", "48 students"], ["02:00 PM", "Web Systems · Workshop", "Lab 03", "38 students"]].map(([time, title, room, count]) => <div key={title} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="rounded-md bg-indigo-50 px-2 py-1.5 font-mono text-xs font-semibold text-indigo-700">{time}</span><div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{room} · {count}</p></div></div><Button secondary onClick={() => go("attendance")}>Take attendance</Button></div>)}</div></Card><Card className="p-5"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><h2 className="text-sm font-bold text-slate-900">Pending grading queue</h2><button onClick={() => go("assignments")} className="text-xs font-semibold text-indigo-600">Open workspace →</button></div><div className="divide-y divide-slate-100">{assignments.map(([title, code, pending, due]) => <div key={title} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-800"><span className="mr-2 font-mono text-xs text-indigo-600">[{code}]</span>{title}</p><p className="mt-1 text-xs text-slate-500">Due {due} · <span className="font-semibold text-amber-600">{pending}</span></p></div><Button onClick={() => go("assignments")}>Grade now</Button></div>)}</div></Card></div><div className="space-y-6"><Card className="overflow-hidden bg-slate-950 p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">MENTIFY AI ASSISTANT</p><h2 className="mt-3 text-lg font-bold">Make teaching easier with AI</h2><p className="mt-2 text-xs leading-5 text-slate-300">Draft rubrics, create quiz questions, and summarize class performance in seconds.</p><div className="mt-4 space-y-2">{["Draft five quiz questions for CS-201", "Generate a rubric for the next milestone", "Summarize student performance"].map((prompt) => <button key={prompt} onClick={() => go("ai")} className="block w-full rounded-lg bg-white/10 px-3 py-2 text-left text-xs text-indigo-100 hover:bg-white/15">{prompt} <span className="float-right">→</span></button>)}</div></Card><Card className="p-5"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="text-sm font-bold text-slate-900">Course performance</h2><button onClick={() => go("analytics")} className="text-xs font-semibold text-indigo-600">Analytics</button></div><div className="mt-4 space-y-4">{courses.map((course) => <div key={course.code}><div className="flex justify-between text-xs"><span className="font-semibold text-slate-700">{course.code} · {course.title}</span><span className="font-mono font-bold">{course.avg}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: course.avg }} /></div></div>)}</div></Card></div></div></div>;
}

function Courses({ go }: { go: (view: View) => void }) {
  return <><Header title="My Courses" description="Manage your courses, cohorts, and teaching content." action="Create course" onAction={() => go("content")} /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <Card key={course.code} className="overflow-hidden"><div className={`h-24 bg-gradient-to-br ${course.color} p-5 text-white`}><span className="rounded-md bg-white/15 px-2 py-1 font-mono text-xs font-bold">{course.code}</span></div><div className="p-5"><div className="flex justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900">{course.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{course.description}</p></div><span className="h-fit rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">ACTIVE</span></div><div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-xs text-slate-500"><span>{course.students} students</span><span>Avg {course.avg}</span></div><div className="mt-4 flex gap-2"><Button onClick={() => go("content")}>Manage course</Button><Button secondary onClick={() => go("analytics")}>Insights</Button></div></div></Card>)}</div></>;
}

function TablePage({ view, go }: { view: "students" | "assignments" | "enrollments" | "grades"; go: (view: View) => void }) {
  const config = {
    students: ["My Students", "Review your student roster, progress, and intervention needs.", "Add student"],
    assignments: ["Assignments & Submissions", "Manage coursework, submissions, and grading priorities.", "Create assignment"],
    enrollments: ["Enrollment Management", "Review requests and keep each course cohort ready.", "Invite student"],
    grades: ["Grades & Results", "Review marks and spot students who need support.", "Export gradebook"],
  }[view];
  const rows = view === "students"
    ? students
    : view === "assignments"
      ? assignments
      : view === "enrollments"
        ? [["Maya Fernando", "CS-350 · Web Systems", "Pending", "Today"], ["Rashmi Wickramasinghe", "CS-420 · AI & ML", "Pending", "Yesterday"], ["Sahan Jayasuriya", "CS-201 · Algorithms", "Approved", "Oct 14"]]
        : students.map(([name, course, score, status]) => [name, course, score, status]);
  return (
    <>
      <Header title={config[0]} description={config[1]} action={config[2]} />
      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <input placeholder="Search..." className="min-w-[190px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-400" />
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"><option>All courses</option><option>CS-201 · Algorithms</option><option>CS-350 · Web Systems</option></select>
        </div>
        <div className="hidden grid-cols-[1.4fr_1.3fr_140px_120px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:grid"><span>{view === "students" ? "Student" : "Item"}</span><span>Course</span><span>Status</span><span>Action</span></div>
        <div className="divide-y divide-slate-100">
          {rows.map((row) => {
            const status = row[2];
            const attention = status.includes("Pending") || status.includes("Review") || status.includes("Intervention");
            const target: View = view === "students" ? "messages" : view === "assignments" ? "grades" : view;
            return <div key={row[0]} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.4fr_1.3fr_140px_120px] sm:items-center"><div><p className="text-sm font-semibold text-slate-800">{row[0]}</p><p className="mt-1 text-xs text-slate-500 sm:hidden">{row[1]}</p></div><span className="hidden text-xs text-slate-500 sm:block">{row[1]}</span><span className={attention ? "text-xs font-semibold text-amber-600" : "text-xs font-semibold text-emerald-600"}>{status}</span><button onClick={() => go(target)} className="w-fit text-xs font-semibold text-indigo-600">View details →</button></div>;
          })}
        </div>
      </Card>
    </>
  );
}

function SimplePage({ view, go }: { view: Exclude<View, "dashboard" | "courses" | "students" | "assignments" | "enrollments" | "grades">; go: (view: View) => void }) {
  const data: Record<string, [string, string, string]> = {
    calendar: ["My Calendar", "Plan classes, events, and important teaching deadlines.", "Create event"], notifications: ["Notifications", "Stay up to date with course activity and teaching priorities.", "Mark all read"], content: ["Course Content", "Build modules, lessons, and a clear learning path for every cohort.", "Create module"], attendance: ["Attendance Management", "Track daily attendance and review absence patterns.", "Take attendance"], materials: ["Learning Materials", "Organize, share, and manage your teaching resources.", "Upload material"], quizzes: ["Quizzes & Assessments", "Create, distribute, and analyze assessments for students.", "Create quiz"], exams: ["Exam Management", "Schedule examinations and track assessment readiness.", "Create exam"], analytics: ["Teaching Analytics", "Turn course signals into your next teaching action.", "Export report"], messages: ["Messages & Communication", "Keep your course community moving forward.", "New message"], ai: ["Mentify AI", "Your intelligent teaching partner for planning, assessment, and insight.", "New AI session"], profile: ["My Profile", "Keep your faculty profile and contact details up to date.", "Edit profile"], settings: ["Workspace Settings", "Control notifications and teacher workspace preferences.", "Save changes"],
  };
  const [title, description, action] = data[view];
  const [notice, setNotice] = useState("");
  const isAi = view === "ai";
  const panelClass = isAi ? "p-5 bg-slate-950 text-white" : "p-5";
  const headingClass = isAi ? "text-sm font-bold text-white" : "text-sm font-bold text-slate-900";
  const badgeClass = isAi ? "rounded-full bg-indigo-500/20 px-2 py-1 text-[10px] font-bold text-indigo-200" : "rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700";
  const saveMessage = () => setNotice(action + " is ready to configure.");
  return <><Header title={title} description={description} action={action} onAction={saveMessage} />{notice && <div className="mb-5 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-800">{notice}</div>}<div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><Card className={panelClass}><div className="flex items-center justify-between border-b border-slate-100/20 pb-4"><h2 className={headingClass}>{isAi ? "What would you like to work on?" : view === "calendar" ? "Upcoming activity" : "Workspace overview"}</h2><span className={badgeClass}>{isAi ? "PRO" : "LIVE DATA"}</span></div><div className="mt-5 space-y-3">{(isAi ? ["Draft five quiz questions for Algorithms", "Generate a rubric for a project milestone", "Summarize student performance"] : view === "calendar" ? ["Algorithms lecture · Today, 10:00 AM", "Web Systems workshop · Today, 2:00 PM", "Assignment deadline · Oct 20"] : view === "attendance" ? ["CS-201 · 48 students · 94% present", "CS-350 · 38 students · 91% present", "CS-420 · 42 students · 95% present"] : view === "materials" ? ["Algorithms lecture notes · PDF", "REST API lab starter · ZIP", "Model evaluation rubric · DOCX"] : view === "messages" ? ["Course group · 2 new messages", "Dilan Perera · Follow-up needed", "CS-420 cohort · Announcements"] : ["Review current activity across your courses", "Use quick actions to keep your teaching moving", "Your latest workspace updates appear here"]).map((item, index) => <button key={item} onClick={() => setNotice(isAi ? "Prompt added to your AI session." : "Opened item " + (index + 1) + ".")} className={isAi ? "flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/10 p-3 text-left text-xs text-indigo-100 transition hover:bg-white/15" : "flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left text-xs text-slate-700 transition hover:border-indigo-100 hover:bg-indigo-50/50"}><span>{item}</span><span>→</span></button>)}</div></Card><Card className="p-5"><h2 className="text-sm font-bold text-slate-900">Quick actions</h2><p className="mt-1 text-xs leading-5 text-slate-500">Common actions for your teacher workspace.</p><div className="mt-5 grid gap-2">{[["Manage courses", "courses"], ["Review submissions", "assignments"], ["View analytics", "analytics"], ["Message students", "messages"]].map(([label, target]) => <button key={label} onClick={() => go(target as View)} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">{label}<span>→</span></button>)}</div></Card></div></>;
}

function TeacherPortal() {
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const activeLabel = useMemo(() => groups.flatMap((group) => group.items).find((item) => item.id === view)?.label ?? "Dashboard", [view]);
  const go = (next: View) => { setView(next); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const content = view === "dashboard" ? <Dashboard go={go} /> : view === "courses" ? <Courses go={go} /> : view === "students" || view === "assignments" || view === "enrollments" || view === "grades" ? <TablePage view={view} go={go} /> : <SimplePage view={view} go={go} />;
  const asideClass = (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0") + " " + (collapsed ? "lg:w-20" : "lg:w-64") + " fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-slate-200 bg-white transition-all duration-200";
  const mainClass = (collapsed ? "lg:pl-20" : "lg:pl-64") + " flex min-w-0 flex-1 flex-col transition-all";
  return <div className="min-h-screen bg-slate-50"><div className="flex min-h-screen"><aside className={asideClass}><div className="flex h-16 items-center justify-between border-b border-slate-200 px-4"><div className="flex items-center gap-2 overflow-hidden"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-600 text-lg font-bold text-white">M</span>{!collapsed && <div className="min-w-0"><div className="flex items-center gap-1.5"><strong className="text-sm text-slate-900">Mentify</strong><span className="rounded border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700">Teacher</span></div><p className="truncate text-[11px] text-slate-400">Faculty Workspace</p></div>}</div><button onClick={() => setCollapsed((current) => !current)} className="hidden rounded p-1.5 text-slate-400 hover:bg-slate-100 lg:block" aria-label="Toggle sidebar">{collapsed ? "→" : "←"}</button><button onClick={() => setSidebarOpen(false)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close navigation">×</button></div><nav className="h-[calc(100%-128px)] space-y-5 overflow-y-auto px-3 py-4" aria-label="Teacher workspace">{groups.map((group) => <div key={group.label}><p className={collapsed ? "sr-only" : "px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400"}>{group.label}</p><div className="space-y-0.5">{group.items.map((item) => { const itemClass = view === item.id ? "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition bg-indigo-50 font-bold text-indigo-700" : item.id === "ai" ? "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition text-violet-700 hover:bg-violet-50" : "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition text-slate-600 hover:bg-slate-100 hover:text-slate-900"; const badgeClass = item.id === "ai" ? "rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-700" : "rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"; return <button key={item.id} onClick={() => go(item.id)} title={collapsed ? item.label : undefined} className={itemClass}><span className="flex min-w-0 items-center gap-2.5"><span className="w-4 text-center text-sm">{item.icon}</span>{!collapsed && <span className="truncate">{item.label}</span>}</span>{!collapsed && item.badge && <span className={badgeClass}>{item.badge}</span>}</button>; })}</div></div>)}</nav><div className="border-t border-slate-200 p-3"><button onClick={() => go("profile")} className={collapsed ? "flex w-full justify-center rounded-lg p-2 text-left hover:bg-slate-100" : "flex w-full items-center gap-2.5 rounded-lg p-2 text-left hover:bg-slate-100"}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white">AR</span>{!collapsed && <span className="min-w-0"><strong className="block truncate text-xs text-slate-900">Anuradha Rajapaksha</strong><small className="block truncate font-mono text-[11px] text-slate-500">TCH-1042</small></span>}</button></div></aside><div className={mainClass}><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6"><button onClick={() => setSidebarOpen(true)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 lg:hidden" aria-label="Open navigation">☰</button><div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span>Teacher Workspace</span><span>/</span><strong className="text-slate-700">{activeLabel}</strong></div><div className="ml-auto flex items-center gap-3"><button onClick={() => go("notifications")} aria-label="Notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">◌<span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" /></button><button onClick={() => go("profile")} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"><span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">AR</span><span className="hidden text-left sm:block"><strong className="block text-xs text-slate-800">Anuradha</strong><small className="block text-[10px] text-slate-400">Faculty</small></span></button></div></header><main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{content}</main></div></div>{sidebarOpen && <button aria-label="Close navigation overlay" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" />}</div>;
}

export default TeacherPortal;
