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
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>(MOCK_ENROLLMENTS);
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
    addToast(
      "success",
      "Invitation Dispatched",
      `Keycloak temporary password activation link dispatched to ${email} (${targetRole}).`,
    );

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
    setStudents((prev) => prev.map((s) => (s.id === userId ? { ...s, status: newStatus } : s)));
    setTeachers((prev) => prev.map((t) => (t.id === userId ? { ...t, status: newStatus } : t)));
    setAdministrators((prev) =>
      prev.map((a) => (a.id === userId ? { ...a, status: newStatus } : a)),
    );

    addToast(
      "success",
      "Account Status Updated",
      `User account has been set to ${newStatus}. Keycloak tokens updated.`,
    );
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

  const handleUpdateEnrollmentStatus = (enrId: string, status: any) => {
    setEnrollments((prev) => prev.map((e) => (e.id === enrId ? { ...e, status } : e)));
    addToast("success", "Enrollment Approved", "Student course roster validated in PostgreSQL.");
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
        />
      )}

      {currentRoute === "students" && (
        <StudentManagement
          students={students}
          enrollments={enrollments}
          grades={grades}
          attendanceSessions={attendanceSessions}
          onAddStudent={handleAddStudent}
          onResendInvitation={handleResendInvitation}
          showRegistrationWizardDirectly={openStudentWizard}
        />
      )}

      {currentRoute === "teachers" && (
        <TeacherManagement
          teachers={teachers}
          courses={courses}
          onAddTeacher={handleAddTeacher}
          onResendInvitation={handleResendInvitation}
          showRegistrationWizardDirectly={openTeacherWizard}
        />
      )}

      {currentRoute === "administrators" && (
        <AdminManagement
          administrators={administrators}
          currentRole={role}
          onAddAdministrator={handleAddAdministrator}
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
          teachers={teachers}
          enrollments={enrollments}
          curriculum={curriculum}
          materials={materials}
          onAddCourse={handleAddCourse}
          showCreateModalDirectly={openCourseModal}
        />
      )}

      {currentRoute === "enrollments" && (
        <EnrollmentManagement
          enrollments={enrollments}
          courses={courses}
          onUpdateEnrollmentStatus={handleUpdateEnrollmentStatus}
        />
      )}

      {currentRoute === "academic" && (
        <CurriculumManagement curriculum={curriculum} courses={courses} />
      )}

      {currentRoute === "assignments" && <AssignmentOversight assignments={assignments} />}

      {currentRoute === "quizzes" && <QuizManagement quizzes={quizzes} />}

      {currentRoute === "examinations" && <ExaminationManagement examinations={examinations} />}

      {currentRoute === "grades" && <GradesAndResults grades={grades} />}

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
