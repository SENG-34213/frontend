import React, { useEffect, useState } from "react";
import { BookOpen, Check, ImagePlus, Save } from "lucide-react";
import {
  updateCurrentTeacher,
  updateTeacherProfile,
  uploadTeacherProfileImage,
} from "../api/teacherApi";
import type { TeacherUserSummary } from "../auth/authTypes";
import { Course, NavigationTab, TeacherProfile } from "../types";
import { TeacherAvatar } from "../components/TeacherAvatar";

interface TeacherProfileViewProps {
  teacher: TeacherProfile;
  courses: Course[];
  onNavigate: (tab: NavigationTab) => void;
}

export const TeacherProfileView: React.FC<TeacherProfileViewProps> = ({
  teacher,
  courses,
  onNavigate,
}) => {
  const [profile, setProfile] = useState(teacher);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(teacher.name);
  const [phone, setPhone] = useState(teacher.phone);
  const [bio, setBio] = useState(teacher.bio);
  const [specializations, setSpecializations] = useState(teacher.specializations.join(", "));
  const [avatarUrl, setAvatarUrl] = useState(teacher.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setProfile(teacher);
    setName(teacher.name);
    setPhone(teacher.phone);
    setBio(teacher.bio);
    setSpecializations(teacher.specializations.join(", "));
    setAvatarUrl(teacher.avatarUrl);
  }, [teacher]);

  const resetForm = () => {
    setName(profile.name);
    setPhone(profile.phone);
    setBio(profile.bio);
    setSpecializations(profile.specializations.join(", "));
    setAvatarUrl(profile.avatarUrl);
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    const parsedSpecializations = specializations
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!nameParts.length) {
      setSaveError("Full name is required.");
      return;
    }
    if (!parsedSpecializations.length) {
      setSaveError("Add at least one teaching specialty.");
      return;
    }

    setIsSaving(true);
    try {
      const [updatedUser, updatedTeacher] = await Promise.all([
        updateCurrentTeacher({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" ") || undefined,
          phoneNumber: phone.trim() || undefined,
        }),
        updateTeacherProfile({
          specializations: parsedSpecializations,
          phoneNumber: phone.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        }),
      ]);

      const mergedUser: TeacherUserSummary = {
        ...updatedUser,
        phoneNumber: updatedTeacher.phoneNumber ?? updatedUser.phoneNumber,
        teacherProfile: updatedTeacher.teacherProfile ?? updatedUser.teacherProfile,
      };
      const updatedName = [mergedUser.firstName, mergedUser.lastName]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ");
      setProfile((current) => ({
        ...current,
        name: updatedName || current.name,
        phone: mergedUser.phoneNumber ?? current.phone,
        specializations: mergedUser.teacherProfile?.specializations ?? current.specializations,
        bio: mergedUser.teacherProfile?.bio ?? current.bio,
        avatarUrl: mergedUser.teacherProfile?.avatarUrl ?? current.avatarUrl,
      }));
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Profile could not be updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveError("Please choose a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Profile images must be smaller than 5 MB.");
      return;
    }

    setIsUploading(true);
    setSaveError(null);
    try {
      const response = await uploadTeacherProfileImage(file);
      const storageKey = response.data?.storageKey;
      if (!storageKey) throw new Error("The profile image reference was not returned.");
      const updated = await updateTeacherProfile({ avatarUrl: storageKey });
      const nextAvatarUrl = updated.teacherProfile?.avatarUrl ?? storageKey;
      setProfile((current) => ({ ...current, avatarUrl: nextAvatarUrl }));
      setAvatarUrl(nextAvatarUrl);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Profile image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Teacher
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Teacher Profile
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Personal credentials, contact information, and assigned courses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSaveError(null);
            setSaveSuccess(false);
            setIsEditing((current) => !current);
          }}
          className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Check className="h-4 w-4 text-emerald-600" />
          Profile details successfully saved.
        </div>
      )}
      {saveError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <TeacherAvatar
            name={profile.name}
            avatarUrl={profile.avatarUrl}
            className="h-24 w-24"
            initialsClassName="text-2xl"
          />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="mt-1 break-all text-xs text-slate-400">{profile.email || "—"}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                Teacher
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Active
              </span>
            </div>
          </div>
          <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-left text-xs dark:border-slate-800">
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Teacher Code:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {profile.teacherCode || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Department:</span>
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                {profile.department || "Not recorded"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Courses:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {courses.length}
              </span>
            </div>
          </div>
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <ImagePlus className="h-3.5 w-3.5" />
            {isUploading ? "Uploading..." : "Upload profile image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              disabled={isUploading}
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="border-b border-slate-100 pb-4 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
            Teacher Profile & Contact Information
          </h2>
          {isEditing ? (
            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Phone Number
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
              </div>
              <label className="block font-medium text-slate-700 dark:text-slate-300">
                Faculty Bio
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="block font-medium text-slate-700 dark:text-slate-300">
                Research & Teaching Specialties
                <input
                  value={specializations}
                  onChange={(event) => setSpecializations(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save Contact Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              {[
                ["Email", profile.email || "—"],
                ["Phone Number", profile.phone || "Not recorded"],
                ["Title", profile.title || "Not recorded"],
                ["Department", profile.department || "Not recorded"],
                ["Office Location", profile.officeLocation || "Not recorded"],
                ["Office Hours", profile.officeHours || "Not recorded"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-1 break-all font-medium text-slate-800 dark:text-slate-200">
                    {value}
                  </p>
                </div>
              ))}
              <div className="rounded-xl bg-indigo-50 p-4 sm:col-span-2 dark:bg-indigo-950/30">
                <p className="text-[10px] uppercase tracking-wider text-indigo-500">Faculty Bio</p>
                <p className="mt-1 leading-5 text-slate-700 dark:text-slate-200">
                  {profile.bio || "Not recorded"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Courses</h2>
            <p className="mt-1 text-xs text-slate-500">
              Courses currently assigned to your teaching account.
            </p>
          </div>
          <BookOpen className="h-5 w-5 text-indigo-500" />
        </div>
        {courses.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">No assigned courses found.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => onNavigate("courses")}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-indigo-600"
              >
                <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {course.code}
                </span>
                <p className="mt-1 truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {course.title}
                </p>
                <span className="mt-1 block text-[11px] text-slate-500">
                  {course.enrolledCount} enrolled students
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
