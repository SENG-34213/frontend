"use client";

import { useCallback, useEffect, useState } from "react";
import type { BackendCourse } from "../api/courseApi";
import { getCourseStudentIds, getStudentAttendanceSummary } from "../api/studentApi";
import type { Student } from "../types";

type TeacherStudentsState = {
  students: Student[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

function shortId(value: string) {
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function studentStatus(attendanceRate: number): Student["status"] {
  return attendanceRate >= 90 ? "Excelling" : attendanceRate >= 75 ? "Active" : "At Risk";
}

export function useTeacherStudents(
  enabled: boolean,
  courses: BackendCourse[],
): TeacherStudentsState {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<Omit<TeacherStudentsState, "retry">>({
    students: [],
    isLoading: enabled,
    error: null,
  });

  const retry = useCallback(() => setRetryKey((current) => current + 1), []);

  useEffect(() => {
    if (!enabled) {
      setState({ students: [], isLoading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((current) => ({ ...current, isLoading: true, error: null }));

    async function loadStudents() {
      try {
        const byStudent = new Map<string, Student>();
        const rosterResults = await Promise.all(
          courses.map(async (course) => ({
            course,
            studentIds: await getCourseStudentIds(course.id, controller.signal),
          })),
        );

        await Promise.all(
          rosterResults.flatMap(({ course, studentIds }) =>
            studentIds.map(async (studentId) => {
              let attendanceRate = 0;
              let absences = 0;
              try {
                const summary = await getStudentAttendanceSummary(
                  studentId,
                  course.id,
                  controller.signal,
                );
                attendanceRate = Number(summary?.attendancePercentage ?? 0);
                absences = Number(summary?.absentCount ?? 0);
              } catch (requestError) {
                if (controller.signal.aborted) throw requestError;
              }

              const current = byStudent.get(studentId);
              const courseIds = current
                ? Array.from(new Set([...current.enrolledCourseIds, course.id]))
                : [course.id];
              const nextAttendance = current
                ? Math.round(((current.attendanceRate + attendanceRate) / 2) * 10) / 10
                : Math.round(attendanceRate * 10) / 10;
              byStudent.set(studentId, {
                id: studentId,
                studentId,
                name: `Student ${shortId(studentId)}`,
                email: "Not provided by the current API",
                avatarBg: "bg-indigo-600",
                initials: "ST",
                enrolledCourseIds: courseIds,
                attendanceRate: nextAttendance,
                gpa: 0,
                status: studentStatus(nextAttendance),
                lastActive: "Not available",
                submissionsPending: 0,
                recentGradeAvg: 0,
                absences: (current?.absences ?? 0) + absences,
              });
            }),
          ),
        );

        if (!controller.signal.aborted) {
          setState({ students: Array.from(byStudent.values()), isLoading: false, error: null });
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setState({
            students: [],
            isLoading: false,
            error:
              requestError instanceof Error
                ? requestError
                : new Error("Unable to load the teacher student directory."),
          });
        }
      }
    }

    void loadStudents();
    return () => controller.abort();
  }, [courses, enabled, retryKey]);

  return { ...state, retry };
}
