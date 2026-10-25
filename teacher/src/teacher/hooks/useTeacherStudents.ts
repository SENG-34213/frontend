"use client";

import { useCallback, useEffect, useState } from "react";
import type { BackendCourse } from "../api/courseApi";
import {
  getCourseStudentIds,
  getStudentAttendanceSummary,
  getStudentProfiles,
  type BackendStudentProfile,
} from "../api/studentApi";
import type { Student } from "../types";

type TeacherStudentsState = {
  students: Student[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

function studentStatus(attendanceRate: number | null, profileStatus?: string): Student["status"] {
  if (attendanceRate === null) return profileStatus === "ACTIVE" ? "Active" : "At Risk";
  return attendanceRate >= 90 ? "Excelling" : attendanceRate >= 75 ? "Active" : "At Risk";
}

function initials(name: string) {
  const result = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return result || "?";
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

    // There is nothing to request until the teacher course list is available.
    // Avoid making an empty roster request that can leave the directory in a
    // misleading loading state while courses are still being fetched.
    if (courses.length === 0) {
      setState({ students: [], isLoading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((current) => ({ ...current, isLoading: true, error: null }));

    async function loadStudents() {
      try {
        const rosterResults = await Promise.all(
          courses.map(async (course) => ({
            course,
            studentIds: await getCourseStudentIds(course.id, controller.signal),
          })),
        );
        const studentIds = Array.from(new Set(rosterResults.flatMap(({ studentIds: ids }) => ids)));
        const profiles = await getStudentProfiles(studentIds, controller.signal);
        const profilesById = new Map<string, BackendStudentProfile>(
          profiles.map((profile) => [profile.id, profile]),
        );
        // A roster identity without a resolvable profile or actual student
        // number is not a usable student entry for the teacher portal.
        const availableStudentIds = studentIds.filter((studentId) => {
          const profile = profilesById.get(studentId);
          return Boolean(profile?.studentNumber?.trim());
        });
        const enrolledCourseIds = new Map<string, string[]>();

        rosterResults.forEach(({ course, studentIds: ids }) => {
          ids
            .filter((studentId) => availableStudentIds.includes(studentId))
            .forEach((studentId) => {
              const current = enrolledCourseIds.get(studentId) ?? [];
              enrolledCourseIds.set(studentId, Array.from(new Set([...current, course.id])));
            });
        });

        const attendanceResults = await Promise.all(
          rosterResults.flatMap(({ course, studentIds: ids }) =>
            ids
              .filter((studentId) => availableStudentIds.includes(studentId))
              .map(async (studentId) => {
                try {
                  const summary = await getStudentAttendanceSummary(
                    studentId,
                    course.id,
                    controller.signal,
                  );
                  const rate = Number(summary?.attendancePercentage);
                  const absences = Number(summary?.absentCount);
                  return {
                    studentId,
                    rate: Number.isFinite(rate) ? rate : null,
                    absences: Number.isFinite(absences) ? absences : undefined,
                  };
                } catch (requestError) {
                  if (controller.signal.aborted) throw requestError;
                  return { studentId, rate: null, absences: undefined };
                }
              }),
          ),
        );
        const attendanceByStudent = new Map<string, { rates: number[]; absences: number }>();
        attendanceResults.forEach(({ studentId, rate, absences }) => {
          const current = attendanceByStudent.get(studentId) ?? { rates: [], absences: 0 };
          if (rate !== null) current.rates.push(rate);
          if (absences !== undefined) current.absences += absences;
          attendanceByStudent.set(studentId, current);
        });

        const directoryStudents: Student[] = availableStudentIds.map((studentId) => {
          const profile = profilesById.get(studentId);
          const attendance = attendanceByStudent.get(studentId);
          const attendanceRate = attendance?.rates.length
            ? Math.round(
                (attendance.rates.reduce((sum, rate) => sum + rate, 0) / attendance.rates.length) *
                  10,
              ) / 10
            : null;
          const name = profile?.name?.trim() || "Unavailable";
          return {
            id: studentId,
            // Keep the internal identity in `id` for API requests, but never
            // expose it as the student's display ID.
            studentId: profile!.studentNumber!,
            name,
            email: profile?.email || "Unavailable",
            avatar: profile?.avatar,
            avatarBg: "bg-indigo-600",
            initials: initials(name),
            enrolledCourseIds: enrolledCourseIds.get(studentId) ?? [],
            attendanceRate,
            gpa: null,
            status: studentStatus(attendanceRate, profile?.status),
            lastActive: "Unavailable",
            submissionsPending: 0,
            recentGradeAvg: null,
            absences: attendance?.absences,
          };
        });

        if (!controller.signal.aborted) {
          setState({ students: directoryStudents, isLoading: false, error: null });
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
