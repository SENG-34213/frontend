import React, { useEffect, useState } from "react";
import { Shield, Bell, LogOut, Check, KeyRound, ExternalLink, MessageSquare } from "lucide-react";
import type { TeacherProfile } from "../types";
import { getCurrentTeacher } from "../api/auth";
import { updateCurrentTeacher } from "../api/teacherApi";
import {
  getCommunicationSettings,
  updateCommunicationSettings,
  type CommunicationSettings,
} from "../api/settingsApi";
import { NoticeModal } from "../components/ActionModal";
import {
  archiveCommunicationGroup,
  getCommunicationGroups,
  unarchiveCommunicationGroup,
  updateCommunicationGroup,
  type CommunicationGroup,
} from "../api/communicationApi";

interface TeacherSettingsViewProps {
  teacher: TeacherProfile;
  onLogout: () => Promise<void>;
}

export const TeacherSettingsView: React.FC<TeacherSettingsViewProps> = ({ teacher, onLogout }) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [submissionPushes, setSubmissionPushes] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [dailyDigestTime, setDailyDigestTime] = useState("07:30");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [communicationSettings, setCommunicationSettings] = useState<CommunicationSettings | null>(
    null,
  );
  const [isCommunicationLoading, setIsCommunicationLoading] = useState(true);
  const [isCommunicationSaving, setIsCommunicationSaving] = useState(false);
  const [communicationSaved, setCommunicationSaved] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [securityNoticeOpen, setSecurityNoticeOpen] = useState(false);
  const [communicationGroups, setCommunicationGroups] = useState<CommunicationGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [isGroupSaving, setIsGroupSaving] = useState(false);

  const selectedGroup = communicationGroups.find((group) => group.id === selectedGroupId);

  useEffect(() => {
    const controller = new AbortController();
    getCurrentTeacher()
      .then((data) => {
        if (controller.signal.aborted) return;
        setSubmissionPushes(data.pushNotifications ?? false);
        setEmailAlerts(data.emailNotifications ?? false);
        setDailyDigest(data.dailyDigestEnabled ?? false);
        setDailyDigestTime(data.dailyDigestTime?.slice(0, 5) ?? "07:30");
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load notification preferences.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getCommunicationGroups(controller.signal)
      .then((groups) => {
        if (controller.signal.aborted) return;
        setCommunicationGroups(groups);
        setSelectedGroupId(groups[0]?.id ?? "");
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load communication groups.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsGroupLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    setGroupName(selectedGroup.name);
    setGroupDescription(selectedGroup.description ?? "");
  }, [selectedGroup]);

  useEffect(() => {
    const controller = new AbortController();
    getCommunicationSettings(controller.signal)
      .then((settings) => {
        if (!controller.signal.aborted && settings) setCommunicationSettings(settings);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load communication preferences.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsCommunicationLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateCurrentTeacher({
        pushNotifications: submissionPushes,
        emailNotifications: emailAlerts,
        dailyDigestEnabled: dailyDigest,
        dailyDigestTime: dailyDigestTime || undefined,
      });
      const refreshedTeacher = await getCurrentTeacher();
      setSubmissionPushes(refreshedTeacher.pushNotifications ?? false);
      setEmailAlerts(refreshedTeacher.emailNotifications ?? false);
      setDailyDigest(refreshedTeacher.dailyDigestEnabled ?? false);
      setDailyDigestTime(refreshedTeacher.dailyDigestTime?.slice(0, 5) ?? "07:30");
      setSavedSuccess(true);
      window.setTimeout(() => setSavedSuccess(false), 2000);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save notification preferences.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCommunicationPreferences = async () => {
    if (!communicationSettings) return;
    setIsCommunicationSaving(true);
    setError(null);
    try {
      const saved = await updateCommunicationSettings({
        readReceiptsEnabled: communicationSettings.readReceiptsEnabled,
        lastSeenVisible: communicationSettings.lastSeenVisible,
        profilePhotoVisible: communicationSettings.profilePhotoVisible,
        groupNotificationsEnabled: communicationSettings.groupNotificationsEnabled,
        directNotificationsEnabled: communicationSettings.directNotificationsEnabled,
      });
      if (saved) setCommunicationSettings(saved);
      setCommunicationSaved(true);
      window.setTimeout(() => setCommunicationSaved(false), 2000);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save communication preferences.",
      );
    } finally {
      setIsCommunicationSaving(false);
    }
  };

  const handleSaveGroupSettings = async () => {
    if (!selectedGroup || !groupName.trim()) return;
    setIsGroupSaving(true);
    setError(null);
    try {
      const saved = await updateCommunicationGroup(selectedGroup.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        studentMessagingEnabled: selectedGroup.studentMessagingEnabled !== false,
      });
      if (saved) setCommunicationGroups((groups) => groups.map((group) => group.id === saved.id ? saved : group));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save group settings.");
    } finally {
      setIsGroupSaving(false);
    }
  };

  const handleToggleStudentMessaging = async () => {
    if (!selectedGroup) return;
    setIsGroupSaving(true);
    setError(null);
    try {
      const saved = await updateCommunicationGroup(selectedGroup.id, {
        name: selectedGroup.name,
        description: selectedGroup.description,
        studentMessagingEnabled: selectedGroup.studentMessagingEnabled === false,
      });
      if (saved) setCommunicationGroups((groups) => groups.map((group) => group.id === saved.id ? saved : group));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update student access.");
    } finally {
      setIsGroupSaving(false);
    }
  };

  const handleToggleGroupArchive = async () => {
    if (!selectedGroup) return;
    setIsGroupSaving(true);
    setError(null);
    try {
      const saved = selectedGroup.status === "ARCHIVED"
        ? await unarchiveCommunicationGroup(selectedGroup.id)
        : await archiveCommunicationGroup(selectedGroup.id);
      if (saved) setCommunicationGroups((groups) => groups.map((group) => group.id === saved.id ? saved : group));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update group status.");
    } finally {
      setIsGroupSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      await onLogout();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign out.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Account Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure your account, notification preferences, and interface appearance.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 1. Account Security */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-700">
          <Shield className="w-4 h-4" />
          <h2 className="text-sm font-bold text-slate-900">Account Security</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your faculty account is protected with secure sign-in and account recovery controls.
        </p>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Account access:</span>
              <span className="text-slate-600">Protected</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Your account is active and secure.
            </div>
          </div>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
            Account Active
          </span>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => setSecurityNoticeOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Manage Password & Security</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-700">
          <Bell className="w-4 h-4" />
          <h2 className="text-sm font-bold text-slate-900">User Notification Preferences</h2>
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={submissionPushes}
              onChange={(e) => setSubmissionPushes(e.target.checked)}
              className="mt-0.5 text-indigo-600 rounded"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Instant Submission Alerts</span>
              <span className="text-slate-500">
                Receive browser and notification center push alerts when students submit code or
                milestone deliverables.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="mt-0.5 text-indigo-600 rounded"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Email Notifications</span>
              <span className="text-slate-500">
                Forward important student messages and department broadcasts to {teacher.email}.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              className="mt-0.5 text-indigo-600 rounded"
            />
            <div>
              <span className="font-semibold text-slate-800 block">
                Daily Morning Teaching Digest
              </span>
              <span className="text-slate-500">
                Receive a 7:30 AM summary with today's classes, room numbers, and grading deadlines.
              </span>
              {dailyDigest && (
                <input
                  type="time"
                  value={dailyDigestTime}
                  onChange={(e) => setDailyDigestTime(e.target.value)}
                  className="mt-2 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              )}
            </div>
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={isLoading || isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>

      {/* 3. Communication Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Communication Preferences</h2>
            <p className="mt-1 text-xs text-slate-500">
              Control privacy and notification behavior for teacher conversations.
            </p>
          </div>
          {communicationSaved && (
            <span className="text-xs font-semibold text-emerald-700">Saved</span>
          )}
        </div>
        {communicationSettings ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["readReceiptsEnabled", "Read receipts"],
                ["lastSeenVisible", "Show last seen"],
                ["profilePhotoVisible", "Show profile photos"],
                ["groupNotificationsEnabled", "Group notifications"],
                ["directNotificationsEnabled", "Direct notifications"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={communicationSettings[key]}
                  onChange={(event) =>
                    setCommunicationSettings((current) =>
                      current ? { ...current, [key]: event.target.checked } : current,
                    )
                  }
                  className="rounded text-indigo-600"
                />
                {label}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            {isCommunicationLoading
              ? "Loading communication preferences..."
              : "Communication preferences are unavailable."}
          </p>
        )}
        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            onClick={handleSaveCommunicationPreferences}
            disabled={isCommunicationLoading || isCommunicationSaving || !communicationSettings}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {isCommunicationSaving ? "Saving..." : "Save Communication Settings"}
          </button>
        </div>
      </div>

      {/* 4. Group Communication Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-700">
          <MessageSquare className="w-4 h-4" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Course Communication Management</h2>
            <p className="mt-1 text-xs text-slate-500">
              Update group details, control student messaging, and manage group availability.
            </p>
          </div>
        </div>

        {isGroupLoading ? (
          <p className="text-xs text-slate-500">Loading communication groups...</p>
        ) : !communicationGroups.length ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500">
            No course communication groups are available.
          </p>
        ) : selectedGroup ? (
          <>
            <select
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              {communicationGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.courseName || group.name}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">
                Group name
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  maxLength={150}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Description
                <input
                  value={groupDescription}
                  onChange={(event) => setGroupDescription(event.target.value)}
                  maxLength={2000}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div>
                <p className="text-xs font-semibold text-slate-800">Student messaging</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {selectedGroup.studentMessagingEnabled === false
                    ? "Students cannot send messages in this group."
                    : "Students can send messages in this group."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleToggleStudentMessaging()}
                disabled={isGroupSaving}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold disabled:opacity-50 ${selectedGroup.studentMessagingEnabled === false ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
              >
                {selectedGroup.studentMessagingEnabled === false ? "Allow students" : "Pause students"}
              </button>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => void handleToggleGroupArchive()}
                disabled={isGroupSaving}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                {selectedGroup.status === "ARCHIVED" ? "Unarchive group" : "Archive group"}
              </button>
              <button
                type="button"
                onClick={() => void handleSaveGroupSettings()}
                disabled={isGroupSaving || !groupName.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isGroupSaving ? "Saving..." : "Save group settings"}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* 5. Sign Out */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Sign Out</h2>
        <p className="text-xs text-slate-500">Sign out of the faculty workspace on this device.</p>

        <button
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isLoggingOut ? "Signing Out..." : "Sign Out of Faculty Workspace"}</span>
        </button>
      </div>
      <NoticeModal
        isOpen={securityNoticeOpen}
        title="Account security"
        message="Password and security management is handled by the account service and is not available in this workspace yet."
        onClose={() => setSecurityNoticeOpen(false)}
      />
    </div>
  );
};
