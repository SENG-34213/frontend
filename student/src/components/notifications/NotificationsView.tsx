import React, { useMemo, useState } from "react";
import { Bell, CheckCheck, CheckSquare, Clock, Square, Trash2 } from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { NotificationItem } from "../../types";
import { EmptyState } from "../../../../shared/ui/EmptyState";
import {
  notificationKind,
  notificationTypeLabel,
  splitNotificationDetails,
} from "../../../../shared/notifications/notificationDetails";

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setCurrentView,
    setSelectedAssignmentId,
  } = useStudent();
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      notifications.filter((item) => {
        const matchesTab = tab === "all" || (tab === "unread" ? !item.read : item.read);
        const matchesCategory =
          categoryFilter === "ALL" ||
          notificationKind(item.eventType || item.type) === categoryFilter;
        return matchesTab && matchesCategory;
      }),
    [categoryFilter, notifications, tab],
  );

  const handleAction = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (!item.actionView) return;
    if (item.targetId && item.actionView === "assignments") {
      setSelectedAssignmentId(item.targetId);
      setCurrentView("assignment-details");
    } else setCurrentView(item.actionView);
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const readCount = notifications.length - unreadCount;
  const visibleIds = filtered.map((item) => item.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const toggleSelected = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  const toggleAllVisible = () =>
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notification Center
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Important updates about your courses and learning activity.
          </p>
        </div>
        <button
          onClick={markAllNotificationsAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:self-auto"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
        </button>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(["all", "unread", "read"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`rounded-md px-3 py-1 font-medium capitalize transition-colors ${tab === value ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              {value} (
              {value === "all"
                ? notifications.length
                : value === "unread"
                  ? unreadCount
                  : readCount}
              )
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="ALL">All categories</option>
          {[
            "Calendar",
            "Assignment",
            "Quiz",
            "Exam",
            "Attendance",
            "Learning material",
            "Message",
            "Enrollment",
          ].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAllVisible}
            disabled={visibleIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
          >
            {allVisibleSelected ? (
              <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
            ) : (
              <Square className="h-3.5 w-3.5" />
            )}{" "}
            Select all
          </button>
          <button
            onClick={() => {
              selectedIds.forEach((id) => void deleteNotification(id));
              setSelectedIds([]);
            }}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete selected ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              compact
              icon={Bell}
              title="No notifications"
              description="You are completely up to date."
              className="border-0"
            />{" "}
          </div>
        ) : (
          filtered.map((item) => {
            const parsed = splitNotificationDetails(item.description);
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3.5 p-4 transition-colors ${!item.read ? "bg-indigo-50/30 dark:bg-indigo-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/20"}`}
              >
                <button
                  aria-label={`Select ${item.title}`}
                  onClick={() => toggleSelected(item.id)}
                  className="mt-1 shrink-0 text-slate-400 hover:text-indigo-600"
                >
                  {selectedIds.includes(item.id) ? (
                    <CheckSquare className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100 p-2 text-indigo-600 dark:bg-slate-800">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      {!item.read && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        {notificationKind(item.eventType || item.type)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                    {parsed.summary}
                  </p>
                  {parsed.details.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {parsed.details.map((detail) => (
                        <span
                          key={`${item.id}-${detail}`}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {notificationTypeLabel(item.eventType || item.type)}
                  </span>
                  <div className="mt-2.5 flex items-center gap-3">
                    {item.actionView && (
                      <button
                        onClick={() => handleAction(item)}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        View related item →
                      </button>
                    )}
                    {!item.read && (
                      <button
                        onClick={() => markNotificationAsRead(item.id)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => void deleteNotification(item.id)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
