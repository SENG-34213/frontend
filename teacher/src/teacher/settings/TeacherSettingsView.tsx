import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  KeyRound,
  Laptop2,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import type { Course, TeacherProfile } from "../types";
import { changeTeacherPassword, getCurrentTeacher } from "../api/auth";
import { updateCurrentTeacher } from "../api/teacherApi";
import {
  getCommunicationSettings,
  updateCommunicationSettings,
  type CommunicationSettings,
} from "../api/settingsApi";
import {
  archiveCommunicationGroup,
  getCommunicationGroups,
  unarchiveCommunicationGroup,
  updateCommunicationGroup,
  type CommunicationGroup,
} from "../api/communicationApi";
import { getSession } from "../auth/authStorage";

type SettingsTab =
  | "overview"
  | "profile"
  | "notifications"
  | "communication"
  | "security"
  | "appearance"
  | "session";

interface TeacherSettingsViewProps {
  teacher: TeacherProfile;
  courses?: Course[];
  onLogout: () => Promise<void>;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const PREFS_KEY = "mentify_teacher_settings_preferences";
type LocalPreferences = { compactSidebar: boolean };
const defaultPreferences: LocalPreferences = { compactSidebar: false };

function readPreferences(): LocalPreferences {
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

export const TeacherSettingsView: React.FC<TeacherSettingsViewProps> = ({
  teacher,
  courses = [],
  onLogout,
  isDarkMode,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const [currentTeacher, setCurrentTeacher] = useState<Awaited<
    ReturnType<typeof getCurrentTeacher>
  > | null>(null);
  const [preferences, setPreferences] = useState<LocalPreferences>(readPreferences);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [submissionPushes, setSubmissionPushes] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [dailyDigestTime, setDailyDigestTime] = useState("07:30");
  const [communicationSettings, setCommunicationSettings] = useState<CommunicationSettings | null>(
    null,
  );
  const [communicationGroups, setCommunicationGroups] = useState<CommunicationGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCommunicationLoading, setIsCommunicationLoading] = useState(true);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGroupSaving, setIsGroupSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const session = getSession();
  const selectedGroup = communicationGroups.find((group) => group.id === selectedGroupId);

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      getCurrentTeacher(),
      getCommunicationSettings(controller.signal),
      getCommunicationGroups(controller.signal),
    ])
      .then(([teacherResult, settingsResult, groupsResult]) => {
        if (controller.signal.aborted) return;
        if (teacherResult.status === "fulfilled") {
          const data = teacherResult.value;
          setCurrentTeacher(data);
          setSubmissionPushes(data.pushNotifications ?? false);
          setEmailAlerts(data.emailNotifications ?? false);
          setDailyDigest(data.dailyDigestEnabled ?? false);
          setDailyDigestTime(data.dailyDigestTime?.slice(0, 5) ?? "07:30");
        }
        if (settingsResult.status === "fulfilled") setCommunicationSettings(settingsResult.value);
        if (groupsResult.status === "fulfilled") {
          setCommunicationGroups(groupsResult.value);
          setSelectedGroupId(groupsResult.value[0]?.id ?? "");
        }
        const failure = [teacherResult, settingsResult, groupsResult].find(
          (result) => result.status === "rejected",
        );
        if (failure?.status === "rejected")
          setError(
            failure.reason instanceof Error
              ? failure.reason.message
              : "Some settings could not be loaded.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsCommunicationLoading(false);
          setIsGroupLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      setGroupName(selectedGroup.name);
      setGroupDescription(selectedGroup.description ?? "");
    }
  }, [selectedGroup]);

  const displayName = currentTeacher
    ? `${currentTeacher.firstName || ""} ${currentTeacher.lastName || ""}`.trim()
    : teacher.name;
  const teacherCode = currentTeacher?.teacherProfile?.teacherCode || teacher.teacherCode;
  const email = currentTeacher?.email || teacher.email;
  const passwordRules = useMemo(
    () => ({
      length: password.next.length >= 8,
      upper: /[A-Z]/.test(password.next),
      number: /\d/.test(password.next),
    }),
    [password.next],
  );
  const tabs: Array<{
    id: SettingsTab;
    label: string;
    description: string;
    Icon: React.ElementType;
  }> = [
    { id: "overview", label: "Overview", description: "Teaching account summary", Icon: UserRound },
    {
      id: "profile",
      label: "Teaching profile",
      description: "Professional identity",
      Icon: BookOpen,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Teaching alerts and digest",
      Icon: Bell,
    },
    {
      id: "communication",
      label: "Communication",
      description: "Privacy and course groups",
      Icon: MessageSquare,
    },
    {
      id: "security",
      label: "Security",
      description: "Password and account access",
      Icon: LockKeyhole,
    },
    { id: "appearance", label: "Appearance", description: "Theme and workspace", Icon: Palette },
    { id: "session", label: "Current sign-in", description: "Your current sign-in", Icon: Laptop2 },
  ];

  const showNotice = (message: string) => {
    setNotice(message);
    setError("");
    window.setTimeout(() => setNotice(""), 3000);
  };
  const saveNotifications = async () => {
    setIsSaving(true);
    setError("");
    try {
      const saved = await updateCurrentTeacher({
        pushNotifications: submissionPushes,
        emailNotifications: emailAlerts,
        dailyDigestEnabled: dailyDigest,
        dailyDigestTime: dailyDigest ? dailyDigestTime : undefined,
      });
      setCurrentTeacher(saved);
      showNotice("Teaching notification preferences saved.");
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
  const saveCommunication = async () => {
    if (!communicationSettings) return;
    setIsSaving(true);
    setError("");
    try {
      const saved = await updateCommunicationSettings(communicationSettings);
      setCommunicationSettings(saved);
      showNotice("Communication preferences saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save communication preferences.",
      );
    } finally {
      setIsSaving(false);
    }
  };
  const saveGroup = async () => {
    if (!selectedGroup || !groupName.trim()) return;
    setIsGroupSaving(true);
    setError("");
    try {
      const saved = await updateCommunicationGroup(selectedGroup.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        studentMessagingEnabled: selectedGroup.studentMessagingEnabled !== false,
      });
      if (saved)
        setCommunicationGroups((groups) =>
          groups.map((group) => (group.id === saved.id ? saved : group)),
        );
      showNotice("Course communication group saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to save group settings.",
      );
    } finally {
      setIsGroupSaving(false);
    }
  };
  const toggleStudentMessaging = async () => {
    if (!selectedGroup) return;
    setIsGroupSaving(true);
    setError("");
    try {
      const saved = await updateCommunicationGroup(selectedGroup.id, {
        name: selectedGroup.name,
        description: selectedGroup.description,
        studentMessagingEnabled: selectedGroup.studentMessagingEnabled === false,
      });
      if (saved)
        setCommunicationGroups((groups) =>
          groups.map((group) => (group.id === saved.id ? saved : group)),
        );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update student messaging.",
      );
    } finally {
      setIsGroupSaving(false);
    }
  };
  const toggleArchive = async () => {
    if (!selectedGroup) return;
    setIsGroupSaving(true);
    setError("");
    try {
      const saved =
        selectedGroup.status === "ARCHIVED"
          ? await unarchiveCommunicationGroup(selectedGroup.id)
          : await archiveCommunicationGroup(selectedGroup.id);
      if (saved)
        setCommunicationGroups((groups) =>
          groups.map((group) => (group.id === saved.id ? saved : group)),
        );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to update group status.",
      );
    } finally {
      setIsGroupSaving(false);
    }
  };
  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!password.current || !password.next)
      return setError("Enter your current and new password.");
    if (!Object.values(passwordRules).every(Boolean))
      return setError("Use at least 8 characters, one uppercase letter, and one number.");
    if (password.next !== password.confirm)
      return setError("The new password and confirmation do not match.");
    setIsChangingPassword(true);
    try {
      await changeTeacherPassword(password.current, password.next);
      setPassword({ current: "", next: "", confirm: "" });
      showNotice("Password changed successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Password could not be changed.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };
  const saveAppearance = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    showNotice("Workspace preferences saved on this device.");
  };
  const signOut = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign out.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Teacher Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Manage your teaching identity, communication preferences, account security, and workspace
          experience.
        </p>
      </div>
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {notice}
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
              Faculty workspace
            </p>
            <p className="mt-1 text-lg font-bold">Settings centre</p>
            <p className="mt-1 text-[11px] text-indigo-100">
              Your teaching preferences and controls.
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
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Loading teacher settings…
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Teaching account overview
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      A quick view of your faculty identity and account protection.
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
                          <p className="text-xs text-slate-500">{email}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                          TEACHER
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-500">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-semibold">Security status</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                        Your teaching account is protected
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Password change and secure logout are available.
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                        Account protection enabled
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500">Teacher code</span>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {teacherCode || "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500">Assigned courses</span>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {teacher.totalCoursesTaught}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500">Students mentored</span>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {teacher.totalStudentsMentored}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Teaching profile
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Your professional identity shown across courses and communication.
                    </p>
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Assigned courses
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600">
                        {courses.length} course{courses.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {courses.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                        No assigned courses found.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {courses.map((course) => (
                          <div
                            key={course.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                          >
                            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                              {course.code || "Course"}
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                              {course.title}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {course.enrolledCount} enrolled student
                              {course.enrolledCount === 1 ? "" : "s"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-200">
                    Profile editing remains available in the Teacher Profile workspace so this
                    settings page stays focused on account controls and preferences.
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Teaching notifications
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      These preferences are saved to your teacher account.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {(
                      [
                        {
                          title: "Instant submission alerts",
                          text: "Notify you when students submit assignments or milestones.",
                          value: submissionPushes,
                          set: setSubmissionPushes,
                        },
                        {
                          title: "Email notifications",
                          text: `Send important updates to ${email}.`,
                          value: emailAlerts,
                          set: setEmailAlerts,
                        },
                        {
                          title: "Daily teaching digest",
                          text: "Receive a daily summary of classes, students, and grading deadlines.",
                          value: dailyDigest,
                          set: setDailyDigest,
                        },
                      ] as const
                    ).map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">{item.text}</p>
                        </div>
                        <PreferenceToggle
                          checked={item.value}
                          onChange={() => item.set((value) => !value)}
                        />
                      </div>
                    ))}
                  </div>
                  {dailyDigest && (
                    <label className="block max-w-xs text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Digest delivery time
                      <input
                        type="time"
                        value={dailyDigestTime}
                        onChange={(event) => setDailyDigestTime(event.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </label>
                  )}
                  <button
                    onClick={() => void saveNotifications()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving ? "Saving…" : "Save notification preferences"}
                  </button>
                </div>
              )}

              {activeTab === "communication" && (
                <div className="space-y-7">
                  <section className="space-y-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Communication preferences
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Control privacy and notification behavior for conversations.
                      </p>
                    </div>
                    {isCommunicationLoading ? (
                      <p className="text-xs text-slate-500">Loading communication preferences…</p>
                    ) : communicationSettings ? (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(
                            [
                              "readReceiptsEnabled",
                              "lastSeenVisible",
                              "profilePhotoVisible",
                              "groupNotificationsEnabled",
                              "directNotificationsEnabled",
                            ] as const
                          ).map((key) => (
                            <div
                              key={key}
                              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                            >
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {key === "readReceiptsEnabled"
                                  ? "Read receipts"
                                  : key === "lastSeenVisible"
                                    ? "Show last seen"
                                    : key === "profilePhotoVisible"
                                      ? "Show profile photos"
                                      : key === "groupNotificationsEnabled"
                                        ? "Group notifications"
                                        : "Direct notifications"}
                              </span>
                              <PreferenceToggle
                                checked={communicationSettings[key]}
                                onChange={() =>
                                  setCommunicationSettings((current) =>
                                    current ? { ...current, [key]: !current[key] } : current,
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => void saveCommunication()}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {isSaving ? "Saving…" : "Save communication preferences"}
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Communication preferences are unavailable.
                      </p>
                    )}
                  </section>
                  <section className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-indigo-500" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          Course communication groups
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Manage student messaging access and group availability.
                        </p>
                      </div>
                    </div>
                    {isGroupLoading ? (
                      <p className="text-xs text-slate-500">Loading groups…</p>
                    ) : !selectedGroup ? (
                      <p className="rounded-xl border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700">
                        No course communication groups are available.
                      </p>
                    ) : (
                      <>
                        <select
                          value={selectedGroupId}
                          onChange={(event) => setSelectedGroupId(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {communicationGroups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.courseName || group.name}
                            </option>
                          ))}
                        </select>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Group name
                            <input
                              value={groupName}
                              onChange={(event) => setGroupName(event.target.value)}
                              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </label>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Description
                            <input
                              value={groupDescription}
                              onChange={(event) => setGroupDescription(event.target.value)}
                              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              Student messaging
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {selectedGroup.studentMessagingEnabled === false
                                ? "Students cannot start messages in this group."
                                : "Students can message this group."}
                            </p>
                          </div>
                          <PreferenceToggle
                            checked={selectedGroup.studentMessagingEnabled !== false}
                            onChange={() => void toggleStudentMessaging()}
                          />
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => void toggleArchive()}
                            disabled={isGroupSaving}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          >
                            {selectedGroup.status === "ARCHIVED"
                              ? "Unarchive group"
                              : "Archive group"}
                          </button>
                          <button
                            onClick={() => void saveGroup()}
                            disabled={isGroupSaving || !groupName.trim()}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            {isGroupSaving ? "Saving…" : "Save group settings"}
                          </button>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Account security
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Change your faculty account password securely.
                    </p>
                  </div>
                  <form onSubmit={changePassword} className="max-w-xl space-y-4">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Current password
                      <input
                        type="password"
                        value={password.current}
                        onChange={(event) =>
                          setPassword((value) => ({ ...value, current: event.target.value }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      New password
                      <input
                        type="password"
                        value={password.next}
                        onChange={(event) =>
                          setPassword((value) => ({ ...value, next: event.target.value }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                        value={password.confirm}
                        onChange={(event) =>
                          setPassword((value) => ({ ...value, confirm: event.target.value }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      {isChangingPassword ? "Changing password…" : "Change password"}
                    </button>
                  </form>
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    Your password is kept private and secure.
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
                      <p className="mt-1 text-xs text-slate-500">
                        Bright, high-contrast workspace.
                      </p>
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
                      onChange={() =>
                        setPreferences((value) => ({
                          ...value,
                          compactSidebar: !value.compactSidebar,
                        }))
                      }
                    />
                  </div>
                  <button
                    onClick={saveAppearance}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save workspace preferences
                  </button>
                </div>
              )}

              {activeTab === "session" && (
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
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        <Laptop2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          This device
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{email}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800 sm:grid-cols-2">
                      <div>
                        <span className="text-slate-400">Role</span>
                        <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                          Teacher
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Sign-in expires</span>
                        <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatRemaining(session?.expiresAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                    For your security, sign out when using a shared device.
                  </div>
                  <button
                    onClick={() => void signOut()}
                    disabled={isLoggingOut}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:text-rose-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {isLoggingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
