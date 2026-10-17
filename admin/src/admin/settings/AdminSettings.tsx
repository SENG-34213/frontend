import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Sun,
  Moon,
  Bell,
  Lock,
  Smartphone,
  LogOut,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { AdminRole } from '../types';

interface AdminSettingsProps {
  role: AdminRole;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  role,
  isDarkMode,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'security' | 'sessions'>('appearance');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [examReminders, setExamReminders] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform & Account Settings"
        description="Keycloak SSO federation attributes, appearance themes, dispatch preferences, and session revocations."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 space-y-1">
          {[
            { id: 'appearance', label: 'Appearance & Theme', icon: Sun },
            { id: 'notifications', label: 'Notification Preferences', icon: Bell },
            { id: 'security', label: 'Security & Keycloak SSO', icon: Lock },
            { id: 'sessions', label: 'Active Sessions', icon: Smartphone },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Tab Content */}
        <div className="md:col-span-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6 text-xs">
          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
                <p className="text-slate-400 mt-0.5">Customize your visual interface preference</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isDarkMode) onToggleTheme();
                  }}
                  className={`p-4 rounded-xl border text-left flex flex-col items-start gap-2 transition-colors ${
                    !isDarkMode
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="font-bold block">Light Theme</span>
                    <span className="text-[11px] text-slate-500">Soft off-white canvas</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isDarkMode) onToggleTheme();
                  }}
                  className={`p-4 rounded-xl border text-left flex flex-col items-start gap-2 transition-colors ${
                    isDarkMode
                      ? 'border-indigo-500 bg-indigo-950/40 text-white ring-2 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="font-bold block">Dark Slate Theme</span>
                    <span className="text-[11px] text-slate-400">Deep neutral canvas</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notification Preferences
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Select which platform alerts trigger system notifications
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      Registration & Invitation Alerts
                    </span>
                    <span className="text-slate-400">
                      Notify me when students or teachers complete Keycloak password setup
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      Security & SSO Realm Logs
                    </span>
                    <span className="text-slate-400">
                      Alert on failed login bursts or token signing rotations
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityAlerts}
                    onChange={(e) => setSecurityAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      Examination & Assessment Reminders
                    </span>
                    <span className="text-slate-400">
                      Notify 24 hours prior to scheduled examination hall allocations
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={examReminders}
                    onChange={(e) => setExamReminders(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Security & Keycloak SSO Realm
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Institutional authentication governed by Keycloak Identity Broker
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    SSO Realm Identifier:
                  </span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    mentify-prod-realm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Multi-Factor Authentication (MFA):
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enforced (TOTP)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Password Management:
                  </span>
                  <span className="text-slate-500">
                    Governed through centralized Keycloak User Account Console
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Keycloak SSO Sessions
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Currently active JWT authorization sessions across institutional devices
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Chrome on macOS (Current Device)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    IP: 192.168.10.45 · Last active: Just now
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
