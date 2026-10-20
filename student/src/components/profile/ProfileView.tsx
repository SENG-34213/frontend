import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  ShieldCheck,
  MapPin,
  Calendar,
  Save,
  BookOpen,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, courses, showToast } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    bio: profile.bio,
  });

  const enrolledCourses = courses.filter((c) => c.enrolled);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    void updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Academic Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official university registration, department matriculation, and academic advisor details
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-2xs"
        >
          {isEditing ? "Cancel Editing" : "Edit Profile Details"}
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-md">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {profile.name}
              </h2>
              <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                <span>Account Verified</span>
              </span>
            </div>

            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {profile.degreeProgram} · {profile.department}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span>
                Student ID:{" "}
                <strong className="font-mono text-slate-800 dark:text-slate-200">
                  {profile.studentId}
                </strong>
              </span>
              <span>·</span>
              <span>Institution: {profile.institution}</span>
              <span>·</span>
              <span>Joined: {profile.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Bio / Edit Form */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  Academic Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                Academic Statement & Bio
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Advisor & Degree Standing */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Advisor Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Assigned Faculty Advisor
          </h3>
          <div className="flex items-start gap-3 pt-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold text-xs">
              ER
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                {profile.academicAdvisor.name}
              </p>
              <p className="text-slate-500">{profile.academicAdvisor.email}</p>
              <p className="text-slate-500">{profile.academicAdvisor.office}</p>
            </div>
          </div>
        </div>

        {/* Graduation Standing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Degree Matriculation Status
          </h3>
          <div className="text-xs space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Anticipated Graduation:</span>
              <span className="font-bold text-slate-900 dark:text-white">Not available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cumulative GPA:</span>
              <span className="font-bold font-mono text-emerald-600">
                {profile.currentGpa ? profile.currentGpa.toFixed(2) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Degree Requirements:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {profile.totalCreditsRequired
                  ? `${profile.creditsCompleted} of ${profile.totalCreditsRequired} Credits Completed`
                  : "Not available"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Subjects Ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Active Enrolled Course Ledger
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {enrolledCourses.map((c) => (
            <div key={c.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {c.code}
                </span>
                <span className="ml-2 font-medium text-slate-900 dark:text-white">{c.title}</span>
                <span className="text-slate-400 block text-[11px]">
                  {c.instructor.name} · {c.schedule}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {c.credits} Credits ({c.progressPercentage}% Done)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
