import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  Shield,
  Award,
  UserPlus,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { NotificationItem } from "../types";
import { AdminRoute } from "../components/AdminSidebar";
import { EmptyState } from "../../../../shared/ui/EmptyState";
import {
  notificationKind,
  notificationTypeLabel,
  splitNotificationDetails,
} from "../../../../shared/notifications/notificationDetails";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredNotifications = notifications.filter((n) => {
    const matchesTab = tab === "all" ? true : tab === "unread" ? !n.read : n.read;
    const matchesCat = categoryFilter === "ALL" || n.category === categoryFilter;
    return matchesTab && matchesCat;
  });
  const visibleIds = filteredNotifications.map((notification) => notification.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };

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
        breadcrumbs={[{ label: "Admin" }, { label: "Platform Operations" }, { label: "Notifications" }]}
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

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAllVisible}
            disabled={visibleIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
          >
            {allVisibleSelected ? (
              <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
            ) : (
              <Square className="h-3.5 w-3.5" />
            )}
            Select all
          </button>
          <button
            onClick={() => {
              selectedIds.forEach(onDelete);
              setSelectedIds([]);
            }}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete selected ({selectedIds.length})
          </button>
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
              <button
                aria-label={`Select ${notif.title}`}
                onClick={() => toggleSelected(notif.id)}
                className="mt-1 shrink-0 text-slate-400 hover:text-indigo-600"
              >
                {selectedIds.includes(notif.id) ? (
                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>
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
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                      {notificationKind(notif.type)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 tabular-nums">
                      <Clock className="h-3 w-3" /> {notif.timestamp}
                    </span>
                  </div>
                </div>

                {(() => {
                  const parsed = splitNotificationDetails(notif.message);
                  return (
                    <>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {parsed.summary}
                      </p>
                      {parsed.details.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {parsed.details.map((detail) => (
                            <span
                              key={`${notif.id}-${detail}`}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {notificationTypeLabel(notif.type)}
                      </span>
                    </>
                  );
                })()}

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
