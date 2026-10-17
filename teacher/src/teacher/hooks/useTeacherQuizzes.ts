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
    setState((current) => ({ ...current, isLoading: true, error: null }));
    getTeacherQuizzes(controller.signal)
      .then((quizzes) => {
        if (!controller.signal.aborted) setState({ quizzes, isLoading: false, error: null });
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          quizzes: [],
          isLoading: false,
          error:
            requestError instanceof Error
              ? requestError
              : new Error("Teacher quizzes failed to load."),
        });
      });

    return () => {
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
