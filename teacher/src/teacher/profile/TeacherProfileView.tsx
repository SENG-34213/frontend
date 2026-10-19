import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Clock, Edit3, Save, Building, Check } from "lucide-react";
import { updateCurrentTeacher, updateTeacherProfile } from "../api/teacherApi";
import type { TeacherUserSummary } from "../auth/authTypes";
import { Course, TeacherProfile, NavigationTab } from "../types";

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
  const [profile, setProfile] = useState<TeacherProfile>(teacher);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [specializations, setSpecializations] = useState(profile.specializations.join(", "));
  const [title, setTitle] = useState(profile.title);
  const [department, setDepartment] = useState(profile.department);
  const [officeLocation, setOfficeLocation] = useState(profile.officeLocation);
  const [officeHours, setOfficeHours] = useState(profile.officeHours);
  const [bio, setBio] = useState(profile.bio);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfile(teacher);
    setName(teacher.name);
    setPhone(teacher.phone);
    setSpecializations(teacher.specializations.join(", "));
    setTitle(teacher.title);
    setDepartment(teacher.department);
    setOfficeLocation(teacher.officeLocation);
    setOfficeHours(teacher.officeHours);
    setBio(teacher.bio);
  }, [teacher]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    if (!nameParts.length) {
      setSaveError("Full name is required.");
      return;
    }

    const normalizedPhone = phone.trim();
    const parsedSpecializations = specializations
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const [updatedUser, updatedTeacherProfile] = await Promise.all([
        updateCurrentTeacher({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" ") || undefined,
          phoneNumber: normalizedPhone || undefined,
        }),
        updateTeacherProfile({
          specializations: parsedSpecializations,
          phoneNumber: normalizedPhone || undefined,
          title: title.trim() || undefined,
          department: department.trim() || undefined,
          officeLocation: officeLocation.trim() || undefined,
          officeHours: officeHours.trim() || undefined,
          bio: bio.trim() || undefined,
        }),
      ]);

      const mergedUser: TeacherUserSummary = {
        ...updatedUser,
        phoneNumber: updatedTeacherProfile.phoneNumber ?? updatedUser.phoneNumber,
        teacherProfile: updatedTeacherProfile.teacherProfile ?? updatedUser.teacherProfile,
      };
      const updatedName = [mergedUser.firstName, mergedUser.lastName]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ");
      setProfile((current) => ({
        ...current,
        name: updatedName || current.name,
        phone: mergedUser.phoneNumber ?? current.phone,
        teacherCode: mergedUser.teacherProfile?.teacherCode ?? current.teacherCode,
        specializations: mergedUser.teacherProfile?.specializations ?? current.specializations,
        title: mergedUser.teacherProfile?.title ?? current.title,
        department: mergedUser.teacherProfile?.department ?? current.department,
        officeLocation: mergedUser.teacherProfile?.officeLocation ?? current.officeLocation,
        officeHours: mergedUser.teacherProfile?.officeHours ?? current.officeHours,
        bio: mergedUser.teacherProfile?.bio ?? current.bio,
      }));
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Profile could not be updated.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Faculty Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Institutional credentials, office hour scheduling, and academic departmental
            affiliations.
          </p>
        </div>

        <button
          onClick={() => {
            setSaveError(null);
            setSaveSuccess(false);
            setIsEditing(!isEditing);
          }}
          className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
        </button>
      </div>

      {saveError && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          Profile details updated successfully.
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative p-6 flex items-end">
          <span className="text-xs font-mono text-indigo-300 font-semibold bg-white/10 px-2.5 py-0.5 rounded backdrop-blur-xs">
            {profile.teacherCode}
          </span>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center ring-4 ring-white shadow-md">
                {profile.name
                  .split(" ")
                  .map((part) => part[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="mb-1">
                <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
                <p className="text-xs text-slate-500">{profile.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Active Faculty Member
              </span>
            </div>
          </div>

          {/* Edit Form or Display */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name & Honors
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Office Hours Availability
                  </label>
                  <input
                    type="text"
                    value={officeHours}
                    onChange={(e) => setOfficeHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Research & Teaching Specialties
                </label>
                <input
                  type="text"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="Separate specialties with commas"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setName(profile.name);
                    setPhone(profile.phone);
                    setSpecializations(profile.specializations.join(", "));
                    setTitle(profile.title);
                    setDepartment(profile.department);
                    setOfficeLocation(profile.officeLocation);
                    setOfficeHours(profile.officeHours);
                    setBio(profile.bio);
                    setIsEditing(false);
                    setSaveError(null);
                  }}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Bio & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                <div className="space-y-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Contact & Office Information
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>{profile.department}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{profile.officeLocation}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-800">{profile.officeHours}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Academic Background & Pedagogy
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{profile.bio}</p>

                  <div className="pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Research & Teaching Specialties
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.specializations.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Teaching Portfolio Summary */}
              <div className="pt-6 border-t border-slate-100">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                  Current Term Teaching Assignments ({courses.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {courses.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onNavigate("courses")}
                      className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer bg-slate-50/50"
                    >
                      <span className="font-mono text-xs font-bold text-indigo-700">{c.code}</span>
                      <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                        {c.title}
                      </p>
                      <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                        {c.enrolledCount} enrolled students
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
