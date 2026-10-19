"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCheck,
  ClipboardList,
  GraduationCap,
  LoaderCircle,
  MessageSquare,
  Trash2,
  UserCheck,
} from "lucide-react";
import { NavigationTab } from "../types";
import { useTeacherNotifications } from "../hooks/useTeacherNotifications";

interface NotificationCenterViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({
  onNavigate,
  onUnreadCountChange,
}) => {
  const [actionError, setActionError] = useState<string | null>(null);
  const notifications = useTeacherNotifications(true);

  useEffect(() => {
    onUnreadCountChange?.(notifications.unreadCount);
  }, [notifications.unreadCount, onUnreadCountChange]);

  async function handleMarkOne(id: string) {
    setActionError(null);
    try {
      await notifications.markRead(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to mark notification read.");
    }
  }

  async function handleMarkAll() {
    setActionError(null);
    try {
      await notifications.markAllRead();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to mark notifications read.");
    }
  }

  async function handleDelete(id: string) {
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
            Review activity from your teaching workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-100 p-1">
            {[
              { label: "All", value: false },
              { label: "Unread", value: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => notifications.setUnreadOnly(item.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  notifications.unreadOnly === item.value
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleMarkAll}
            disabled={notifications.isLoading || notifications.unreadCount === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5 text-slate-500" />
            Mark all read
          </button>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {actionError}
        </div>
      )}

      {notifications.error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h2 className="font-semibold text-rose-900">Notifications are unavailable</h2>
          <p className="mt-2 text-sm text-rose-700">{notifications.error.message}</p>
          <button
            onClick={notifications.retry}
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      )}

      {!notifications.error && (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          {notifications.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Loading notifications...
            </div>
          ) : notifications.notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="font-semibold text-slate-700">No notifications to display</p>
              <p className="mt-0.5">You are completely up to date.</p>
            </div>
          ) : (
            notifications.notifications.map((item) => {
              const Icon =
                item.category === "submission"
                  ? ClipboardList
                  : item.category === "enrollment"
                    ? UserCheck
                    : item.category === "exam"
                      ? GraduationCap
                      : item.category === "message"
                        ? MessageSquare
                        : Bell;
              return (
                <div
                  key={item.id}
                  className={`flex items-start justify-between gap-4 p-4 transition-colors ${
                    !item.read ? "bg-indigo-50/20 hover:bg-indigo-50/40" : "hover:bg-slate-50"
                  }`}
                >
                  <button
                    className="flex min-w-0 flex-1 items-start gap-3.5 text-left"
                    onClick={() => {
                      void handleMarkOne(item.id);
                      if (item.actionUrl) onNavigate(item.actionUrl);
                    }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`truncate text-xs font-bold sm:text-sm ${item.read ? "text-slate-700" : "text-slate-900"}`}
                        >
                          {item.title}
                        </h3>
                        {!item.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {item.message}
                      </p>
                      <span className="mt-1 block font-mono text-[10px] text-slate-400">
                        {item.timestamp}
                      </span>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2 self-center">
                    {item.actionUrl && (
                      <button
                        onClick={() => {
                          void handleMarkOne(item.id);
                          onNavigate(item.actionUrl!);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      aria-label={`Delete ${item.title}`}
                      onClick={() => void handleDelete(item.id)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
