import React, { useState, useEffect } from "react";
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
  AccountStatus,
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
import { UsersManagement } from "./admin/users/UsersManagement";
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
import { logoutAdmin } from "./admin/api/authApi";
import {
  fetchAdminUsers,
  registerAdministrator,
  registerStudent,
  registerTeacher,
  resendUserInvitation,
  updateUserStatus,
} from "./admin/api/usersApi";
import { fetchRegistrationOverview } from "./admin/api/dashboardApi";
import { fetchCourses, updateCourse } from "./admin/api/coursesApi";
import {
  createEnrollment,
  fetchEnrollments,
  mapEnrollmentRecords,
  updateEnrollment,
  type EnrollmentApiResponse,
} from "./admin/api/enrollmentsApi";
import { createGrade, deleteGrade, fetchGrades, updateGrade } from "./admin/api/gradesApi";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<AdminRoute>("dashboard");
  const [role, setRole] = useState<AdminRole>("SUPER_ADMIN");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

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
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(MOCK_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Trigger states for quick action modals
  const [openStudentWizard, setOpenStudentWizard] = useState(false);
  const [openTeacherWizard, setOpenTeacherWizard] = useState(false);
  const [openAdminWizard, setOpenAdminWizard] = useState(false);
  const [openCourseModal, setOpenCourseModal] = useState(false);
  const [preselectedGradeId, setPreselectedGradeId] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [registrationOverview, setRegistrationOverview] = useState<Awaited<
    ReturnType<typeof fetchRegistrationOverview>
  > | null>(null);
  const [registrationOverviewLoading, setRegistrationOverviewLoading] = useState(false);
  const [registrationOverviewError, setRegistrationOverviewError] = useState("");

  const loadAdminUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const data = await fetchAdminUsers();
      setStudents(data.students);
      setTeachers(data.teachers);
      setAdministrators(data.administrators);
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    // This effect starts the async synchronization with the admin users API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAuthenticated) void loadAdminUsers();
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

  if (!isAuthenticated) {
    return (
      <AdminLoginView
        onLogin={(session) => {
          setRole(session.user.role);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const handleLogout = () => {
    void logoutAdmin().finally(() => setIsAuthenticated(false));
  };

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

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResendInvitation = (email: string, targetRole: string) => {
    const user = [...students, ...teachers, ...administrators].find((item) => item.email === email);
    if (!user) {
      addToast("error", "Invitation Failed", "The selected user could not be found.");
      return;
    }

    void resendUserInvitation(user.id)
      .then(() => {
        addToast(
          "success",
          "Invitation Dispatched",
          `Keycloak temporary password activation link dispatched to ${email} (${targetRole}).`,
        );
      })
      .catch((error) => {
        addToast("error", "Invitation Failed", error instanceof Error ? error.message : undefined);
      });

    // Record audit event
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
  };

  const handleUpdateUserStatus = (userId: string, newStatus: AccountStatus) => {
    void updateUserStatus(userId, newStatus === "ACTIVE")
      .then(() => {
        setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, status: newStatus } : s)));
        setTeachers((prev) => prev.map((t) => (t.id === userId ? { ...t, status: newStatus } : t)));
        setAdministrators((prev) =>
          prev.map((a) => (a.id === userId ? { ...a, status: newStatus } : a)),
        );
        addToast("success", "Account Status Updated", `User account has been set to ${newStatus}.`);
      })
      .catch((error) => {
        addToast(
          "error",
          "Status Update Failed",
          error instanceof Error ? error.message : undefined,
        );
      });
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

  const handleUpdateCourse = async (courseId: string, payload: Parameters<typeof updateCourse>[1]) => {
    const updated = await updateCourse(courseId, payload);
    setCourses((previous) =>
      previous.map((course) => (course.id === courseId ? { ...course, ...updated } : course)),
    );
    addToast("success", "Course Updated", `${updated.title} was updated successfully.`);
    return updated;
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

  const handleUpdateEnrollmentStatus = (enrId: string, status: any) => {
    setEnrollments((prev) => prev.map((e) => (e.id === enrId ? { ...e, status } : e)));
    addToast("success", "Enrollment Approved", "Student course roster validated in PostgreSQL.");
  };

  const handleCreateEnrollment = async (studentId: string, courseIds: string[]) => {
    const existing = enrollmentApiRecords?.find((item) => item.studentId === studentId);
    const created = existing
      ? await updateEnrollment(existing.id, Array.from(new Set([...existing.courseIds, ...courseIds])))
      : await createEnrollment(studentId, courseIds);
    setEnrollmentApiRecords((previous) => {
      if (!previous) return [created];
      return existing
        ? previous.map((item) => (item.id === existing.id ? created : item))
        : [created, ...previous];
    });
    return created;
  };

  const handleUploadMaterial = (newMat: LearningMaterial) => {
    setMaterials((prev) => [newMat, ...prev]);
    addToast(
      "success",
      "Material Uploaded",
      `Synchronized ${newMat.title} to AWS S3 bucket repository.`,
    );
  };

  const handleAddEvent = (newEvent: AcademicEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    addToast("success", "Event Scheduled", `Added "${newEvent.title}" to institutional calendar.`);
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
      onRoleChange={setRole}
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
          events={events}
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

      {currentRoute === "users" && (
        <UsersManagement
          students={students}
          teachers={teachers}
          administrators={administrators}
          currentAdminRole={role}
          onUpdateUserStatus={handleUpdateUserStatus}
          onResendInvitation={handleResendInvitation}
          onRegisterStudent={() => handleQuickAction("register-student")}
          onRegisterTeacher={() => handleQuickAction("register-teacher")}
          isLoading={usersLoading}
          error={usersError}
          onRetry={() => void loadAdminUsers()}
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
          onSwitchToSuperAdmin={() => setRole("SUPER_ADMIN")}
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
          showCreateModalDirectly={openCourseModal}
          preselectedGradeId={preselectedGradeId}
          onNavigateToGrades={() => setCurrentRoute("grades")}
        />
      )}

      {currentRoute === "grades" && (
        <GradeManagement
          grades={gradesList}
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
          onCreateEnrollment={handleCreateEnrollment}
          onUpdateEnrollmentStatus={handleUpdateEnrollmentStatus}
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

      {currentRoute === "calendar" && <AdminCalendar events={events} onAddEvent={handleAddEvent} />}

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

      {currentRoute === "analytics" && <AnalyticsDashboard kpis={kpis} />}

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
