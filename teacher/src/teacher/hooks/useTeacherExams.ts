"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getExamsByCourse, type BackendExam } from "../api/examApi";
import type { Course } from "../types";

export function useTeacherExams(courses: Course[]) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState({
    exams: [] as BackendExam[],
    isLoading: true,
    error: null as Error | null,
  });
  const requestStartedRef = useRef(false);

  useEffect(() => {
    if (!courses.length) {
      setState({ exams: [], isLoading: false, error: null });
      return;
    }
    if (requestStartedRef.current) return;
    requestStartedRef.current = true;
    const controller = new AbortController();
    setState((current) => ({ ...current, isLoading: true, error: null }));

    Promise.all(courses.map((course) => getExamsByCourse(course.id, controller.signal)))
      .then((results) => {
        if (!controller.signal.aborted) {
          setState({ exams: results.flat(), isLoading: false, error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          exams: [],
          isLoading: false,
          error: requestError instanceof Error ? requestError : new Error("Exams failed to load."),
        });
      });

    return () => {
      requestStartedRef.current = false;
      controller.abort();
    };
  }, [courses, retryKey]);

  const retry = useCallback(() => {
    requestStartedRef.current = false;
    setRetryKey((current) => current + 1);
  }, []);

  return { ...state, retry };
}
