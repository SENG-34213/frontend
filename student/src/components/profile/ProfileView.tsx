import React, { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  ImagePlus,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { uploadProfileImage } from "../../api/student";
import { EmptyState } from "../../../../shared/ui/EmptyState";

const display = (value?: string | number | null, fallback = "Not provided") =>
  value !== undefined && value !== null && String(value).trim() ? String(value) : fallback;

const formatDate = (value?: string) => {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, courses, showToast } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    bio: profile.bio,
  });

  const enrolledCourses = courses.filter((course) => course.enrolled);
  const completedCourses = enrolledCourses.filter(
    (course) => course.progressPercentage >= 100,
  ).length;
  const averageProgress = enrolledCourses.length
    ? Math.round(
        enrolledCourses.reduce((total, course) => total + course.progressPercentage, 0) /
          enrolledCourses.length,
      )
    : 0;
  const creditProgress = profile.totalCreditsRequired
    ? Math.min(100, Math.round((profile.creditsCompleted / profile.totalCreditsRequired) * 100))
    : 0;
  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";
  const advisorInitials = profile.academicAdvisor.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const latestCourses = useMemo(() => enrolledCourses.slice(0, 4), [enrolledCourses]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Profile images must be smaller than 5 MB.");
      return;
    }
    setIsUploading(true);
    try {
      const response = await uploadProfileImage(file);
      const storageKey = response.data?.storageKey;
      if (!storageKey) throw new Error("The profile image reference was not returned.");
      await updateProfile({ avatar: storageKey });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Profile image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-950/20">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                {display(profile.name, "Student profile")}
              </h1>
              <p className="mt-1 break-all text-xs text-slate-400">{display(profile.email, "—")}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  Student
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {profile.emailVerified === false ? "Unverified" : "Active"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Student ID</span>
              <span className="truncate font-mono font-bold text-slate-900 dark:text-white">
                {display(profile.studentId, "Not assigned")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Current term</span>
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                {display(profile.semester, "Not set")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Program</span>
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                {display(profile.degreeProgram, "Not set")}
              </span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <ImagePlus className="h-3.5 w-3.5" /> {isUploading ? "Uploading…" : "Upload photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                disabled={isUploading}
                onChange={handleImageUpload}
              />
            </label>
            <button
              onClick={() => setIsEditing((current) => !current)}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              <User className="h-3.5 w-3.5" /> {isEditing ? "Cancel" : "Edit profile"}
            </button>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Student profile & contact information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your account details and current academic information.
              </p>
            </div>
            <GraduationCap className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            {[
              ["Email", display(profile.email)],
              ["Phone number", display(profile.phone)],
              ["Institution", display(profile.institution)],
              ["Department", display(profile.department)],
              ["Joined", formatDate(profile.joinedDate)],
              ["Account role", "Student"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 break-all font-medium text-slate-800 dark:text-slate-200">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy hero layout retained for reference while the student profile follows the admin layout.
      <section className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-6 text-slate-900 shadow-[0_12px_35px_rgba(15,23,42,0.05)] sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-100/70 blur-3xl dark:bg-indigo-950/40" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-100/60 blur-3xl dark:bg-cyan-950/30" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold shadow-lg shadow-indigo-950/40 sm:h-24 sm:w-24 sm:text-3xl">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  Student profile
                </span>
                {profile.emailVerified !== false && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Verified account
                  </span>
                )}
              </div>
              <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {display(profile.name, "Student")}
              </h1>
              <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-300">
                {display(profile.degreeProgram, "Academic program")}{" "}
                <span className="text-slate-500">·</span>{" "}
                {display(profile.department, "Department not set")}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                Member since {formatDate(profile.joinedDate)}
              </p>
            </div>
          </div>
          <div className="relative flex flex-wrap gap-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <ImagePlus className="h-3.5 w-3.5" /> {isUploading ? "Uploading…" : "Upload photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                disabled={isUploading}
                onChange={handleImageUpload}
              />
            </label>
            <button
              onClick={() => setIsEditing((current) => !current)}
              className="relative flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              <User className="h-3.5 w-3.5" /> {isEditing ? "Cancel editing" : "Edit profile"}
            </button>
          </div>
        </div>
        <div className="relative mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:grid-cols-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="bg-white p-3.5 dark:bg-slate-900">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Generated student ID
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
              {display(profile.studentId, "Not assigned yet")}
            </p>
          </div>
          <div className="bg-white p-3.5 dark:bg-slate-900">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Current term</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
              {display(profile.semester, "Not set")}
            </p>
          </div>
          <div className="bg-white p-3.5 dark:bg-slate-900">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Institution</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
              {display(profile.institution)}
            </p>
          </div>
          <div className="bg-white p-3.5 dark:bg-slate-900">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Account role</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Student</p>
          </div>
        </div>
      </section>

      */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm sm:p-6 dark:border-indigo-900/60 dark:bg-indigo-950/20"
        >
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Update your profile
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full name
              <input
                required
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Phone number
              <input
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          </div>
          <label className="mt-4 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Academic bio
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Save className="h-3.5 w-3.5" />
              Save changes
            </button>
          </div>
        </form>
      ) : (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-indigo-600">
              <BookOpen className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Enrolled
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {enrolledCourses.length}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">active courses</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-emerald-600">
              <Award className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GPA
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {profile.currentGpa ? profile.currentGpa.toFixed(2) : "—"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">current academic average</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-cyan-600">
              <GraduationCap className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Progress
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {creditProgress}%
            </p>
            <p className="mt-1 text-[11px] text-slate-500">degree credits complete</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-violet-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Learning
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {averageProgress}%
            </p>
            <p className="mt-1 text-[11px] text-slate-500">average course progress</p>
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Academic progress
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your progress from the current academic record.
              </p>
            </div>
            <GraduationCap className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {profile.creditsCompleted || 0}
                <span className="ml-1 text-base font-medium text-slate-400">credits</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                of {profile.totalCreditsRequired || "—"} required credits
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {creditProgress}% complete
            </span>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
              style={{ width: `${creditProgress}%` }}
            />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Current semester
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                {display(profile.semester, "Not set")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Completed courses
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                {completedCourses} of {enrolledCourses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Contact details</h2>
              <p className="mt-1 text-xs text-slate-500">Information from your student account.</p>
            </div>
            <Mail className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-5 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Email</p>
                <p className="mt-1 break-all font-medium text-slate-800 dark:text-slate-200">
                  {display(profile.email)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Phone number</p>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                  {display(profile.phone)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Institution</p>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                  {display(profile.institution)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Joined</p>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(profile.joinedDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Current learning journey
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your latest enrolled courses and progress.
              </p>
            </div>
            <BookOpen className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
            {latestCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                compact
                title="No enrolled courses"
                description="Your enrolled courses will appear here."
              />
            ) : (
              latestCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {course.code.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                        {course.title}
                      </p>
                      <span className="shrink-0 text-[11px] font-bold text-indigo-600">
                        {course.progressPercentage}%
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {course.code} · {display(course.instructor.name, "Instructor not assigned")}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, course.progressPercentage))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
              {advisorInitials ? advisorInitials : <User className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Academic advisor</h2>
              <p className="mt-1 text-xs text-slate-500">Your assigned faculty contact.</p>
            </div>
          </div>
          {profile.academicAdvisor.name ||
          profile.academicAdvisor.email ||
          profile.academicAdvisor.office ? (
            <div className="mt-5 space-y-2 text-xs">
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {display(profile.academicAdvisor.name)}
              </p>
              <p className="break-all text-slate-500">{display(profile.academicAdvisor.email)}</p>
              <p className="text-slate-500">{display(profile.academicAdvisor.office)}</p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800/70">
              No academic advisor has been assigned to your account yet.
            </div>
          )}
          <div className="mt-6 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              Academic bio
            </p>
            <p className="mt-2 text-xs leading-5 text-indigo-950 dark:text-indigo-100">
              {display(
                profile.bio,
                "Add a short introduction about your academic interests from Edit profile.",
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
