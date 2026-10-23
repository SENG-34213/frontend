import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  KeyRound,
  Laptop2,
  LockKeyhole,
  LogOut,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RoleBadge } from "../components/RoleBadge";
import { StatusBadge } from "../components/StatusBadge";
import { AdminRole } from "../types";
import { changeAdminPassword } from "../api/authApi";
import { getCurrentAdminProfile, type CurrentAdminProfile } from "../api/profileApi";
import { getSession } from "../auth/authStorage";

type SettingsTab = "overview" | "appearance" | "notifications" | "security" | "sessions";

interface AdminSettingsProps {
  role: AdminRole;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const PREFS_KEY = "mentify_admin_settings_preferences";

type Preferences = {
  emailAlerts: boolean;
  securityAlerts: boolean;
  assessmentAlerts: boolean;
  compactSidebar: boolean;
};

const defaultPreferences: Preferences = {
  emailAlerts: true,
  securityAlerts: true,
  assessmentAlerts: true,
  compactSidebar: false,
};

function readPreferences(): Preferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    return { ...defaultPreferences, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch {
    return defaultPreferences;
  }
}

function formatRemaining(expiresAt?: number) {
  if (!expiresAt) return "Unknown";
  const remaining = Math.max(0, expiresAt - Date.now());
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
}

const PreferenceToggle: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <button
    type="button"
    aria-pressed={checked}
    onClick={onChange}
    className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
  >
    <span
      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "left-6" : "left-1"}`}
    />
  </button>
);

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  role,
  isDarkMode,
  onToggleTheme,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const [profile, setProfile] = useState<CurrentAdminProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);
  const [savedNotice, setSavedNotice] = useState("");
  const [error, setError] = useState("");
  const [passwordState, setPasswordState] = useState({ current: "", next: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const session = getSession();

  useEffect(() => {
    let active = true;
    void getCurrentAdminProfile()
      .then((loaded) => {
        if (active) setProfile(loaded);
      })
      .catch(() => {
        // The overview still has the authenticated session fallback.
      });
    return () => {
      active = false;
    };
  }, []);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : session?.user.email || "Administrator";
  const sessionStatus = session && session.expiresAt > Date.now() ? "ACTIVE" : "EXPIRED";
  const tabs: Array<{
    id: SettingsTab;
    label: string;
    description: string;
    Icon: React.ElementType;
  }> = [
    {
      id: "overview",
      label: "Overview",
      description: "Account and security summary",
      Icon: UserRound,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Theme and workspace preferences",
      Icon: Palette,
    },
    { id: "notifications", label: "Notifications", description: "Choose your alerts", Icon: Bell },
    {
      id: "security",
      label: "Security",
      description: "Password and account protection",
      Icon: LockKeyhole,
    },
    {
      id: "sessions",
      label: "Current sign-in",
      description: "Your current sign-in",
      Icon: Laptop2,
    },
  ];

  const showSaved = (message: string) => {
    setSavedNotice(message);
    setError("");
    window.setTimeout(() => setSavedNotice(""), 3000);
  };

  const savePreferences = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    showSaved("Your preferences were saved successfully.");
  };

  const updatePreference = (key: keyof Preferences) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  const passwordRules = useMemo(
    () => ({
      length: passwordState.next.length >= 8,
      upper: /[A-Z]/.test(passwordState.next),
      number: /\d/.test(passwordState.next),
    }),
    [passwordState.next],
  );

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!passwordState.current || !passwordState.next)
      return setError("Enter your current and new password.");
    if (!Object.values(passwordRules).every(Boolean))
      return setError("Use at least 8 characters, one uppercase letter, and one number.");
    if (passwordState.next !== passwordState.confirm)
      return setError("The new password and confirmation do not match.");
    setIsChangingPassword(true);
    try {
      await changeAdminPassword(passwordState.current, passwordState.next);
      setPasswordState({ current: "", next: "", confirm: "" });
      showSaved("Password changed successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Password could not be changed.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        description="Manage your workspace experience, account security, and notification preferences from one place."
        breadcrumbs={[{ label: "Admin" }, { label: "Settings" }]}
      />

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {savedNotice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-100">
              Workspace settings
            </p>
            <p className="mt-1 text-lg font-bold">Control centre</p>
            <p className="mt-1 text-[11px] text-indigo-100">
              Personal settings are applied to this admin workspace.
            </p>
          </div>
          <nav className="space-y-1">
            {tabs.map(({ id, label, description, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeTab === id ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold">{label}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                    {description}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Account overview
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  A quick view of your current administrative account.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {profile?.email || session?.user.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <RoleBadge role={profile?.role || role} />
                    <StatusBadge
                      status={profile?.accountStatus === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold">Security status</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    Your account is protected
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Your account is ready to use.</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                    Account security is enabled
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Quick actions</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <button
                    onClick={() => setActiveTab("security")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <KeyRound className="mb-1 h-4 w-4 text-indigo-500" />
                    Change password
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <Bell className="mb-1 h-4 w-4 text-indigo-500" />
                    Alert preferences
                  </button>
                  <button
                    onClick={() => setActiveTab("sessions")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <Laptop2 className="mb-1 h-4 w-4 text-indigo-500" />
                    Review session
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Appearance & workspace
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Choose how your workspace looks and behaves.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => isDarkMode && onToggleTheme()}
                  className={`rounded-xl border p-5 text-left ${!isDarkMode ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/10 dark:bg-indigo-950/30" : "border-slate-200 dark:border-slate-800"}`}
                >
                  <Sun className="h-5 w-5 text-amber-500" />
                  <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                    Light theme
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Bright, high-contrast workspace.</p>
                </button>
                <button
                  onClick={() => !isDarkMode && onToggleTheme()}
                  className={`rounded-xl border p-5 text-left ${isDarkMode ? "border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/10" : "border-slate-200 dark:border-slate-800"}`}
                >
                  <Moon className="h-5 w-5 text-indigo-400" />
                  <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                    Dark theme
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Reduced-glare slate workspace.</p>
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Compact sidebar preference
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Keep your workspace comfortable and focused.
                  </p>
                </div>
                <PreferenceToggle
                  checked={preferences.compactSidebar}
                  onChange={() => updatePreference("compactSidebar")}
                />
              </div>
              <button
                onClick={savePreferences}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Save className="h-3.5 w-3.5" />
                Save workspace preferences
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Notification preferences
                </h2>
                <p className="mt-1 text-xs text-slate-500">Choose which updates you want to see.</p>
              </div>
              <div className="space-y-3">
                {(
                  [
                    {
                      key: "emailAlerts",
                      title: "Registration and invitation alerts",
                      text: "Show updates when users complete account setup.",
                    },
                    {
                      key: "securityAlerts",
                      title: "Security and login alerts",
                      text: "Highlight sign-in and account security updates.",
                    },
                    {
                      key: "assessmentAlerts",
                      title: "Assessment reminders",
                      text: "Show assignment, quiz, and examination reminders.",
                    },
                  ] as Array<{ key: keyof Preferences; title: string; text: string }>
                ).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">{item.text}</p>
                    </div>
                    <PreferenceToggle
                      checked={preferences[item.key]}
                      onChange={() => updatePreference(item.key)}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={savePreferences}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Save className="h-3.5 w-3.5" />
                Save notification preferences
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Account security
                </h2>
                <p className="mt-1 text-xs text-slate-500">Change your password securely.</p>
              </div>
              <form onSubmit={handlePasswordChange} className="max-w-xl space-y-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current password
                  <input
                    type="password"
                    value={passwordState.current}
                    onChange={(event) =>
                      setPasswordState((state) => ({ ...state, current: event.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New password
                  <input
                    type="password"
                    value={passwordState.next}
                    onChange={(event) =>
                      setPasswordState((state) => ({ ...state, next: event.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <div className="grid gap-2 text-[11px] sm:grid-cols-3">
                  {Object.entries({
                    length: [passwordRules.length, "8+ characters"],
                    upper: [passwordRules.upper, "Uppercase letter"],
                    number: [passwordRules.number, "Number"],
                  }).map(([key, [valid, label]]) => (
                    <span key={key} className={valid ? "text-emerald-600" : "text-slate-400"}>
                      {valid ? "✓" : "○"} {label}
                    </span>
                  ))}
                </div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm new password
                  <input
                    type="password"
                    value={passwordState.confirm}
                    onChange={(event) =>
                      setPasswordState((state) => ({ ...state, confirm: event.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  {isChangingPassword ? "Changing password…" : "Change password"}
                </button>
              </form>
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Your password is kept private and secure. Advanced account protection is managed
                  by your organization.
                </span>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Current sign-in
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Details for your current sign-in on this device.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Laptop2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        This device
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Signed in to the admin workspace
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={sessionStatus} />
                </div>
                <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-400">Signed in as</span>
                    <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                      {session?.user.email || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Sign-in expires</span>
                    <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                      {formatRemaining(session?.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                For your security, sign out when using a shared device.
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
