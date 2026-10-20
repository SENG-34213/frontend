import { apiRequest, apiUpload } from "./client";
import type {
  Assignment,
  CalendarEvent,
  Course,
  Examination,
  LearningMaterial,
  NotificationItem,
  Quiz,
  StudentProfile,
  Teacher,
} from "../types";
import type { StudentUserSummary } from "../auth/authTypes";

type ApiEnvelope<T> = { data?: T; message?: string };
// Backend DTOs are intentionally normalized at this boundary because services currently
// return different envelopes while the contract is being consolidated.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>;

function dataOf<T>(response: ApiEnvelope<T> | T): T {
  return (
    response && typeof response === "object" && "data" in response ? response.data : response
  ) as T;
}

function listOf<T>(response: unknown): T[] {
  const value = dataOf(response as ApiEnvelope<unknown>);
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as JsonRecord;
    for (const key of ["items", "content", "results", "notifications", "courses"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

const idOf = (value: unknown) => String(value ?? "");

function toProfile(user: StudentUserSummary): StudentProfile {
  const record = user as JsonRecord;
  return {
    id: idOf(user.keycloakUserId || user.id),
    studentId: idOf(record.studentId || user.keycloakUserId || user.id),
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    email: user.email,
    avatar: idOf(record.avatar || record.profileImage),
    role: "STUDENT",
    institution: idOf(record.institution),
    department: idOf(record.department),
    degreeProgram: idOf(record.degreeProgram),
    semester: idOf(record.semester),
    currentGpa: Number(record.currentGpa ?? 0),
    creditsCompleted: Number(record.creditsCompleted ?? 0),
    totalCreditsRequired: Number(record.totalCreditsRequired ?? 0),
    academicAdvisor: {
      name: idOf(record.academicAdvisorName),
      email: idOf(record.academicAdvisorEmail),
      office: idOf(record.academicAdvisorOffice),
    },
    phone: idOf(record.phone),
    bio: idOf(record.bio),
    joinedDate: idOf(record.joinedDate || record.createdAt),
  };
}

function toTeacher(value: JsonRecord | undefined): Teacher {
  return {
    id: idOf(value?.id || value?.teacherId || value?.assignedTeacherId),
    name: idOf(value?.name || value?.fullName),
    title: idOf(value?.title),
    avatar: idOf(value?.avatar),
    department: idOf(value?.department),
    officeHours: idOf(value?.officeHours),
    email: idOf(value?.email),
  };
}

function toCourse(value: JsonRecord, enrolledIds: Set<string>): Course {
  const id = idOf(value.id || value.courseId);
  return {
    id,
    code: idOf(value.courseCode || value.code),
    title: idOf(value.courseName || value.title),
    category: idOf(value.subject || value.category),
    description: idOf(value.courseDescription || value.description),
    instructor: toTeacher(value.instructor || value.teacher),
    bannerColor: idOf(value.bannerColor),
    coverImage: idOf(value.courseThumbnail || value.coverImage),
    enrolled: enrolledIds.has(id) || Boolean(value.enrolled),
    enrollmentStatus: enrolledIds.has(id) ? "ACTIVE" : "AVAILABLE",
    progressPercentage: Number(value.progressPercentage ?? value.progress ?? 0),
    lastAccessedLessonId: idOf(value.lastAccessedLessonId),
    lastAccessedLessonTitle: idOf(value.lastAccessedLessonTitle),
    credits: Number(value.credits ?? value.creditCount ?? 0),
    level: value.level || "Intermediate",
    modules: [],
    schedule: idOf(value.schedule),
    room: idOf(value.room),
    enrolledStudentsCount: Number(value.numberOfStudents ?? value.enrolledStudentsCount ?? 0),
    rating: Number(value.rating ?? 0),
    currentGrade: value.currentGrade,
    currentScorePercentage: value.currentScorePercentage,
  };
}

export type StudentEnrollmentState = {
  id: string;
  studentId: string;
  courseIds: string[];
  status?: string;
};

function toEnrollment(value: JsonRecord): StudentEnrollmentState {
  const courseIds = Array.isArray(value.courseIds)
    ? value.courseIds.map(idOf)
    : value.courseId
      ? [idOf(value.courseId)]
      : [];
  return {
    id: idOf(value.id || value.enrollmentId),
    studentId: idOf(value.studentId),
    courseIds,
    status: value.status ? String(value.status).toUpperCase() : undefined,
  };
}

function toAssignment(value: JsonRecord, course?: Course): Assignment {
  const status = String(value.status || "UNKNOWN").toUpperCase();
  return {
    id: idOf(value.id),
    courseId: idOf(value.courseId),
    courseCode: course?.code || "",
    courseTitle: course?.title || "",
    title: idOf(value.title),
    description: idOf(value.description),
    instructions: idOf(value.instructions),
    dueDate: idOf(value.dueDate),
    maxScore: Number(value.maxMarks ?? value.maxScore ?? 0),
    status: ["PENDING", "SUBMITTED", "GRADED", "OVERDUE"].includes(status)
      ? (status as Assignment["status"])
      : "UNKNOWN",
    priority: value.priority
      ? (String(value.priority).toUpperCase() as Assignment["priority"])
      : "UNKNOWN",
    submittedDate: value.submittedAt,
    grade: value.marks,
    feedback: value.feedback,
    rubricCriteria: [],
    attachments: [],
    submissionText: value.content,
    submittedFiles: [],
  };
}

function toMaterial(value: JsonRecord): LearningMaterial {
  return {
    id: idOf(value.id || value.materialId),
    courseId: idOf(value.courseId),
    courseCode: "",
    courseTitle: "",
    title: idOf(value.title),
    description: idOf(value.description),
    type: value.type || "DOCUMENT",
    fileSize: idOf(value.fileSize),
    uploadedDate: idOf(value.createdAt || value.uploadedDate),
    downloadsCount: Number(value.downloadsCount ?? 0),
    previewUrl: value.fileUrl || value.downloadUrl,
    contentSnippet: value.contentSnippet,
  };
}

function toLesson(value: JsonRecord, moduleId: string) {
  return {
    id: idOf(value.id),
    moduleId,
    title: idOf(value.title),
    durationMinutes: Number(value.durationMinutes ?? 0),
    type: value.type || "reading",
    completed: Boolean(value.completed),
    videoUrl: value.videoUrl,
    content: idOf(value.content || value.description),
  } as Course["modules"][number]["lessons"][number];
}

function toModuleRecord(value: JsonRecord, courseId: string) {
  return {
    id: idOf(value.id),
    title: idOf(value.title),
    description: idOf(value.description),
    courseId,
    lessons: [] as Course["modules"][number]["lessons"],
  };
}

function toCalendarEvent(value: JsonRecord): CalendarEvent {
  const start = idOf(value.startDateTime || value.start);
  const end = idOf(value.endDateTime || value.end);
  return {
    id: idOf(value.id),
    title: idOf(value.title),
    courseCode: "",
    courseTitle: "",
    type: value.eventType || "CLASS",
    date: start.slice(0, 10),
    startTime: start,
    endTime: end,
    location: idOf(value.location),
    description: idOf(value.description),
  };
}

function toNotification(value: JsonRecord): NotificationItem {
  return {
    id: idOf(value.id),
    title: idOf(value.title),
    description: idOf(value.message || value.description),
    timestamp: idOf(value.occurredAt || value.createdAt),
    type: value.type || "ANNOUNCEMENT",
    read: Boolean(value.readAt),
  };
}

export async function loadStudentWorkspace(user: StudentUserSummary) {
  const studentId = idOf(user.keycloakUserId || user.id);
  const profile = toProfile(user);
  const [
    courseResponse,
    enrollmentResponse,
    materialResponse,
    calendarResponse,
    notificationResponse,
    examResponse,
  ] = await Promise.allSettled([
    apiRequest<unknown>("/api/v1/course"),
    apiRequest<unknown>(`/api/v1/enrollments/students/${studentId}/courses`),
    apiRequest<unknown>("/api/v1/materials"),
    apiRequest<unknown>("/api/v1/calendar/upcoming?limit=100"),
    apiRequest<unknown>("/api/v1/notifications?size=100"),
    apiRequest<unknown>("/api/v1/exams/me"),
  ]);

  const enrollments =
    enrollmentResponse.status === "fulfilled" ? listOf<JsonRecord>(enrollmentResponse.value) : [];
  let enrollmentState: StudentEnrollmentState[] = [];
  try {
    enrollmentState = await loadEnrollmentState(studentId);
  } catch {
    // The student-scoped enrollment response above remains the safe fallback.
  }
  const enrollmentRecords = enrollmentState.length
    ? enrollmentState
    : enrollments.map(toEnrollment);
  const enrolledIds = new Set(enrollmentRecords.flatMap((item) => item.courseIds));
  const rawCourses =
    courseResponse.status === "fulfilled" ? listOf<JsonRecord>(courseResponse.value) : [];
  let enrolledCourses: JsonRecord[] = [];
  try {
    enrolledCourses = listOf<JsonRecord>(await apiRequest<unknown>("/api/v1/course/my-courses"));
  } catch {
    // The catalog remains usable when the enrolled-course projection is unavailable.
  }
  const courseById = new Map<string, JsonRecord>();
  [...rawCourses, ...enrolledCourses].forEach((course) => {
    const id = idOf(course.id || course.courseId);
    if (id) courseById.set(id, { ...(courseById.get(id) || {}), ...course });
  });
  const courses = [...courseById.values()].map((course) => toCourse(course, enrolledIds));
  const courseScopedMaterials: LearningMaterial[] = [];
  await Promise.all(
    courses.map(async (course) => {
      try {
        const detail = dataOf<JsonRecord>(
          await apiRequest<JsonRecord>(`/api/v1/course/${course.id}`),
        );
        const mapped = toCourse({ ...detail, enrolled: course.enrolled }, enrolledIds);
        Object.entries(mapped).forEach(([key, value]) => {
          if (key !== "modules" && value !== "" && value !== undefined && value !== null) {
            (course as unknown as JsonRecord)[key] = value;
          }
        });
      } catch {
        // Keep the catalog DTO when a detail record is not available.
      }
    }),
  );
  await Promise.all(
    courses.map(async (course) => {
      try {
        const modules = listOf<JsonRecord>(
          await apiRequest<unknown>(`/api/v1/course/${course.id}/modules`),
        );
        course.modules = await Promise.all(
          modules.map(async (module) => {
            const result = toModuleRecord(module, course.id);
            try {
              const lessons = listOf<JsonRecord>(
                await apiRequest<unknown>(
                  `/api/v1/course/${course.id}/modules/${result.id}/lessons`,
                ),
              );
              result.lessons = await Promise.all(
                lessons.map(async (lesson) => {
                  try {
                    const detail = dataOf<JsonRecord>(
                      await apiRequest<JsonRecord>(
                        `/api/v1/course/${course.id}/modules/${result.id}/lessons/${idOf(lesson.id)}`,
                      ),
                    );
                    return toLesson({ ...lesson, ...detail }, result.id);
                  } catch {
                    return toLesson(lesson, result.id);
                  }
                }),
              );
              try {
                const materials = listOf<JsonRecord>(
                  await apiRequest<unknown>(
                    `/api/v1/course/${course.id}/modules/${result.id}/learning-materials`,
                  ),
                );
                courseScopedMaterials.push(
                  ...materials.map((material) => ({
                    ...toMaterial({ ...material, courseId: course.id }),
                    courseCode: course.code,
                    courseTitle: course.title,
                  })),
                );
              } catch {
                // Material availability follows the published module state.
              }
            } catch {
              /* content can be unavailable while a course is being published */
            }
            return result;
          }),
        );
      } catch {
        /* preserve the course shell when content is unavailable */
      }
    }),
  );
  const courseMap = new Map(courses.map((course) => [course.id, course]));

  let mySubmissions: JsonRecord[] = [];
  try {
    mySubmissions = listOf<JsonRecord>(await apiRequest<unknown>("/api/v1/submissions/my"));
  } catch {
    // Assignment records remain visible when the submission projection is unavailable.
  }
  const submissionsByAssignment = new Map(
    mySubmissions.map((submission) => [idOf(submission.assignmentId), submission]),
  );
  const assignmentShells = (
    await Promise.all(
      courses
        .filter((course) => course.enrolled)
        .map(async (course) => {
          try {
            const response = await apiRequest<unknown>(`/api/v1/courses/${course.id}/assignments`);
            return listOf<JsonRecord>(response).map((item) => toAssignment(item, course));
          } catch {
            return [];
          }
        }),
    )
  ).flat();
  const assignments = await Promise.all(
    assignmentShells.map(async (assignment) => {
      const course = courseMap.get(assignment.courseId);
      let detail: JsonRecord = {};
      let attachments: JsonRecord[] = [];
      try {
        detail =
          dataOf<JsonRecord>(
            await apiRequest<JsonRecord>(`/api/v1/assignments/${assignment.id}`),
          ) || {};
      } catch {
        // Keep the course-scoped assignment when detail retrieval is unavailable.
      }
      try {
        attachments = listOf<JsonRecord>(
          await apiRequest<unknown>(`/api/v1/assignments/${assignment.id}/attachments`),
        );
      } catch {
        // Attachments are optional and do not block assignment details.
      }
      const submission = submissionsByAssignment.get(assignment.id);
      let submittedFiles: JsonRecord[] = [];
      if (submission?.id) {
        try {
          submittedFiles = listOf<JsonRecord>(
            await apiRequest<unknown>(`/api/v1/submissions/${idOf(submission.id)}/files`),
          );
        } catch {
          // File metadata is optional when the submission is still processing.
        }
      }
      const mapped = toAssignment({ ...detail, ...submission }, course);
      const merged: Assignment = { ...assignment };
      Object.entries(mapped).forEach(([key, value]) => {
        if (
          value !== "" &&
          value !== undefined &&
          value !== null &&
          value !== "UNKNOWN" &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          (merged as unknown as JsonRecord)[key] = value;
        }
      });
      return {
        ...merged,
        attachments: attachments.length
          ? attachments.map((item) => ({
              id: idOf(item.id || item.attachmentId),
              name: idOf(item.originalFilename || item.name),
              size: idOf(item.fileSize || item.size),
              url: item.downloadUrl,
            }))
          : assignment.attachments,
        submittedFiles: submittedFiles.length
          ? submittedFiles.map((item) => ({
              name: idOf(item.originalFilename || item.name),
              size: idOf(item.fileSize || item.size),
              uploadedAt: idOf(item.createdAt),
            }))
          : assignment.submittedFiles,
      };
    }),
  );

  const quizzes = (
    await Promise.all(
      courses
        .filter((course) => course.enrolled)
        .map(async (course) => {
          try {
            const response = await apiRequest<unknown>(`/api/courses/${course.id}/quizzes`);
            return listOf<JsonRecord>(response).map(
              (item) =>
                ({
                  id: idOf(item.id),
                  courseId: course.id,
                  courseCode: course.code,
                  courseTitle: course.title,
                  title: idOf(item.title),
                  description: idOf(item.description),
                  durationMinutes: Number(item.durationMinutes ?? 0),
                  questionsCount: Number(item.questions?.length ?? item.questionsCount ?? 0),
                  totalPoints: Number(item.totalMarks ?? 0),
                  status: "AVAILABLE" as const,
                  dueDate: idOf(item.endTime),
                  attemptsAllowed: Number(item.maxAttempts ?? 0),
                  attemptsUsed: 0,
                  questions: [],
                }) satisfies Quiz,
            );
          } catch {
            return [];
          }
        }),
    )
  ).flat();

  return {
    profile,
    courses,
    assignments,
    quizzes,
    examinations:
      examResponse.status === "fulfilled"
        ? listOf<JsonRecord>(examResponse.value).map(
            (item) =>
              ({
                id: idOf(item.examId || item.id),
                courseId: idOf(item.courseId),
                courseCode: "",
                courseTitle: "",
                title: idOf(item.title),
                type: item.type || "FINAL",
                scheduledDate: idOf(item.examDate),
                startTime: "",
                durationMinutes: 0,
                location: "",
                proctorName: "",
                status: item.examStatus === "COMPLETED" ? "COMPLETED" : "UPCOMING",
                totalMarks: Number(item.totalMarks ?? 0),
                weightPercentage: 0,
                rules: [],
                score: item.marksObtained,
                letterGrade: item.grade,
              }) satisfies Examination,
          )
        : [],
    materials: [
      ...courseScopedMaterials,
      ...(materialResponse.status === "fulfilled"
        ? listOf<JsonRecord>(materialResponse.value)
            .map(toMaterial)
            .map((material) => ({
              ...material,
              courseCode: courseMap.get(material.courseId)?.code || "",
              courseTitle: courseMap.get(material.courseId)?.title || "",
            }))
        : []),
    ].filter((material, index, all) => all.findIndex((item) => item.id === material.id) === index),
    calendarEvents:
      calendarResponse.status === "fulfilled"
        ? listOf<JsonRecord>(calendarResponse.value).map(toCalendarEvent)
        : [],
    notifications:
      notificationResponse.status === "fulfilled"
        ? listOf<JsonRecord>(notificationResponse.value).map(toNotification)
        : [],
  };
}

export async function enrollStudent(courseId: string, studentId: string) {
  const alreadyEnrolled = await checkEnrollmentExists(studentId, courseId);
  if (alreadyEnrolled) throw new Error("You are already enrolled in this course.");
  return apiRequest<unknown>("/api/v1/enrollments/me", {
    method: "POST",
    body: { studentId, courseId },
  });
}

export async function createEnrollment(courseId: string, studentId: string) {
  return apiRequest<unknown>("/api/v1/enrollments", {
    method: "POST",
    body: { studentId, courseId },
  });
}

export async function startCoursePayment(courseId: string) {
  return apiRequest<unknown>("/api/v1/payments/course", {
    method: "POST",
    body: { courseId },
  });
}

export async function checkEnrollmentExists(studentId: string, courseId: string) {
  return apiRequest<boolean>(
    `/api/v1/enrollments/students/${studentId}/courses/${courseId}/exists`,
  );
}

export async function loadEnrollmentState(studentId: string) {
  const [studentCoursesResponse, allEnrollmentsResponse] = await Promise.allSettled([
    apiRequest<unknown>(`/api/v1/enrollments/students/${studentId}/courses`),
    apiRequest<unknown>("/api/v1/enrollments"),
  ]);
  const studentCourses =
    studentCoursesResponse.status === "fulfilled"
      ? listOf<JsonRecord>(studentCoursesResponse.value).map(toEnrollment)
      : [];
  const allEnrollments =
    allEnrollmentsResponse.status === "fulfilled"
      ? listOf<JsonRecord>(allEnrollmentsResponse.value)
          .map(toEnrollment)
          .filter((enrollment) => !enrollment.studentId || enrollment.studentId === studentId)
      : [];
  const records = [...studentCourses, ...allEnrollments];
  return records.filter(
    (record, index) =>
      records.findIndex((item) => item.id && item.id === record.id) === index || !record.id,
  );
}

export async function createAssignmentSubmission(assignmentId: string, content: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/v1/assignments/${assignmentId}/submissions`, {
    method: "POST",
    body: { content },
  });
}

export async function uploadSubmissionFile(submissionId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiUpload<ApiEnvelope<JsonRecord>>(`/api/v1/submissions/${submissionId}/files`, form);
}

export async function finalizeAssignmentSubmission(submissionId: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/v1/submissions/${submissionId}/submit`, {
    method: "POST",
  });
}

export async function updateAssignmentSubmission(submissionId: string, content: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/v1/submissions/${submissionId}`, {
    method: "PUT",
    body: { content },
  });
}

export async function listMySubmissions() {
  return apiRequest<unknown>("/api/v1/submissions/my");
}

export async function listAssignmentAttachments(assignmentId: string) {
  return apiRequest<unknown>(`/api/v1/assignments/${assignmentId}/attachments`);
}

export async function downloadAssignmentAttachment(assignmentId: string, attachmentId: string) {
  return apiRequest<unknown>(
    `/api/v1/assignments/${assignmentId}/attachments/${attachmentId}/download`,
  );
}

export async function deleteAssignmentAttachment(assignmentId: string, attachmentId: string) {
  return apiRequest<unknown>(`/api/v1/assignments/${assignmentId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
}

export async function listSubmissionFiles(submissionId: string) {
  return apiRequest<unknown>(`/api/v1/submissions/${submissionId}/files`);
}

export async function downloadSubmissionFile(submissionId: string, fileId: string) {
  return apiRequest<unknown>(`/api/v1/submissions/${submissionId}/files/${fileId}/download`);
}

export async function deleteSubmissionFile(submissionId: string, fileId: string) {
  return apiRequest<unknown>(`/api/v1/submissions/${submissionId}/files/${fileId}`, {
    method: "DELETE",
  });
}

export async function startQuizAttempt(quizId: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/quizzes/${quizId}/attempts`, { method: "POST" });
}

export async function saveQuizAnswers(attemptId: string, answers: Record<string, string[]>) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/quiz-attempts/${attemptId}/answers`, {
    method: "PUT",
    body: { answers },
  });
}

export async function finalizeQuizAttempt(attemptId: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/quiz-attempts/${attemptId}/submit`, {
    method: "POST",
  });
}

export async function markLesson(courseId: string, lessonId: string, complete: boolean) {
  return apiRequest<unknown>(`/api/v1/progress/courses/${courseId}/lessons/${lessonId}`, {
    method: "PUT",
    body: { completed: complete },
  });
}

export async function markNotificationRead(id: string) {
  return apiRequest<unknown>(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return apiRequest<unknown>("/api/v1/notifications/read-all", { method: "PATCH" });
}

export async function sendAiMessage(query: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>("/api/ai/chat", {
    method: "POST",
    body: { message: query },
  });
}

export { toProfile };
