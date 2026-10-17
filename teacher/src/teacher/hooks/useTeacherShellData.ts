"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTeacherShellData } from "../api/teacherApi";
import type { TeacherUserSummary } from "../auth/authTypes";
import type { TeacherProfile } from "../types";
import { mockTeacherProfile } from "../data/mockData";

type ShellState = {
  teacherProfile: TeacherProfile | null;
  unreadNotificationsCount: number;
  isLoading: boolean;
  error: Error | null;
  notificationError: Error | null;
};

function toTeacherProfile(user: TeacherUserSummary): TeacherProfile {
  const firstName = user.firstName?.trim() ?? "";
  const lastName = user.lastName?.trim() ?? "";
  const name = [firstName, lastName].filter(Boolean).join(" ");

  return {
    ...mockTeacherProfile,
    id: user.id ?? user.keycloakUserId ?? mockTeacherProfile.id,
    name: name || user.email || mockTeacherProfile.name,
    email: user.email,
    title: typeof user.title === "string" ? user.title : mockTeacherProfile.title,
    teacherCode:
      typeof user.teacherCode === "string" ? user.teacherCode : mockTeacherProfile.teacherCode,
  };
}

export function useTeacherShellData(enabled: boolean): ShellState & { retry: () => void } {
  const [retryKey, setRetryKey] = useState(0);
  const requestStartedRef = useRef(false);
  const abortTimerRef = useRef<number | null>(null);
  const [state, setState] = useState<ShellState>({
    teacherProfile: null,
    unreadNotificationsCount: 0,
    isLoading: enabled,
    error: null,
    notificationError: null,
  });

  useEffect(() => {
    if (abortTimerRef.current !== null) {
      window.clearTimeout(abortTimerRef.current);
      abortTimerRef.current = null;
    }

    if (!enabled) {
      requestStartedRef.current = false;
      setState((current) => ({ ...current, isLoading: false }));
      return;
    }

    if (requestStartedRef.current) return;
    requestStartedRef.current = true;

    const controller = new AbortController();
    setState((current) => ({ ...current, isLoading: true, error: null }));

    getTeacherShellData(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({
          teacherProfile: toTeacherProfile(data.user),
          unreadNotificationsCount: data.unreadNotificationsCount,
          isLoading: false,
          error: null,
          notificationError: data.notificationsError ?? null,
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
              : new Error("Teacher data failed to load."),
        }));
      });

    return () => {
      abortTimerRef.current = window.setTimeout(() => {
        controller.abort();
        abortTimerRef.current = null;
      }, 0);
    };
  }, [enabled, retryKey]);

  const retry = useCallback(() => {
    requestStartedRef.current = false;
    setRetryKey((current) => current + 1);
  }, []);
  return { ...state, retry };
}
