import React, { useState } from "react";
import { BookOpen, ImagePlus, Pencil, Save, ShieldCheck } from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { uploadProfileImage } from "../../api/student";

const display = (value?: string | number | null, fallback = "Not provided") =>
  value !== undefined && value !== null && String(value).trim() ? String(value) : fallback;

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, courses, showToast } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone,
    bio: profile.bio,
  });

  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";
  const currentGrade = display(profile.grade, "Not available");
  const enrolledCourses = courses.filter((course) => course.enrolled);

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
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">Student</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Student Profile
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Personal details, student identification, and enrolled courses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Pencil className="h-3.5 w-3.5" />
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-950/20">
            {profile.avatar ? (
              <img src={profile.avatar} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {display(profile.name, "Student")}
          </h2>
          <p className="mt-1 break-all text-sm text-slate-400">{display(profile.email)}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              Student
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {profile.emailVerified === false ? "Unverified" : "Active"}
            </span>
          </div>
          <div className="mt-6 flex w-full flex-col gap-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <ImagePlus className="h-3.5 w-3.5" />
              {isUploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" disabled={isUploading} onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Student Profile & Contact Information</h2>
            <p className="mt-1 text-sm text-slate-500">Your registered student information.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Student ID", display(profile.studentId, "Not assigned")],
              ["Current grade", currentGrade],
              ["Email", display(profile.email)],
              ["Phone number", display(profile.phone)],
              ["Program", display(profile.degreeProgram)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isEditing && (
        <form onSubmit={handleSave} className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit profile details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Full name
              <input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Phone number
              <input value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Bio
            <textarea rows={4} value={formData.bio} onChange={(event) => setFormData({ ...formData, bio: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
              <Save className="h-3.5 w-3.5" /> Save changes
            </button>
          </div>
        </form>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Course information</h2>
            <p className="mt-1 text-sm text-slate-500">Your enrolled courses and current learning progress.</p>
          </div>
          <BookOpen className="h-5 w-5 text-indigo-500" />
        </div>
        {enrolledCourses.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No enrolled courses found.</p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {course.code || "Course"}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                  </div>
                  {course.currentGrade && (
                    <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Grade: {course.currentGrade}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {course.instructor.name || "Instructor not assigned"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, course.progressPercentage))}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-slate-500">
                    {course.progressPercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
