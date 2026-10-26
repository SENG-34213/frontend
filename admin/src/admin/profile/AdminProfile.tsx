import React, { useEffect, useState } from "react";
import { CheckCircle2, ImagePlus } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RoleBadge } from "../components/RoleBadge";
import { StatusBadge } from "../components/StatusBadge";
import { UserAvatar } from "../components/UserAvatar";
import { AdminRole } from "../types";
import {
  getCurrentAdminProfile,
  uploadAdminProfileImage,
  updateCurrentAdminProfile,
  type CurrentAdminProfile,
} from "../api/profileApi";

interface AdminProfileProps {
  role: AdminRole;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ role }) => {
  const [profile, setProfile] = useState<CurrentAdminProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let active = true;
    void getCurrentAdminProfile()
      .then((loadedProfile) => {
        if (!active) return;
        setProfile(loadedProfile);
        setFirstName(loadedProfile.firstName);
        setLastName(loadedProfile.lastName);
        setPhone(loadedProfile.phoneNumber || "");
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error ? requestError.message : "Unable to load profile.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setIsSaved(false);
    try {
      const updatedProfile = await updateCurrentAdminProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim() || undefined,
      });
      setProfile(updatedProfile);
      setFirstName(updatedProfile.firstName);
      setLastName(updatedProfile.lastName);
      setPhone(updatedProfile.phoneNumber || "");
      setIsSaved(true);
      window.setTimeout(() => setIsSaved(false), 3000);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile images must be smaller than 5 MB.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadAdminProfileImage(file);
      const storageKey = response.data?.storageKey;
      if (!storageKey) throw new Error("The profile image reference was not returned.");
      const updatedProfile = await updateCurrentAdminProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim() || undefined,
        avatarUrl: storageKey,
      });
      setProfile(updatedProfile);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Profile image upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Admin profile";
  const address = profile?.address
    ? [
        profile.address.addressLine1,
        profile.address.addressLine2,
        profile.address.city,
        profile.address.district,
        profile.address.postalCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "Not recorded";
  const profileRole = profile?.role || role;
  const status = profile?.accountStatus === "ACTIVE" ? "ACTIVE" : "INACTIVE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Profile"
        description="Personal credentials, contact preferences, institutional role tier, and security attributes."
        breadcrumbs={[{ label: "Admin" }, { label: "My Profile" }]}
      />

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile contact preferences saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
          Loading your profile...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Profile Card */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
            <UserAvatar name={fullName} avatarUrl={profile?.avatarUrl} size="xl" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{fullName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{profile?.email || "—"}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <RoleBadge role={profileRole} />
                <StatusBadge status={status} />
              </div>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Admin Code:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {profile?.adminProfile?.adminCode || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Administration
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account access:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">mentify</span>
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

          {/* Right Details & Edit Form */}
          <div className="md:col-span-2 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Administrative Profile & Contact Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Institutional Email (SSO Linked)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Emergency Phone Contact
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    National Identity Identifier (NIC)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.adminProfile?.nic || "Not recorded"}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Campus Office / Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || !profile}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {isSaving ? "Saving..." : "Save Contact Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
