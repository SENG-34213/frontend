"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type BackendNotification,
} from "../api/notificationApi";
import type { NotificationItem } from "../types";
import { formatNotificationTime } from "../../../../shared/notifications/notificationFormat";

type NotificationState = {
  notifications: NotificationItem[];
  page: number;
  totalPages: number;
  totalElements: number;
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
};

function toNotificationItem(notification: BackendNotification): NotificationItem {
  const type = notification.type?.toUpperCase() ?? "SYSTEM";
  const category = type.includes("SUBMISSION")
    ? "submission"
    : type.includes("ENROLL")
      ? "enrollment"
      : type.includes("EXAM")
        ? "exam"
        : type.includes("MESSAGE")
          ? "message"
          : "system";
  const actionUrl: NotificationItem["actionUrl"] =
    type.includes("SECURITY") || type.includes("AUTH")
      ? "settings"
      : type.includes("RESULT") || type.includes("GRADE")
        ? "grades"
        : type.includes("EXAM")
          ? "exams"
          : type.includes("SUBMISSION") || type.includes("ASSIGNMENT")
            ? "assignments"
            : type.includes("QUIZ")
              ? "quizzes"
              : type.includes("ATTENDANCE")
                ? "attendance"
                : type.includes("CALENDAR") || type.includes("EVENT")
                  ? "calendar"
                  : type.includes("MESSAGE") || type.includes("COMMUNICATION")
                    ? "messages"
                    : type.includes("ENROLL") || type.includes("STUDENT")
                      ? "students"
                      : type.includes("MATERIAL")
                        ? "materials"
                        : type.includes("COURSE")
                          ? "courses"
                          : "dashboard";
  return {
    id: notification.id,
    type,
    title: notification.title,
    message: notification.message,
    category,
    timestamp: formatNotificationTime(notification.occurredAt || notification.createdAt),
    read: Boolean(notification.readAt),
    actionUrl,
  };
}

export function useTeacherNotifications(enabled: boolean, pageSize = 20) {
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const requestStartedRef = useRef(false);
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    page: 0,
    totalPages: 0,
    totalElements: 0,
    unreadCount: 0,
    isLoading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      requestStartedRef.current = false;
      setState((current) => ({ ...current, isLoading: false, error: null }));
      return;
    }
    if (requestStartedRef.current) return;
    requestStartedRef.current = true;

    const controller = new AbortController();
    setState((current) => ({ ...current, isLoading: true, error: null }));

    getNotifications(page, pageSize, unreadOnly, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({
          notifications: result.notifications.map(toNotificationItem),
          page: result.page,
          totalPages: result.totalPages,
          totalElements: result.totalElements,
          unreadCount: result.unreadCount,
          isLoading: false,
          error: null,
        });
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setState((current) => ({
          ...current,
          isLoading: false,
          error:
            requestError instanceof Error
              ? requestError
              : new Error("Notifications failed to load."),
        }));
      });

    return () => {
      requestStartedRef.current = false;
      controller.abort();
    };
  }, [enabled, page, pageSize, retryKey, unreadOnly]);

  const retry = useCallback(() => {
    requestStartedRef.current = false;
    setRetryKey((current) => current + 1);
  }, []);

  const markRead = useCallback(async (notificationId: string) => {
    await markNotificationRead(notificationId);
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
      unreadCount: Math.max(
        0,
        current.unreadCount -
          (current.notifications.some((item) => item.id === notificationId && !item.read) ? 1 : 0),
      ),
    }));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((item) => ({ ...item, read: true })),
      unreadCount: 0,
    }));
  }, []);

  const remove = useCallback(async (notificationId: string) => {
    await deleteNotification(notificationId);
    setState((current) => ({
      ...current,
      notifications: current.notifications.filter((item) => item.id !== notificationId),
      totalElements: Math.max(0, current.totalElements - 1),
    }));
  }, []);

  return {
    ...state,
    unreadOnly,
    setUnreadOnly: (value: boolean) => {
      setUnreadOnly(value);
      setPage(0);
    },
    setPage,
    retry,
    markRead,
    markAllRead,
    remove,
  };
}
