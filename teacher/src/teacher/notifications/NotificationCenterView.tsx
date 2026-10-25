"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckSquare,
  Clock,
  GraduationCap,
  Square,
  Trash2,
  UserPlus,
} from "lucide-react";
import { NavigationTab } from "../types";
import { useTeacherNotifications } from "../hooks/useTeacherNotifications";
import {
  notificationKind,
  notificationTypeLabel,
  splitNotificationDetails,
} from "../../../../shared/notifications/notificationDetails";

interface NotificationCenterViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({
  onNavigate,
  onUnreadCountChange,
}) => {
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const notifications = useTeacherNotifications(true);

  useEffect(
    () => onUnreadCountChange?.(notifications.unreadCount),
    [notifications.unreadCount, onUnreadCountChange],
  );

  const filteredNotifications = useMemo(
    () =>
      notifications.notifications.filter((item) => {
        const matchesTab = tab === "all" || (tab === "unread" ? !item.read : item.read);
        const matchesCategory =
          categoryFilter === "ALL" || notificationKind(item.type) === categoryFilter;
        return matchesTab && matchesCategory;
      }),
    [categoryFilter, notifications.notifications, tab],
  );
  const visibleIds = filteredNotifications.map((item) => item.id);
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

  async function markOne(id: string) {
    setActionError(null);
    try {
      await notifications.markRead(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to mark notification read.");
    }
  }
  async function markAll() {
    setActionError(null);
    try {
      await notifications.markAllRead();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to mark notifications read.");
    }
  }
  async function remove(id: string) {
    setActionError(null);
    try {
      await notifications.remove(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to delete notification.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Notification Center
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Important updates from your teaching workspace.
          </p>
        </div>
        <button
          onClick={markAll}
          disabled={notifications.isLoading || notifications.unreadCount === 0}
          className="flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
        </button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-2xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(["all", "unread", "read"] as const).map((value) => (
            <button
              key={value}
              onClick={() => {
                setTab(value);
                if (value !== "read") notifications.setUnreadOnly(value === "unread");
              }}
              className={`rounded-md px-3 py-1 font-medium capitalize transition-colors ${tab === value ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"}`}
            >
              {value} (
              {value === "all"
                ? notifications.totalElements
                : value === "unread"
                  ? notifications.unreadCount
                  : Math.max(0, notifications.totalElements - notifications.unreadCount)}
              )
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
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
              void Promise.all(selectedIds.map((id) => notifications.remove(id)));
              setSelectedIds([]);
            }}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete selected ({selectedIds.length})
          </button>
        </div>
      </div>

      {notifications.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h2 className="font-semibold text-rose-900">Notifications are unavailable</h2>
          <p className="mt-2 text-sm text-rose-700">{notifications.error.message}</p>
          <button
            onClick={notifications.retry}
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          {notifications.isLoading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="font-semibold text-slate-700">No notifications</p>
              <p className="mt-0.5">You are completely up to date.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const parsed = splitNotificationDetails(item.message);
              const Icon =
                item.category === "exam"
                  ? GraduationCap
                  : item.category === "enrollment"
                    ? UserPlus
                    : Bell;
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3.5 p-4 transition-colors ${!item.read ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
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
                  <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100 p-2 text-indigo-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.title}</span>
                        {!item.read && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
                          {notificationKind(item.type)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-600">{parsed.summary}</p>
                    {parsed.details.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {parsed.details.map((detail) => (
                          <span
                            key={`${item.id}-${detail}`}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {notificationTypeLabel(item.type)}
                    </span>
                    <div className="mt-2.5 flex items-center gap-3">
                      {item.actionUrl && (
                        <button
                          onClick={() => {
                            void markOne(item.id);
                            onNavigate(item.actionUrl!);
                          }}
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          View related item →
                        </button>
                      )}
                      {!item.read && (
                        <button
                          onClick={() => void markOne(item.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => void remove(item.id)}
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
      )}

      {!notifications.error && notifications.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {notifications.page + 1} of {notifications.totalPages} ·{" "}
            {notifications.totalElements} total
          </span>
          <div className="flex gap-2">
            <button
              disabled={notifications.page === 0 || notifications.isLoading}
              onClick={() => notifications.setPage(Math.max(0, notifications.page - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={
                notifications.page >= notifications.totalPages - 1 || notifications.isLoading
              }
              onClick={() => notifications.setPage(notifications.page + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
