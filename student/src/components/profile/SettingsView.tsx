import React, { useState } from "react";
import { Moon, Sun, Bell, Lock, ShieldCheck, Smartphone, Save, CheckCircle2 } from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, showToast, profile } = useStudent();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [gradeAlerts, setGradeAlerts] = useState(true);
  const [announcementPushes, setAnnouncementPushes] = useState(false);

  const handleSavePreferences = () => {
    showToast("Student account preferences saved successfully.");
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Portal & Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your interface, notifications, and account security
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
          Appearance & Theme
        </h2>
        <p className="text-xs text-slate-500">
          Choose between Light mode or Dark mode for low-light studying.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => {
              if (theme !== "light") toggleTheme();
            }}
            className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-semibold transition-all ${
              theme === "light"
                ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-2xs"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
            }`}
          >
            <Sun className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <span>Light Mode</span>
              <span className="text-[10px] text-slate-400 block font-normal">
                Standard Presentation
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              if (theme !== "dark") toggleTheme();
            }}
            className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-semibold transition-all ${
              theme === "dark"
                ? "border-indigo-500 bg-indigo-950/60 text-indigo-300 shadow-2xs"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
            }`}
          >
            <Moon className="h-5 w-5 text-indigo-400" />
            <div className="text-left">
              <span>Dark Mode</span>
              <span className="text-[10px] text-slate-400 block font-normal">
                Optimal for night study
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
          Notification Preferences
        </h2>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Assignment Deadline Reminders
              </span>
              <span className="text-slate-500 text-[11px]">
                Send alert 48 hours and 6 hours prior to assignment cutoffs
              </span>
            </div>
            <input
              type="checkbox"
              checked={deadlineReminders}
              onChange={(e) => setDeadlineReminders(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 accent-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Published Grade Alerts
              </span>
              <span className="text-slate-500 text-[11px]">
                Notify immediately when professors publish quiz or assignment feedback
              </span>
            </div>
            <input
              type="checkbox"
              checked={gradeAlerts}
              onChange={(e) => setGradeAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 accent-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Course Broadcast Announcements
              </span>
              <span className="text-slate-500 text-[11px]">
                Deliver teacher announcements to connected tuition program email
              </span>
            </div>
            <input
              type="checkbox"
              checked={announcementPushes}
              onChange={(e) => setAnnouncementPushes(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 accent-indigo-600"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSavePreferences}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
          >
            Save Notification Settings
          </button>
        </div>
      </div>

      {/* Account Security */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          <span>Account Security</span>
        </div>

        <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
          Your account is protected
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your sign-in is secure and managed by your institution.
        </p>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>You are signed in securely as {profile.studentId}.</span>
        </div>
      </div>
    </div>
  );
};
