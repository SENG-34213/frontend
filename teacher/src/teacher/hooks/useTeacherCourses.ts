"use client";

import { useEffect, useRef, useState } from "react";
import { getTeacherCourses, type BackendCourse } from "../api/courseApi";

type TeacherCoursesState = {
  courses: BackendCourse[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

export function useTeacherCourses(enabled: boolean): TeacherCoursesState {
  const [retryKey, setRetryKey] = useState(0);
  const requestStartedRef = useRef(false);
  const [state, setState] = useState<Omit<TeacherCoursesState, "retry">>({
    courses: [],
    isLoading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      requestStartedRef.current = false;
      setState({ courses: [], isLoading: false, error: null });
      return;
    }

    if (requestStartedRef.current) return;
    requestStartedRef.current = true;

    const controller = new AbortController();
    setState((current) => ({ ...current, isLoading: true, error: null }));

    getTeacherCourses(controller.signal)
      .then((courses) => {
        if (controller.signal.aborted) return;
        setState({ courses, isLoading: false, error: null });
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          courses: [],
          isLoading: false,
          error:
            requestError instanceof Error
              ? requestError
              : new Error("Teacher courses failed to load."),
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
