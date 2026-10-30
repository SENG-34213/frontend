import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { AttendanceRecord, AttendanceSession, Course, TeacherProfile } from "../types";

interface AttendanceRecordApiResponse {
  id: string;
  studentId: string;
  studentName?: string;
  status?: string;
  remarks?: string;
  markedBy?: string;
  markedAt?: string;
  updatedAt?: string;
}

interface AttendanceSessionApiResponse {
  id: string;
  courseId: string;
  title?: string;
  attendanceDate?: string;
  startTime?: string;
  endTime?: string;
  mode?: string;
  status?: "OPEN" | "COMPLETED" | "CANCELLED";
  createdBy?: string;
  createdByName?: string;
  records?: AttendanceRecordApiResponse[];
}

function timeLabel(start?: string, end?: string) {
  if (!start && !end) return "Time not set";
  return [start, end].filter(Boolean).join(" – ");
}

function teacherNameFromDirectory(teacherId: string | undefined, teachers: TeacherProfile[]) {
  if (!teacherId) return "Teacher";
  const teacher = teachers.find(
    (item) => item.id === teacherId || item.keycloakUserId === teacherId,
  );
  return teacher ? `${teacher.firstName} ${teacher.lastName}`.trim() : "Teacher";
}

export async function fetchAttendanceSessionsForCourse(
  course: Course,
  teachers: TeacherProfile[] = [],
) {
  const response = await apiRequest<ApiResponse<AttendanceSessionApiResponse[]>>(
    `/api/v1/attendance/courses/${encodeURIComponent(course.id)}/sessions`,
  );
  return (response.data || []).map((session): AttendanceSession => {
    const records = session.records || [];
    const presentCount = records.filter((record) => record.status === "PRESENT").length;
    const lateCount = records.filter((record) => record.status === "LATE").length;
    const absentCount = records.filter((record) => record.status === "ABSENT").length;

    return {
      id: session.id,
      courseId: session.courseId || course.id,
      courseCode: course.code,
      courseTitle: course.title,
      date: session.attendanceDate || "Date not set",
      timeSlot: timeLabel(session.startTime, session.endTime),
      mode: session.mode === "ONLINE" || session.mode === "HYBRID" ? session.mode : "IN_PERSON",
      status: session.status || "OPEN",
      totalStudents: records.length,
      presentCount,
      absentCount,
      lateCount,
      markedBy: session.createdByName || teacherNameFromDirectory(session.createdBy, teachers),
      records: records.map(
        (record): AttendanceRecord => ({
          id: record.id,
          studentId: record.studentId,
          studentName: record.studentName,
          status:
            record.status === "PRESENT" ||
            record.status === "ABSENT" ||
            record.status === "LATE" ||
            record.status === "NOT_MARKED"
              ? record.status
              : "NOT_MARKED",
          remarks: record.remarks,
          markedBy: record.markedBy,
          markedAt: record.markedAt,
          updatedAt: record.updatedAt,
        }),
      ),
    };
  });
}

export async function fetchAttendanceSessions(courses: Course[], teachers: TeacherProfile[] = []) {
  const results = await Promise.allSettled(
    courses.map((course) => fetchAttendanceSessionsForCourse(course, teachers)),
  );
  const sessions = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const failedCourses = results.reduce<string[]>((failed, result, index) => {
    if (result.status === "rejected") {
      failed.push(courses[index]?.title || courses[index]?.id || "a course");
    }
    return failed;
  }, []);

  return {
    sessions,
    failedCourses,
  };
}

export async function updateAttendanceRecords(
  sessionId: string,
  records: Array<{ studentId: string; status: "PRESENT" | "ABSENT" | "LATE"; remarks?: string }>,
) {
  const response = await apiRequest<ApiResponse<unknown>>(
    `/api/v1/attendance/sessions/${encodeURIComponent(sessionId)}/records`,
    { method: "PUT", body: { records } },
  );
  return response.data;
}
