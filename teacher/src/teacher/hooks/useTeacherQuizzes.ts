"use client";

import { useEffect, useRef, useState } from "react";
import { getTeacherQuizzes, type BackendQuiz } from "../api/quizApi";

type TeacherQuizzesState = {
  quizzes: BackendQuiz[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

export function useTeacherQuizzes(enabled: boolean): TeacherQuizzesState {
  const [retryKey, setRetryKey] = useState(0);
  const requestStartedRef = useRef(false);
  const [state, setState] = useState<Omit<TeacherQuizzesState, "retry">>({
    quizzes: [],
    isLoading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      requestStartedRef.current = false;
      setState({ quizzes: [], isLoading: false, error: null });
      return;
    }
    if (requestStartedRef.current) return;
    requestStartedRef.current = true;

    const controller = new AbortController();
    let disposed = false;

    const loadQuizzes = (showLoading = false) => {
      if (disposed || requestStartedRef.current) return;
      requestStartedRef.current = true;
      setState((current) => ({
        ...current,
        // Only the first request should block the page. Background polling
        // must keep the existing quiz list visible while it refreshes.
        isLoading: showLoading ? true : current.isLoading,
        error: null,
      }));
      getTeacherQuizzes(controller.signal)
        .then((quizzes) => {
          if (!controller.signal.aborted) setState({ quizzes, isLoading: false, error: null });
        })
        .catch((requestError: unknown) => {
          if (controller.signal.aborted) return;
          setState((current) => ({
            quizzes: current.quizzes,
            isLoading: false,
            error:
              requestError instanceof Error
                ? requestError
                : new Error("Teacher quizzes failed to load."),
          }));
        })
        .finally(() => {
          requestStartedRef.current = false;
        });

    };

    loadQuizzes(true);
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") loadQuizzes();
    };
    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("focus", refreshOnFocus);
    const intervalId = window.setInterval(() => loadQuizzes(), 15_000);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      window.removeEventListener("focus", refreshOnFocus);
      requestStartedRef.current = false;
      controller.abort();
    };
  }, [enabled, retryKey]);

  return {
    ...state,
    retry: () => {
      requestStartedRef.current = false;
      setRetryKey((current) => current + 1);
    },
  };
}
