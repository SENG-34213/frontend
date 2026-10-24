import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  Filter,
  Clock,
  Shield,
  Award,
  UserPlus,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { NotificationItem } from "../types";
import { AdminRoute } from "../components/AdminSidebar";
import { EmptyState } from "../../../../shared/ui/EmptyState";

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onNavigate: (route: AdminRoute) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onNavigate,
}) => {
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filteredNotifications = notifications.filter((n) => {
    const matchesTab = tab === "all" ? true : tab === "unread" ? !n.read : n.read;
    const matchesCat = categoryFilter === "ALL" || n.category === categoryFilter;
    return matchesTab && matchesCat;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "REGISTRATION":
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case "SECURITY":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "ACADEMIC":
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="System dispatch audit, security alerts, registration webhooks, and academic events."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Platform Operations" },
          { label: "Notifications" },
        ]}
        actions={
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        }
      />

      {/* Tabs and Categories */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(["all", "unread", "read"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 font-medium rounded-md capitalize transition-colors ${
                tab === t
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t} (
              {t === "all"
                ? notifications.length
                : notifications.filter((n) => (t === "unread" ? !n.read : n.read)).length}
              )
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="ALL">All Categories</option>
          <option value="REGISTRATION">Registrations</option>
          <option value="SECURITY">Security</option>
          <option value="ACADEMIC">Academic Schedule</option>
          <option value="SYSTEM">System Health</option>
        </select>
      </div>

      {/* Notification List */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <EmptyState
              compact
              icon={Bell}
              title="No notifications"
              description="There are no notifications in this view."
              className="border-0"
            />
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start gap-3.5 transition-colors ${
                !notif.read
                  ? "bg-indigo-50/30 dark:bg-indigo-950/20"
                  : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getCategoryIcon(notif.category)}
              </div>

              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                <div className="mt-2.5 flex items-center gap-3">
                  {notif.linkAction && (
                    <button
                      onClick={() => onNavigate(notif.linkAction as AdminRoute)}
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-[11px]"
                    >
                      Inspect related record →
                    </button>
                  )}
                  {!notif.read && (
                    <button
                      onClick={() => onMarkRead(notif.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px]"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(notif.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-[11px]"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
