import { apiBlob, apiRequest, apiUpload } from "./client";
import type {
  Assignment,
  AttendanceSummary,
  CalendarEvent,
  Course,
  Examination,
  LearningMaterial,
  Conversation,
  Message,
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
export type JsonRecord = Record<string, any>;

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

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const readableName = (value: unknown, fallback = "") => {
  const name = idOf(value).trim();
  return name && !isUuid(name) ? name : fallback;
};

function toProfile(user: StudentUserSummary): StudentProfile {
  const record = user as JsonRecord;
  const studentProfile = (record.studentProfile || record.profile || {}) as JsonRecord;
  return {
    id: idOf(user.keycloakUserId || user.id),
    studentId: idOf(
      studentProfile.studentId ||
        record.studentId ||
        record.studentNumber ||
        record.studentCode ||
        "",
    ),
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    email: user.email,
    emailVerified: user.emailVerified !== false,
    avatar: idOf(studentProfile.avatarUrl || record.avatar || record.profileImage),
    role: "STUDENT",
    institution: idOf(studentProfile.schoolName || record.institution || record.schoolName),
    department: idOf(record.department || studentProfile.department),
    degreeProgram: idOf(record.degreeProgram || studentProfile.degreeProgram),
    semester: idOf(record.semester || studentProfile.semester),
    currentGpa: Number(record.currentGpa ?? 0),
    creditsCompleted: Number(record.creditsCompleted ?? 0),
    totalCreditsRequired: Number(record.totalCreditsRequired ?? 0),
    academicAdvisor: {
      name: idOf(record.academicAdvisorName),
      email: idOf(record.academicAdvisorEmail),
      office: idOf(record.academicAdvisorOffice),
    },
    phone: idOf(
      record.phoneNumber || record.phone || studentProfile.phoneNumber || studentProfile.phone,
    ),
    bio: idOf(studentProfile.bio || studentProfile.biography || record.bio),
    joinedDate: idOf(record.joinedDate || record.createdAt),
  };
}

const profileImageUrls = new Map<string, string>();

async function resolveProfileAvatar(profile: StudentProfile): Promise<StudentProfile> {
  const storageKey = profile.avatar;
  if (!storageKey || !storageKey.startsWith("materials/profile-images/")) return profile;
  const cachedUrl = profileImageUrls.get(storageKey);
  if (cachedUrl) return { ...profile, avatar: cachedUrl };
  try {
    const blob = await apiBlob(`/api/v1/profile-images?key=${encodeURIComponent(storageKey)}`);
    const objectUrl = URL.createObjectURL(blob);
    profileImageUrls.set(storageKey, objectUrl);
    return { ...profile, avatar: objectUrl };
  } catch {
    return { ...profile, avatar: "" };
  }
}

function toTeacher(value: JsonRecord | undefined): Teacher {
  return {
    id: idOf(value?.id || value?.teacherId || value?.assignedTeacherId),
    name: readableName(value?.name || value?.fullName),
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
    code: idOf(value.courseCode || value.code || value.courseName),
    title: idOf(value.courseName || value.title),
    category: idOf(value.subject || value.category),
    description: idOf(value.courseDescription || value.description),
    instructor: toTeacher(
      value.instructor ||
        value.teacher ||
        (value.assignedTeacherId
          ? { id: value.assignedTeacherId, fullName: value.teacherName }
          : undefined),
    ),
    bannerColor: idOf(value.bannerColor),
    coverImage: idOf(value.courseThumbnail || value.coverImage),
    enrolled: enrolledIds.has(id) || Boolean(value.enrolled),
    enrollmentStatus: enrolledIds.has(id) ? "ACTIVE" : "AVAILABLE",
    progressPercentage: Number(value.progressPercentage ?? value.progress ?? 0),
    lastAccessedLessonId: idOf(value.lastAccessedLessonId),
    lastAccessedLessonTitle: idOf(value.lastAccessedLessonTitle),
    credits: Number(value.credits ?? value.creditCount ?? 0),
    level: idOf(value.level),
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
  const submissionStatus = String(value.submissionStatus || "").toUpperCase();
  const assignmentStatus = String(value.assignmentStatus || value.status || "").toUpperCase();
  const status = submissionStatus || assignmentStatus || "UNKNOWN";
  const mappedStatus =
    status === "DRAFT" || status === "PUBLISHED" || status === "ASSIGNED"
      ? "PENDING"
      : status === "UNDER_REVIEW"
        ? "SUBMITTED"
        : status === "RETURNED"
          ? "GRADED"
          : ["PENDING", "SUBMITTED", "GRADED", "OVERDUE"].includes(status)
            ? status
            : "UNKNOWN";
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
    status: mappedStatus as Assignment["status"],
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
  const type = String(value.type || "DOCUMENT").toUpperCase();
  const materialType = ["PDF", "VIDEO", "CODE", "SLIDES", "DOCUMENT"].includes(type)
    ? type
    : type === "PRESENTATION"
      ? "SLIDES"
      : "DOCUMENT";
  const bytes = Number(value.fileSize);
  const fileSize = Number.isFinite(bytes)
    ? bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.max(1, Math.round(bytes / 1024))} KB`
    : "";
  return {
    id: idOf(value.id || value.materialId),
    courseId: idOf(value.courseId),
    courseCode: "",
    courseTitle: "",
    title: idOf(value.title),
    description: idOf(value.description),
    type: materialType as LearningMaterial["type"],
    fileSize,
    uploadedDate: idOf(value.createdAt || value.uploadedDate),
  };
}

function toQuizQuestion(value: JsonRecord): Quiz["questions"][number] {
  return {
    id: idOf(value.id),
    prompt: idOf(value.questionText),
    type: "multiple-choice",
    options: (Array.isArray(value.options) ? value.options : []).map((option: JsonRecord) => ({
      id: idOf(option.id),
      text: idOf(option.optionText),
    })),
    points: Number(value.marks ?? 0),
  };
}

function toQuiz(value: JsonRecord, course?: Course): Quiz {
  const questions = Array.isArray(value.questions) ? value.questions.map(toQuizQuestion) : [];
  const endTime = idOf(value.endTime);
  const rawStatus = String(value.status ?? "").toUpperCase();
  const status =
    rawStatus === "PUBLISHED" ? "AVAILABLE" : rawStatus === "CLOSED" ? "COMPLETED" : rawStatus;
  return {
    id: idOf(value.id),
    courseId: idOf(value.courseId || course?.id),
    courseCode: course?.code || "",
    courseTitle: course?.title || "",
    title: idOf(value.title),
    description: idOf(value.description),
    durationMinutes: Number(value.durationMinutes ?? 0),
    questionsCount: questions.length,
    totalPoints: Number(value.totalMarks ?? 0),
    startTime: idOf(value.startTime),
    status: ["AVAILABLE", "UPCOMING", "COMPLETED", "IN_PROGRESS"].includes(status)
      ? (status as Quiz["status"])
      : "UNKNOWN",
    dueDate: endTime,
    attemptsAllowed: Number(value.maxAttempts ?? 0),
    attemptsUsed: Number(value.attemptsUsed ?? 0),
    lastScore: value.lastScore == null ? undefined : Number(value.lastScore),
    lastScorePercentage:
      value.lastScorePercentage == null ? undefined : Number(value.lastScorePercentage),
    showResultImmediately: value.showResultImmediately ?? value.showResultsImmediately ?? true,
    questions,
  };
}

function toLesson(value: JsonRecord, moduleId: string, order?: number) {
  const rawType = String(value.type || value.contentType || "reading").toLowerCase();
  const type = rawType.includes("video")
    ? "video"
    : rawType.includes("interactive")
      ? "interactive"
      : rawType.includes("exercise")
        ? "exercise"
        : "reading";
  return {
    id: idOf(value.id),
    moduleId,
    order: Number(value.sequenceOrder ?? value.order ?? order ?? 0),
    title: idOf(value.title),
    description: idOf(value.description),
    durationMinutes: Number(value.durationMinutes ?? 0),
    type,
    contentType: idOf(value.contentType || value.type || "Reading"),
    releaseDate: idOf(value.releaseDate),
    completed: Boolean(value.completed),
    videoUrl: value.videoUrl,
    content: idOf(value.content || value.description),
  } as Course["modules"][number]["lessons"][number];
}

function toModuleRecord(value: JsonRecord, courseId: string) {
  return {
    id: idOf(value.id),
    order: Number(value.sequenceOrder ?? value.order ?? 0),
    title: idOf(value.title),
    description: idOf(value.description),
    status: (value.visible === false || value.isVisible === false ? "Draft" : "Published") as
      | "Draft"
      | "Published",
    startDate: idOf(value.startDate),
    endDate: idOf(value.endDate),
    courseId,
    lessons: [] as Course["modules"][number]["lessons"],
  };
}

export function toCalendarEvent(value: JsonRecord): CalendarEvent {
  const start = idOf(value.startDateTime || value.start);
  const end = idOf(value.endDateTime || value.end);
  const type = String(value.eventType || "CLASS").toUpperCase();
  const mappedType = type === "ASSIGNMENT" ? "ASSIGNMENT_DUE" : type;
  const parsedStart = start ? new Date(start) : null;
  const parsedEnd = end ? new Date(end) : null;
  const formatDate = (value: Date | null) =>
    value && !Number.isNaN(value.getTime()) ? new Intl.DateTimeFormat("en-CA").format(value) : "";
  const formatTime = (value: Date | null) =>
    value && !Number.isNaN(value.getTime())
      ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(value)
      : "";
  return {
    id: idOf(value.id),
    title: idOf(value.title),
    courseId: idOf(value.courseId),
    courseCode: "",
    courseTitle: "",
    type: ["CLASS", "ASSIGNMENT_DUE", "QUIZ", "EXAM", "OFFICE_HOURS", "ATTENDANCE"].includes(
      mappedType,
    )
      ? (mappedType as CalendarEvent["type"])
      : "CLASS",
    date: formatDate(parsedStart),
    startTime: formatTime(parsedStart),
    endTime: formatTime(parsedEnd),
    location: idOf(value.location),
    description: idOf(value.description),
  };
}

function toNotification(value: JsonRecord): NotificationItem {
  const type = String(value.type || "ANNOUNCEMENT").toUpperCase();
  return {
    id: idOf(value.id),
    title: idOf(value.title),
    description: idOf(value.message || value.description),
    timestamp: idOf(value.occurredAt || value.createdAt),
    type: ["DEADLINE", "GRADE", "ANNOUNCEMENT", "EXAM", "MATERIAL"].includes(type)
      ? (type as NotificationItem["type"])
      : "ANNOUNCEMENT",
    read: Boolean(value.readAt),
  };
}

function toAttendanceSummary(value: JsonRecord): AttendanceSummary {
  return {
    studentId: idOf(value.studentId),
    courseId: idOf(value.courseId),
    completedSessions: Number(value.completedSessions ?? 0),
    presentCount: Number(value.presentCount ?? 0),
    lateCount: Number(value.lateCount ?? 0),
    absentCount: Number(value.absentCount ?? 0),
    attendedCount: Number(value.attendedCount ?? 0),
    attendancePercentage: Number(value.attendancePercentage ?? 0),
  };
}

function toExamination(value: JsonRecord): Examination {
  const startTime = idOf(value.startTime);
  const endTime = idOf(value.endTime);
  const startMinutes = startTime ? timeToMinutes(startTime) : 0;
  const endMinutes = endTime ? timeToMinutes(endTime) : 0;
  const durationMinutes = endMinutes > startMinutes ? endMinutes - startMinutes : 0;
  const rawStatus = String(value.status || value.examStatus || "UNKNOWN").toUpperCase();
  return {
    id: idOf(value.examId || value.id),
    courseId: idOf(value.courseId),
    courseCode: "",
    courseTitle: "",
    title: idOf(value.title),
    type: ["MIDTERM", "FINAL", "COMPREHENSIVE"].includes(String(value.type).toUpperCase())
      ? (String(value.type).toUpperCase() as Examination["type"])
      : "FINAL",
    scheduledDate: idOf(value.examDate),
    startTime,
    durationMinutes,
    location: idOf(value.location),
    proctorName: idOf(value.proctorName),
    status: ["UPCOMING", "IN_PROGRESS", "COMPLETED"].includes(rawStatus)
      ? (rawStatus as Examination["status"])
      : "UNKNOWN",
    totalMarks: Number(value.totalMarks ?? 0),
    weightPercentage: Number(value.weightPercentage ?? 0),
    rules: [],
    score: value.marksObtained,
    letterGrade: value.grade,
  };
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : 0;
}

export function toCommunicationMessage(
  value: JsonRecord,
  studentId: string,
  senderNames?: Map<string, string>,
): Message {
  const attachments = Array.isArray(value.attachments)
    ? value.attachments.map((attachment) => {
        const item = attachment as JsonRecord;
        return {
          id: idOf(item.id),
          name: idOf(item.originalFilename),
          size: `${Math.ceil(Number(item.fileSize || 0) / 1024)} KB`,
          contentType: idOf(item.contentType),
        };
      })
    : [];
  const senderId = idOf(value.senderId);
  const senderName =
    readableName(
      value.senderName || value.senderFullName || value.sender?.fullName || value.sender?.name,
    ) ||
    readableName(senderNames?.get(senderId)) ||
    (senderId === studentId ? "You" : "Course participant");
  return {
    id: idOf(value.id),
    senderId,
    senderName,
    senderAvatar: "",
    isSenderStudent: senderId === studentId,
    timestamp: idOf(value.sentAt),
    text: value.deletedForEveryone ? "Message deleted" : idOf(value.content),
    attachments,
  };
}

function toConversation(
  value: JsonRecord,
  course: Course | undefined,
  messages: JsonRecord[],
  members: JsonRecord[],
  studentId: string,
  studentName: string,
): Conversation {
  const senderNames = new Map<string, string>([[studentId, studentName || "You"]]);
  const instructorId = course?.instructor.id;
  if (instructorId && course.instructor.name) senderNames.set(instructorId, course.instructor.name);
  const mappedMessages = messages
    .map((message) => toCommunicationMessage(message, studentId, senderNames))
    .reverse();
  const lastMessage = mappedMessages[mappedMessages.length - 1];
  return {
    id: idOf(value.id),
    participantId: idOf(value.id),
    participantName:
      readableName(course?.instructor.name) ||
      readableName(value.name) ||
      readableName(course?.title, "Course instructor"),
    participantTitle: course?.title || idOf(value.description),
    participantAvatar: "",
    studentMessagingEnabled: value.studentMessagingEnabled !== false,
    courseCode: course?.code,
    unreadCount: undefined,
    lastMessage: lastMessage?.text || "",
    lastMessageTime: lastMessage?.timestamp || "",
    messages: mappedMessages,
    members: members.map((member) => ({
      userId: idOf(member.userId),
      role: idOf(member.role),
      joinedAt: idOf(member.joinedAt),
    })),
  };
}

export async function loadStudentWorkspace(user: StudentUserSummary) {
  const studentId = idOf(user.keycloakUserId || user.id);
  const [
    currentUserResponse,
    courseResponse,
    enrollmentResponse,
    materialResponse,
    calendarResponse,
    notificationResponse,
    unreadNotificationResponse,
    examResponse,
    upcomingExamResponse,
  ] = await Promise.allSettled([
    apiRequest<ApiEnvelope<JsonRecord>>("/api/v1/users/me"),
    apiRequest<unknown>("/api/v1/course"),
    apiRequest<unknown>(`/api/v1/enrollments/students/${studentId}/courses`),
    apiRequest<unknown>("/api/v1/materials"),
    apiRequest<unknown>("/api/v1/calendar/upcoming?limit=100"),
    apiRequest<unknown>("/api/v1/notifications?size=100"),
    apiRequest<unknown>("/api/v1/notifications/unread-count"),
    apiRequest<unknown>("/api/v1/exams/me"),
    apiRequest<unknown>("/api/v1/exams/me/upcoming"),
  ]);

  const currentUser =
    currentUserResponse.status === "fulfilled"
      ? dataOf<JsonRecord>(currentUserResponse.value)
      : null;
  const profile = await resolveProfileAvatar(
    toProfile(
      (currentUser
        ? {
            ...user,
            ...currentUser,
            // Keep the authenticated identity used by course/enrollment APIs.
            id: user.id,
            keycloakUserId: user.keycloakUserId || currentUser.authUserId,
          }
        : user) as StudentUserSummary,
    ),
  );

  const enrollmentValues =
    enrollmentResponse.status === "fulfilled" ? listOf<unknown>(enrollmentResponse.value) : [];
  const enrollments = enrollmentValues.filter(
    (value): value is JsonRecord => Boolean(value) && typeof value === "object",
  );
  // The student enrollment endpoint returns a plain UUID array, not enrollment
  // objects. Preserve those IDs so the course lookup is driven by membership.
  const directEnrolledIds = enrollmentValues
    .filter((value): value is string => typeof value === "string")
    .map(idOf)
    .filter(Boolean);
  let enrollmentState: StudentEnrollmentState[] = [];
  try {
    enrollmentState = await loadEnrollmentState(studentId);
  } catch {
    // The student-scoped enrollment response above remains the safe fallback.
  }
  const enrollmentRecords = enrollmentState.length
    ? enrollmentState
    : enrollments.map(toEnrollment);
  const enrolledIds = new Set([
    ...directEnrolledIds,
    ...enrollmentRecords.flatMap((item) => item.courseIds),
  ]);
  const rawCourses =
    courseResponse.status === "fulfilled" ? listOf<JsonRecord>(courseResponse.value) : [];
  let enrolledCourses: JsonRecord[] = [];
  try {
    enrolledCourses = listOf<JsonRecord>(await apiRequest<unknown>("/api/v1/course/my-courses"));
  } catch {
    // This endpoint is teacher-scoped. Student course details are loaded below
    // through the student-authorized lookup endpoint instead.
  }
  const enrolledCourseDetails = (
    await Promise.all(
      [...enrolledIds].map(async (courseId) => {
        try {
          return dataOf<JsonRecord>(
            await apiRequest<JsonRecord>(`/api/v1/course/${courseId}/lookup`),
          );
        } catch {
          return null;
        }
      }),
    )
  ).filter((course): course is JsonRecord => Boolean(course));
  const courseById = new Map<string, JsonRecord>();
  [...rawCourses, ...enrolledCourses, ...enrolledCourseDetails].forEach((course) => {
    const id = idOf(course.id || course.courseId);
    if (id) courseById.set(id, { ...(courseById.get(id) || {}), ...course });
  });
  const courses = [...courseById.values()].map((course) => toCourse(course, enrolledIds));
  const courseScopedMaterials: LearningMaterial[] = [];
  await Promise.all(
    courses.map(async (course) => {
      try {
        const detail = dataOf<JsonRecord>(
          await apiRequest<JsonRecord>(`/api/v1/course/${course.id}/lookup`),
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
                lessons.map(async (lesson, lessonIndex) => {
                  try {
                    const detail = dataOf<JsonRecord>(
                      await apiRequest<JsonRecord>(
                        `/api/v1/course/${course.id}/modules/${result.id}/lessons/${idOf(lesson.id)}`,
                      ),
                    );
                    return toLesson({ ...lesson, ...detail }, result.id, lessonIndex + 1);
                  } catch {
                    return toLesson(lesson, result.id, lessonIndex + 1);
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

  // Course responses store the assigned teacher as an ID. Resolve the
  // display name once so communication messages never expose that UUID.
  const teacherIds = Array.from(
    new Set(courses.map((course) => course.instructor.id).filter(Boolean)),
  );
  await Promise.all(
    teacherIds.map(async (teacherId) => {
      try {
        const response = dataOf<JsonRecord>(
          await apiRequest<JsonRecord>(`/api/v1/users/teachers/${teacherId}/lookup`),
        );
        const teacherName = idOf(
          response.fullName || [response.firstName, response.lastName].filter(Boolean).join(" "),
        );
        if (!teacherName) return;
        courses.forEach((course) => {
          if (course.instructor.id === teacherId) course.instructor.name = teacherName;
        });
      } catch {
        // Keep the course available if profile lookup is temporarily unavailable.
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
  let assignmentShells: Assignment[] = [];
  try {
    const response = await apiRequest<unknown>("/api/v1/assignments/me?size=100");
    assignmentShells = listOf<JsonRecord>(response).map((item) =>
      toAssignment(item, courseMap.get(idOf(item.courseId))),
    );
  } catch {
    assignmentShells = [];
  }
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

  const attendanceSummaries = (
    await Promise.all(
      courses
        .filter((course) => course.enrolled)
        .map(async (course) => {
          try {
            return toAttendanceSummary(
              dataOf<JsonRecord>(
                await apiRequest<JsonRecord>(`/api/v1/attendance/courses/${course.id}/me`),
              ),
            );
          } catch {
            return null;
          }
        }),
    )
  ).filter((summary): summary is AttendanceSummary => summary !== null);

  let communicationGroups: JsonRecord[] = [];
  try {
    communicationGroups = listOf<JsonRecord>(
      await apiRequest<unknown>("/api/communication/groups"),
    );
  } catch {
    // Communication is optional; the rest of the student workspace remains usable.
  }
  const conversations = (
    await Promise.all(
      communicationGroups.map(async (group) => {
        const course = courseMap.get(idOf(group.courseId));
        const [membersResponse, messagesResponse] = await Promise.allSettled([
          apiRequest<unknown>(`/api/communication/groups/${idOf(group.id)}/members`),
          apiRequest<unknown>(
            `/api/communication/groups/${idOf(group.id)}/messages?page=0&size=30`,
          ),
        ]);
        return toConversation(
          group,
          course,
          messagesResponse.status === "fulfilled" ? listOf<JsonRecord>(messagesResponse.value) : [],
          membersResponse.status === "fulfilled" ? listOf<JsonRecord>(membersResponse.value) : [],
          studentId,
          profile.name,
        );
      }),
    )
  ).filter((conversation): conversation is Conversation => conversation !== null);

  // Some communication records contain only senderId, even when the course
  // has teacher metadata. Resolve every sender ID found in the loaded history
  // so old messages are displayed with names as well as new live messages.
  const senderIds = Array.from(
    new Set(
      conversations
        .flatMap((conversation) => conversation.messages.map((message) => message.senderId))
        .filter((senderId) => senderId && senderId !== studentId),
    ),
  );
  const senderNames = new Map<string, string>([[studentId, profile.name || "You"]]);
  await Promise.all(
    senderIds.map(async (senderId) => {
      try {
        const response = dataOf<JsonRecord>(
          await apiRequest<JsonRecord>(`/api/v1/users/teachers/${senderId}/lookup`),
        );
        const name = idOf(
          response.fullName || [response.firstName, response.lastName].filter(Boolean).join(" "),
        );
        if (name) senderNames.set(senderId, name);
      } catch {
        // The sender may be a student or the profile service may be unavailable.
      }
    }),
  );
  conversations.forEach((conversation) => {
    conversation.messages = conversation.messages.map((message) => ({
      ...message,
      senderName:
        senderNames.get(message.senderId) ||
        (message.isSenderStudent ? profile.name || "You" : "Course participant"),
    }));
  });

  const quizzes = (
    await Promise.all(
      courses
        .filter((course) => course.enrolled)
        .map(async (course) => {
          try {
            const response = await apiRequest<unknown>(`/api/courses/${course.id}/quizzes`);
            const quizShells = listOf<JsonRecord>(response).map((item) => toQuiz(item, course));
            return Promise.all(
              quizShells.map(async (quiz) => {
                try {
                  const detail = dataOf<JsonRecord>(
                    await apiRequest<JsonRecord>(`/api/quizzes/${quiz.id}/student`),
                  );
                  return { ...quiz, ...toQuiz({ ...detail, courseId: course.id }, course) };
                } catch {
                  return quiz;
                }
              }),
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
    attendanceSummaries,
    conversations,
    examinations: Array.from(
      new Map(
        [
          ...(examResponse.status === "fulfilled"
            ? listOf<JsonRecord>(examResponse.value).map(toExamination)
            : []),
          ...(upcomingExamResponse.status === "fulfilled"
            ? listOf<JsonRecord>(upcomingExamResponse.value).map(toExamination)
            : []),
        ].map((exam) => [exam.id, exam] as const),
      ).values(),
    ).map((exam) => {
      const course = courseMap.get(exam.courseId);
      return { ...exam, courseCode: course?.code || "", courseTitle: course?.title || "" };
    }),
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
        ? listOf<JsonRecord>(calendarResponse.value).map((item) => {
            const event = toCalendarEvent(item);
            const course = courseMap.get(event.courseId || "");
            return { ...event, courseCode: course?.code || "", courseTitle: course?.title || "" };
          })
        : [],
    notifications:
      notificationResponse.status === "fulfilled"
        ? listOf<JsonRecord>(notificationResponse.value).map(toNotification)
        : [],
    unreadNotificationCount:
      unreadNotificationResponse.status === "fulfilled"
        ? Number(dataOf<unknown>(unreadNotificationResponse.value) ?? 0)
        : 0,
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
  return apiUpload<ApiEnvelope<JsonRecord>>(
    `/api/v1/submissions/${submissionId}/files/upload`,
    form,
  );
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

export async function getStudentQuiz(quizId: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/quizzes/${quizId}/student`);
}

export async function saveQuizAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/quiz-attempts/${attemptId}/answers`, {
    method: "PUT",
    body: { questionId, selectedOptionId },
  });
}

export async function finalizeQuizAttempt(attemptId: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/quiz-attempts/${attemptId}/submit`, {
    method: "POST",
  });
}

export async function listCalendarEvents(
  start: string,
  end: string,
  filters: { type?: string; courseId?: string } = {},
) {
  const params = new URLSearchParams({ start, end });
  if (filters.type) params.set("type", filters.type);
  if (filters.courseId) params.set("courseId", filters.courseId);
  const response = await apiRequest<unknown>(`/api/v1/calendar/events?${params.toString()}`);
  return listOf<JsonRecord>(response).map(toCalendarEvent);
}

export async function getMaterialDownload(materialId: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/v1/materials/${materialId}/download`);
}

export async function markLesson(_courseId: string, lessonId: string, complete: boolean) {
  return apiRequest<unknown>(`/api/v1/progress/lessons/${lessonId}`, {
    method: "PUT",
    body: { completed: complete },
  });
}

export async function updateCurrentStudentProfile(updates: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  return apiRequest<unknown>("/api/v1/users/me", { method: "PATCH", body: updates });
}

export async function uploadProfileImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiUpload<ApiEnvelope<{ storageKey: string; contentType: string }>>(
    "/api/v1/profile-images",
    form,
  );
}

export async function markNotificationRead(id: string) {
  return apiRequest<unknown>(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return apiRequest<unknown>("/api/v1/notifications/read-all", { method: "PATCH" });
}

export async function getUnreadNotificationCount() {
  return apiRequest<ApiEnvelope<number>>("/api/v1/notifications/unread-count");
}

export async function deleteNotification(id: string) {
  return apiRequest<unknown>(`/api/v1/notifications/${id}`, { method: "DELETE" });
}

export async function listCommunicationGroups() {
  return apiRequest<unknown>("/api/communication/groups");
}

export async function listCommunicationMembers(groupId: string) {
  return apiRequest<unknown>(`/api/communication/groups/${groupId}/members`);
}

export async function listCommunicationMessages(groupId: string, page = 0, size = 30) {
  return apiRequest<unknown>(
    `/api/communication/groups/${groupId}/messages?page=${page}&size=${size}`,
  );
}

export async function sendCommunicationMessage(groupId: string, content: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>(`/api/communication/groups/${groupId}/messages`, {
    method: "POST",
    body: { content },
  });
}

export async function getCommunicationAttachmentDownload(
  groupId: string,
  messageId: string,
  attachmentId: string,
) {
  return apiRequest<ApiEnvelope<JsonRecord>>(
    `/api/communication/groups/${groupId}/messages/${messageId}/attachments/${attachmentId}/download`,
  );
}

export async function updateCommunicationMessage(
  groupId: string,
  messageId: string,
  content: string,
) {
  return apiRequest<ApiEnvelope<JsonRecord>>(
    `/api/communication/groups/${groupId}/messages/${messageId}`,
    { method: "PATCH", body: { content } },
  );
}

export async function deleteCommunicationMessage(
  groupId: string,
  messageId: string,
  scope: "ME" | "EVERYONE" = "ME",
) {
  return apiRequest<unknown>(
    `/api/communication/groups/${groupId}/messages/${messageId}?scope=${scope}`,
    { method: "DELETE" },
  );
}

export async function listAiConversations() {
  return apiRequest<unknown>("/api/ai/conversations");
}

export async function createAiConversation(title?: string) {
  return apiRequest<ApiEnvelope<JsonRecord>>("/api/ai/conversations", {
    method: "POST",
    body: title ? { title } : {},
  });
}

export async function listAiConversationMessages(conversationId: string) {
  return apiRequest<unknown>(`/api/ai/conversations/${conversationId}/messages`);
}

export async function sendAiMessage(
  conversationId: string,
  message: string,
  clientMessageId?: string,
) {
  return apiRequest<ApiEnvelope<JsonRecord>>("/api/ai/chat", {
    method: "POST",
    body: { conversationId, message, clientMessageId },
  });
}

export { toProfile };
