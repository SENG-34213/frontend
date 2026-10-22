import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./admin/layouts/AdminLayout";
import { AdminRoute } from "./admin/components/AdminSidebar";
import { ToastMessage } from "./admin/components/ToastContainer";
import {
  AdminRole,
  StudentProfile,
  TeacherProfile,
  AdministratorProfile,
  Course,
  EnrollmentRecord,
  CurriculumModule,
  Assignment,
  Quiz,
  Examination,
  GradeRecord,
  Grade,
  CreateGradeRequest,
  UpdateGradeRequest,
  AttendanceSession,
  LearningMaterial,
  AcademicEvent,
  NotificationItem,
  AuditEvent,
  PlatformKPIs,
} from "./admin/types";
import {
  INITIAL_KPIS,
  MOCK_STUDENTS,
  MOCK_TEACHERS,
  MOCK_ADMINISTRATORS,
  MOCK_COURSES,
  MOCK_ENROLLMENTS,
  MOCK_CURRICULUM,
  MOCK_ASSIGNMENTS,
  MOCK_QUIZZES,
  MOCK_EXAMINATIONS,
  MOCK_GRADES,
  MOCK_ATTENDANCE_SESSIONS,
  MOCK_MATERIALS,
  MOCK_EVENTS,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
} from "./admin/mockData";

// Screens
import { AdminDashboard } from "./admin/dashboard/AdminDashboard";
import { StudentManagement } from "./admin/students/StudentManagement";
import { TeacherManagement } from "./admin/teachers/TeacherManagement";
import { AdminManagement } from "./admin/administrators/AdminManagement";
import { RegistrationsAndInvitations } from "./admin/registrations/RegistrationsAndInvitations";
import { CourseManagement } from "./admin/courses/CourseManagement";
import { EnrollmentManagement } from "./admin/enrollments/EnrollmentManagement";
import { CurriculumManagement } from "./admin/academic/CurriculumManagement";
import { AssignmentOversight } from "./admin/assignments/AssignmentOversight";
import { QuizManagement } from "./admin/quizzes/QuizManagement";
import { ExaminationManagement } from "./admin/examinations/ExaminationManagement";
import { GradesAndResults } from "./admin/grades/GradesAndResults";
import { GradeManagement } from "./admin/grades/GradeManagement";
import { AttendanceManagement } from "./admin/attendance/AttendanceManagement";
import { LearningMaterialManagement } from "./admin/materials/LearningMaterialManagement";
import { AdminCalendar } from "./admin/calendar/AdminCalendar";
import { CommunicationManagement } from "./admin/communication/CommunicationManagement";
import { NotificationCenter } from "./admin/notifications/NotificationCenter";
import { MentifyAIAssistant } from "./admin/ai-assistant/MentifyAIAssistant";
import { AnalyticsDashboard } from "./admin/analytics/AnalyticsDashboard";
import { ReportsManagement } from "./admin/reports/ReportsManagement";
import { AuditAndActivity } from "./admin/audit/AuditAndActivity";
import { AdminProfile } from "./admin/profile/AdminProfile";
import { AdminSettings } from "./admin/settings/AdminSettings";
import { AdminLoginView } from "./admin/auth/AdminLoginView";
import { changeAdminPassword, logoutAdmin, refreshAdminSession } from "./admin/api/authApi";
import { clearSession, getSession } from "./admin/auth/authStorage";
import { SetPasswordPanel } from "../../shared/auth/SetPasswordPanel";
import {
  fetchAdminUsers,
  registerAdministrator,
  registerStudent,
  registerTeacher,
  resendUserInvitation,
} from "./admin/api/usersApi";
import { fetchRegistrationOverview } from "./admin/api/dashboardApi";
import { deleteCourse, fetchCourses, updateCourse } from "./admin/api/coursesApi";
import {
  createEnrollment,
  deleteEnrollment,
  fetchEnrollments,
  mapEnrollmentRecords,
  updateEnrollment,
  type EnrollmentApiResponse,
} from "./admin/api/enrollmentsApi";
import { createGrade, deleteGrade, fetchGrades, updateGrade } from "./admin/api/gradesApi";
import {
  cancelCalendarEvent,
  createCalendarEvent,
  fetchCalendarEvents,
  fetchUpcomingCalendarEvents,
  updateCalendarEvent,
  type CalendarEventFilters,
} from "./admin/api/calendarApi";

const ADMIN_ROUTE_STORAGE_KEY = "mentify_admin_current_route";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<AdminRoute>("dashboard");
  const [role, setRole] = useState<AdminRole>("SUPER_ADMIN");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  // Sync theme with HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Platform state
  const [kpis, setKpis] = useState<PlatformKPIs>(INITIAL_KPIS);
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS);
  const [teachers, setTeachers] = useState<TeacherProfile[]>(MOCK_TEACHERS);
  const [administrators, setAdministrators] = useState<AdministratorProfile[]>(MOCK_ADMINISTRATORS);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [gradesList, setGradesList] = useState<Grade[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>(MOCK_ENROLLMENTS);
  const [enrollmentApiRecords, setEnrollmentApiRecords] = useState<EnrollmentApiResponse[] | null>(
    null,
  );
  const [curriculum, setCurriculum] = useState<CurriculumModule[]>(MOCK_CURRICULUM);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
  const [examinations, setExaminations] = useState<Examination[]>(MOCK_EXAMINATIONS);
  const [grades, setGrades] = useState<GradeRecord[]>(MOCK_GRADES);
  const [attendanceSessions, setAttendanceSessions] =
    useState<AttendanceSession[]>(MOCK_ATTENDANCE_SESSIONS);
  const [materials, setMaterials] = useState<LearningMaterial[]>(MOCK_MATERIALS);
  const [events, setEvents] = useState<AcademicEvent[]>(MOCK_EVENTS);
  const [upcomingEvents, setUpcomingEvents] = useState<AcademicEvent[]>(MOCK_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(MOCK_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Trigger states for quick action modals
  const [openStudentWizard, setOpenStudentWizard] = useState(false);
  const [openTeacherWizard, setOpenTeacherWizard] = useState(false);
  const [openAdminWizard, setOpenAdminWizard] = useState(false);
  const [openCourseModal, setOpenCourseModal] = useState(false);
  const [preselectedGradeId, setPreselectedGradeId] = useState<string | null>(null);
  const [registrationOverview, setRegistrationOverview] = useState<Awaited<
    ReturnType<typeof fetchRegistrationOverview>
  > | null>(null);
  const [registrationOverviewLoading, setRegistrationOverviewLoading] = useState(false);
  const [registrationOverviewError, setRegistrationOverviewError] = useState("");

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const storedSession = getSession();
      if (!storedSession) {
        if (mounted) setIsAuthReady(true);
        return;
      }

      try {
        if (storedSession.expiresAt <= Date.now() + 10_000) {
          await refreshAdminSession();
        }

        const session = getSession();
        if (mounted && session) {
          setRole(session.user.role);
          setRequiresPasswordChange(Boolean(session.mustChangePassword));
          setIsAuthenticated(true);
        }
      } catch {
        clearSession();
      } finally {
        if (mounted) setIsAuthReady(true);
      }
    };

    void restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setCurrentRoute("dashboard");
    };

    window.addEventListener("mentify:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("mentify:auth-expired", handleAuthExpired);
  }, []);

  useEffect(() => {
    if (!isAuthReady || typeof window === "undefined") return;

    const storedRoute = window.sessionStorage.getItem(ADMIN_ROUTE_STORAGE_KEY);
    // The route is restored from browser storage after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedRoute === "users") {
      setCurrentRoute("dashboard");
    } else if (storedRoute) {
      setCurrentRoute(storedRoute as AdminRoute);
    }
  }, [isAuthReady]);

  useEffect(() => {
    if (!isAuthReady || typeof window === "undefined") return;
    window.sessionStorage.setItem(ADMIN_ROUTE_STORAGE_KEY, currentRoute);
  }, [currentRoute, isAuthReady]);

  const loadAdminUsers = async () => {
    try {
      const data = await fetchAdminUsers();
      setStudents(data.students);
      setTeachers(data.teachers);
      setAdministrators(data.administrators);
    } catch (error) {
      addToast(
        "error",
        "Users unavailable",
        error instanceof Error ? error.message : "Unable to load user information.",
      );
    }
  };

  useEffect(() => {
    // This effect starts the async synchronization with the admin users API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAuthenticated) void loadAdminUsers();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    void fetchUpcomingCalendarEvents(10)
      .then(setUpcomingEvents)
      .catch(() => {
        // Keep the dashboard available when the calendar service is unavailable.
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    void fetchEnrollments()
      .then(setEnrollmentApiRecords)
      .catch(() => {
        // Keep the existing directory visible while Enrollment Service is unavailable.
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (enrollmentApiRecords) {
      // Enrollment records are derived from the API response plus the latest student/course catalogs.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnrollments(mapEnrollmentRecords(enrollmentApiRecords, students, courses));
    }
  }, [enrollmentApiRecords, students, courses]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCourses = async () => {
      try {
        setCourses(await fetchCourses());
      } catch {
        // Keep the existing UI data visible when the course service is unavailable.
      }
    };

    void loadCourses();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadGrades = async () => {
      try {
        setGradesList(await fetchGrades());
      } catch {
        // Keep the grade screen available while the course service is unavailable.
      }
    };

    void loadGrades();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadRegistrationOverview = async () => {
      setRegistrationOverviewLoading(true);
      setRegistrationOverviewError("");
      try {
        const overview = await fetchRegistrationOverview();
        setRegistrationOverview(overview);
        setKpis((previous) => ({
          ...previous,
          totalStudents: overview.usersByRole.STUDENT ?? previous.totalStudents,
          totalTeachers: overview.usersByRole.TEACHER ?? previous.totalTeachers,
          activeUsers: overview.usersByAccountStatus.ACTIVE ?? previous.activeUsers,
          pendingInvitations: overview.usersByAccountStatus.INVITED ?? previous.pendingInvitations,
        }));
      } catch (error) {
        setRegistrationOverviewError(
          error instanceof Error ? error.message : "Unable to load registration overview.",
        );
      } finally {
        setRegistrationOverviewLoading(false);
      }
    };

    void loadRegistrationOverview();
  }, [isAuthenticated]);

  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCalendarEvents = async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      try {
        setEvents(await fetchCalendarEvents(start, end));
      } catch (error) {
        addToast(
          "error",
          "Calendar Unavailable",
          error instanceof Error ? error.message : "Unable to load calendar events.",
        );
      }
    };

    void loadCalendarEvents();
  }, [isAuthenticated]);

  const handleFilterCalendarEvents = useCallback(
    async (filters: CalendarEventFilters, start: Date, end: Date) => {
      const filtered = await fetchCalendarEvents(start, end, filters);
      setEvents(filtered);
    },
    [],
  );

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginView
        onLogin={(session) => {
          setRole(session.user.role);
          setRequiresPasswordChange(Boolean(session.mustChangePassword));
          setIsAuthenticated(true);
        }}
      />
    );
  }

  if (requiresPasswordChange) {
    const session = getSession();
    if (session) {
      return (
        <SetPasswordPanel
          email={session.user.email}
          roleLabel="Administration"
          onSubmit={async (currentPassword, newPassword) => {
            await changeAdminPassword(currentPassword, newPassword);
            clearSession();
            setRequiresPasswordChange(false);
            setIsAuthenticated(false);
          }}
          onCancel={() => {
            clearSession();
            setRequiresPasswordChange(false);
            setIsAuthenticated(false);
          }}
        />
      );
    }
  }

  const handleLogout = () => {
    // Start server-side logout, but do not make the user wait for the request
    // before returning to the login screen.
    void logoutAdmin();
    clearSession();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(ADMIN_ROUTE_STORAGE_KEY);
    }
    setCurrentRoute("dashboard");
    setIsAuthenticated(false);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResendInvitation = async (email: string, targetRole: string) => {
    const user = [...students, ...teachers, ...administrators].find((item) => item.email === email);
    if (!user) {
      addToast("error", "Invitation Failed", "The selected user could not be found.");
      return;
    }

    try {
      await resendUserInvitation(user.id);
      addToast(
        "success",
        "Invitation sent",
        `A new activation email was sent to ${email}.`,
      );

      // Record the action only after the backend confirms delivery/dispatch.
      const newLog: AuditEvent = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorEmail: "alex.mercer@mentify.edu",
        actorRole: role,
        category: "KEYCLOAK_AUTH",
        action: "RESEND_INVITATION",
        details: `Dispatched Keycloak credential email to ${email}`,
        ipAddress: "192.168.10.45",
        payloadJson: JSON.stringify({ email, targetRole, realm: "mentify-prod" }, null, 2),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    } catch (error) {
      addToast(
        "error",
        "Invitation not sent",
        error instanceof Error ? error.message : "Please try again shortly.",
      );
    }
  };

  const handleAddStudent = (newStudent: StudentProfile) => {
    setStudents((prev) => [newStudent, ...prev]);
    setKpis((prev) => ({
      ...prev,
      totalStudents: prev.totalStudents + 1,
      pendingInvitations: prev.pendingInvitations + 1,
    }));
    addToast(
      "success",
      "Student Registered",
      `${newStudent.firstName} ${newStudent.lastName} provisioned with ID ${newStudent.studentId}.`,
    );
  };

  const handleAddTeacher = (newTeacher: TeacherProfile) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    setKpis((prev) => ({
      ...prev,
      totalTeachers: prev.totalTeachers + 1,
      pendingInvitations: prev.pendingInvitations + 1,
    }));
    addToast(
      "success",
      "Teacher Registered",
      `${newTeacher.firstName} ${newTeacher.lastName} onboarded with Code ${newTeacher.teacherCode}.`,
    );
  };

  const handleAddAdministrator = (newAdmin: AdministratorProfile) => {
    setAdministrators((prev) => [newAdmin, ...prev]);
    addToast(
      "success",
      "Administrator Registered",
      `${newAdmin.firstName} ${newAdmin.lastName} registered with Admin Code ${newAdmin.adminCode}.`,
    );
  };

  const handleRegisterStudent = async (request: Parameters<typeof registerStudent>[0]) => {
    return registerStudent(request);
  };

  const handleRegisterTeacher = async (request: Parameters<typeof registerTeacher>[0]) => {
    return registerTeacher(request);
  };

  const handleRegisterAdministrator = async (
    request: Parameters<typeof registerAdministrator>[0],
  ) => {
    return registerAdministrator(request);
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setKpis((prev) => ({
      ...prev,
      totalCourses: prev.totalCourses + 1,
    }));
    addToast(
      "success",
      "Course Created",
      `${newCourse.code} (${newCourse.title}) successfully provisioned.`,
    );
  };

  const handleUpdateCourse = async (
    courseId: string,
    payload: Parameters<typeof updateCourse>[1],
  ) => {
    const updated = await updateCourse(courseId, payload);
    const updatedGrade = gradesList.find((grade) => grade.id === updated.gradeId);
    const updatedTeacher = teachers.find(
      (teacher) =>
        teacher.keycloakUserId === updated.assignedTeacherId ||
        teacher.id === updated.assignedTeacherId,
    );
    const enrichedUpdated = {
      ...updated,
      gradeName: updatedGrade?.name || updated.gradeName,
      grade: updatedGrade?.name || updated.grade,
      teacherName: updatedTeacher
        ? `${updatedTeacher.firstName} ${updatedTeacher.lastName}`
        : updated.teacherName,
      teacherCode: updatedTeacher?.teacherCode || updated.teacherCode,
      teacherId: updated.assignedTeacherId || updated.teacherId,
    };
    setCourses((previous) =>
      previous.map((course) =>
        course.id === courseId ? { ...course, ...enrichedUpdated } : course,
      ),
    );
    addToast("success", "Course Updated", `${enrichedUpdated.title} was updated successfully.`);
    return enrichedUpdated;
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      setCourses((previous) => previous.filter((course) => course.id !== courseId));
      setKpis((previous) => ({
        ...previous,
        totalCourses: Math.max(0, previous.totalCourses - 1),
      }));
      addToast("info", "Course Deleted", "The course was removed successfully.");
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Unable to delete the course.",
      };
    }
  };

  const handleCreateGrade = async (request: CreateGradeRequest) => {
    const created = await createGrade(request);
    setGradesList((previous) => [created, ...previous]);
    addToast("success", "Grade Created", `${created.name} was added successfully.`);
    return created;
  };

  const handleUpdateGrade = async (gradeId: string, request: UpdateGradeRequest) => {
    const updated = await updateGrade(gradeId, request);
    setGradesList((previous) => previous.map((grade) => (grade.id === gradeId ? updated : grade)));
    addToast("success", "Grade Updated", `${updated.name} was updated successfully.`);
  };

  const handleDeleteGrade = async (gradeId: string) => {
    try {
      await deleteGrade(gradeId);
      setGradesList((previous) => previous.filter((grade) => grade.id !== gradeId));
      setPreselectedGradeId((previous) => (previous === gradeId ? null : previous));
      addToast("info", "Grade Deleted", "The grade was removed successfully.");
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Unable to delete the grade.",
      };
    }
  };

  const handleCreateEnrollment = async (studentId: string, courseIds: string[]) => {
    const existing = enrollmentApiRecords?.find((item) => item.studentId === studentId);
    const created = existing
      ? await updateEnrollment(
          existing.id,
          Array.from(new Set([...existing.courseIds, ...courseIds])),
        )
      : await createEnrollment(studentId, courseIds);
    setEnrollmentApiRecords((previous) => {
      if (!previous) return [created];
      return existing
        ? previous.map((item) => (item.id === existing.id ? created : item))
        : [created, ...previous];
    });
    addToast("success", "Student Enrolled", "The selected course was added to the student’s learning plan.");
    return created;
  };

  const handleUpdateEnrollment = async (enrollmentId: string, courseIds: string[]) => {
    const updated = await updateEnrollment(enrollmentId, courseIds);
    setEnrollmentApiRecords((previous) =>
      previous ? previous.map((item) => (item.id === enrollmentId ? updated : item)) : previous,
    );
    addToast("success", "Enrollment Updated", "The student’s course enrollment was updated.");
    return updated;
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    await deleteEnrollment(enrollmentId);
    setEnrollmentApiRecords((previous) =>
      previous ? previous.filter((item) => item.id !== enrollmentId) : previous,
    );
    addToast("success", "Course Unenrolled", "The course was removed from the student’s plan.");
  };

  const handleUploadMaterial = (newMat: LearningMaterial) => {
    setMaterials((prev) => [newMat, ...prev]);
    addToast(
      "success",
      "Material Uploaded",
      `Synchronized ${newMat.title} to AWS S3 bucket repository.`,
    );
  };

  const handleAddEvent = async (request: Parameters<typeof createCalendarEvent>[0]) => {
    const created = await createCalendarEvent(request);
    setEvents((prev) => [created, ...prev.filter((event) => event.id !== created.id)]);
    addToast("success", "Event Scheduled", `Added "${created.title}" to institutional calendar.`);
  };

  const handleUpdateEvent = async (
    eventId: string,
    request: Parameters<typeof updateCalendarEvent>[1],
  ) => {
    const updated = await updateCalendarEvent(eventId, request);
    setEvents((prev) => prev.map((event) => (event.id === eventId ? updated : event)));
    addToast("success", "Event Updated", `"${updated.title}" was updated successfully.`);
  };

  const handleCancelEvent = async (eventId: string) => {
    const cancelled = await cancelCalendarEvent(eventId);
    setEvents((prev) => prev.map((event) => (event.id === eventId ? cancelled : event)));
    addToast("success", "Event Cancelled", `"${cancelled.title}" was cancelled.`);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast("info", "All notifications marked as read");
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "register-student":
        setCurrentRoute("students");
        setOpenStudentWizard(true);
        break;
      case "register-teacher":
        setCurrentRoute("teachers");
        setOpenTeacherWizard(true);
        break;
      case "register-admin":
        if (role === "SUPER_ADMIN") {
          setCurrentRoute("administrators");
          setOpenAdminWizard(true);
        } else {
          addToast(
            "error",
            "Unauthorized",
            "Super Administrator role required to register admins.",
          );
        }
        break;
      case "create-course":
        setCurrentRoute("courses");
        setOpenCourseModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <AdminLayout
      currentRoute={currentRoute}
      onNavigate={(r) => {
        setCurrentRoute(r);
        setOpenStudentWizard(false);
        setOpenTeacherWizard(false);
        setOpenAdminWizard(false);
        setOpenCourseModal(false);
      }}
      role={role}
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode((p) => !p)}
      notifications={notifications}
      onMarkNotificationRead={handleMarkNotificationRead}
      toasts={toasts}
      onDismissToast={handleDismissToast}
      onQuickAction={handleQuickAction}
      onLogout={handleLogout}
    >
      {/* Route Views */}
      {currentRoute === "dashboard" && (
        <AdminDashboard
          kpis={kpis}
          students={students}
          teachers={teachers}
          events={upcomingEvents}
          recentLogs={auditLogs}
          role={role}
          onNavigate={setCurrentRoute}
          onQuickAction={handleQuickAction}
          onResendInvitation={handleResendInvitation}
          registrationOverview={registrationOverview}
          registrationOverviewLoading={registrationOverviewLoading}
          registrationOverviewError={registrationOverviewError}
        />
      )}

      {currentRoute === "students" && (
        <StudentManagement
          students={students}
          enrollments={enrollments}
          grades={grades}
          attendanceSessions={attendanceSessions}
          onAddStudent={handleAddStudent}
          onRegisterStudent={handleRegisterStudent}
          onResendInvitation={handleResendInvitation}
          showRegistrationWizardDirectly={openStudentWizard}
        />
      )}

      {currentRoute === "teachers" && (
        <TeacherManagement
          teachers={teachers}
          courses={courses}
          onAddTeacher={handleAddTeacher}
          onRegisterTeacher={handleRegisterTeacher}
          onResendInvitation={handleResendInvitation}
          showRegistrationWizardDirectly={openTeacherWizard}
        />
      )}

      {currentRoute === "administrators" && (
        <AdminManagement
          administrators={administrators}
          currentRole={role}
          onAddAdministrator={handleAddAdministrator}
          onRegisterAdministrator={handleRegisterAdministrator}
          onResendInvitation={handleResendInvitation}
          showRegistrationWizardDirectly={openAdminWizard}
        />
      )}

      {currentRoute === "registrations" && (
        <RegistrationsAndInvitations
          students={students}
          teachers={teachers}
          administrators={administrators}
          onResendInvitation={handleResendInvitation}
        />
      )}

      {currentRoute === "courses" && (
        <CourseManagement
          courses={courses}
          grades={gradesList}
          teachers={teachers}
          enrollments={enrollments}
          curriculum={curriculum}
          materials={materials}
          onAddCourse={handleAddCourse}
          onUpdateCourse={handleUpdateCourse}
          onDeleteCourse={handleDeleteCourse}
          showCreateModalDirectly={openCourseModal}
          preselectedGradeId={preselectedGradeId}
          onNavigateToGrades={() => setCurrentRoute("grades")}
        />
      )}

      {currentRoute === "grades" && (
        <GradeManagement
          grades={gradesList}
          administrators={administrators}
          onCreateGrade={handleCreateGrade}
          onUpdateGrade={handleUpdateGrade}
          onDeleteGrade={handleDeleteGrade}
          onProceedToCourseCreation={(gradeId) => {
            setPreselectedGradeId(gradeId || null);
            setCurrentRoute("courses");
            setOpenCourseModal(true);
          }}
        />
      )}

      {currentRoute === "enrollments" && (
        <EnrollmentManagement
          enrollments={enrollments}
          courses={courses}
          students={students}
          grades={gradesList}
          onCreateEnrollment={handleCreateEnrollment}
          onUpdateEnrollment={handleUpdateEnrollment}
          onDeleteEnrollment={handleDeleteEnrollment}
        />
      )}

      {currentRoute === "academic" && (
        <CurriculumManagement curriculum={curriculum} courses={courses} />
      )}

      {currentRoute === "assignments" && <AssignmentOversight assignments={assignments} />}

      {currentRoute === "quizzes" && <QuizManagement quizzes={quizzes} />}

      {currentRoute === "examinations" && <ExaminationManagement examinations={examinations} />}

      {currentRoute === "results" && <GradesAndResults grades={grades} />}

      {currentRoute === "attendance" && <AttendanceManagement sessions={attendanceSessions} />}

      {currentRoute === "materials" && (
        <LearningMaterialManagement
          materials={materials}
          courses={courses}
          onUploadMaterial={handleUploadMaterial}
        />
      )}

      {currentRoute === "calendar" && (
        <AdminCalendar
          events={events}
          courses={courses}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onCancelEvent={handleCancelEvent}
          onFilterEvents={handleFilterCalendarEvents}
        />
      )}

      {currentRoute === "communication" && <CommunicationManagement />}

      {currentRoute === "notifications" && (
        <NotificationCenter
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onNavigate={setCurrentRoute}
        />
      )}

      {currentRoute === "ai-assistant" && <MentifyAIAssistant />}

      {currentRoute === "analytics" && <AnalyticsDashboard />}

      {currentRoute === "reports" && <ReportsManagement />}

      {currentRoute === "audit" && <AuditAndActivity logs={auditLogs} />}

      {currentRoute === "profile" && <AdminProfile role={role} />}

      {currentRoute === "settings" && (
        <AdminSettings
          role={role}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((p) => !p)}
        />
      )}
    </AdminLayout>
  );
}
