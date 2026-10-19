import React, { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Sun,
  Lock,
  LogOut,
  Check,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import type { TeacherProfile } from "../types";
import {
  getCommunicationSettings,
  updateCommunicationSettings,
  type CommunicationSettings,
} from "../api/settingsApi";

interface TeacherSettingsViewProps {
  teacher: TeacherProfile;
}

export const TeacherSettingsView: React.FC<TeacherSettingsViewProps> = ({ teacher }) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [submissionPushes, setSubmissionPushes] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getCommunicationSettings(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setSettings(data);
        setSubmissionPushes(data.groupNotificationsEnabled);
        setEmailAlerts(data.directNotificationsEnabled);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load communication settings.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const data = await updateCommunicationSettings({
        groupNotificationsEnabled: submissionPushes,
        directNotificationsEnabled: emailAlerts,
      });
      setSettings(data);
      setSubmissionPushes(data.groupNotificationsEnabled);
      setEmailAlerts(data.directNotificationsEnabled);
      setSavedSuccess(true);
      window.setTimeout(() => setSavedSuccess(false), 2000);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save communication settings.",
      );
    } finally {
      setIsSaving(false);
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
          Configure security settings, Keycloak identity attributes, notification routing, and
          interface appearance.
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

      {/* 1. Keycloak Security & Authentication */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-700">
          <Shield className="w-4 h-4" />
          <h2 className="text-sm font-bold text-slate-900">Institutional Identity & Security</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your Mentify faculty account is federated and managed via enterprise Keycloak Single
          Sign-On (SSO).
        </p>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Keycloak Realm:</span>
              <span className="font-mono text-slate-600">mentify-university-faculty</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Subject ID: <span className="font-mono">usr-keycloak-tch-4091-prod</span>
            </div>
          </div>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
            SSO Session Active
          </span>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() =>
              alert("Redirecting to University Keycloak Account Management Console...")
            }
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Manage Keycloak Password & MFA</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-700">
          <Bell className="w-4 h-4" />
          <h2 className="text-sm font-bold text-slate-900">
            Communication & Notification Preferences
          </h2>
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
                Receive browser and notification center pings when students submit code or milestone
                deliverables.
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
              disabled
              className="mt-0.5 text-indigo-600 rounded"
            />
            <div>
              <span className="font-semibold text-slate-800 block">
                Daily Morning Teaching Digest
              </span>
              <span className="text-slate-500">
                Receive a 7:30 AM summary with today's classes, room numbers, and grading deadlines.
              </span>
              <span className="block text-[11px] text-amber-700 mt-0.5">
                Daily digest is not supported by the current backend.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={isLoading || isSaving || !settings}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>

      {/* 3. Session & Logout */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Portal Session</h2>
        <p className="text-xs text-slate-500">
          Sign out of the faculty workspace on this device. You will need to re-authenticate with
          your university credentials.
        </p>

        <button
          onClick={() => alert("Logging out of Mentify Teacher Portal...")}
          className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out of Faculty Workspace</span>
        </button>
      </div>
    </div>
  );
};
