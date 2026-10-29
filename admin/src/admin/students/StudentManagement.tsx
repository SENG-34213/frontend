import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  UserCheck,
  Send,
  RefreshCw,
  Loader2,
  Unlock,
  Trash2,
  Ban,
  Eye,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { UserAvatar } from "../components/UserAvatar";
import { DetailDrawer } from "../components/DetailDrawer";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import {
  StudentProfile,
  EnrollmentRecord,
  Grade,
  GradeRecord,
  AttendanceSession,
  Course,
} from "../types";
import type { RegisterStudentRequest } from "../api/usersApi";
import { EmptyState } from "../../../../shared/ui/EmptyState";

interface StudentManagementProps {
  students: StudentProfile[];
  enrollments: EnrollmentRecord[];
  courses: Course[];
  availableGrades: Grade[];
  grades: GradeRecord[];
  attendanceSessions: AttendanceSession[];
  onAddStudent: (newStudent: StudentProfile) => void;
  onRegisterStudent: (request: RegisterStudentRequest) => Promise<StudentProfile>;
  onCreateEnrollment: (studentId: string, courseIds: string[]) => Promise<unknown>;
  onResendInvitation: (email: string, role: string) => Promise<void>;
  onUpdateUserStatus: (userId: string, active: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onUnlockUser: (userId: string) => Promise<void>;
  showRegistrationWizardDirectly?: boolean;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  enrollments,
  courses,
  availableGrades,
  grades,
  attendanceSessions,
  onAddStudent,
  onRegisterStudent,
  onCreateEnrollment,
  onResendInvitation,
  onUpdateUserStatus,
  onDeleteUser,
  onUnlockUser,
  showRegistrationWizardDirectly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "courses" | "grades" | "attendance">(
    "overview",
  );

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(showRegistrationWizardDirectly);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [createdStudentId, setCreatedStudentId] = useState<string>("");
  const [createdStudent, setCreatedStudent] = useState<StudentProfile | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentNotice, setEnrollmentNotice] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [unlockingUserId, setUnlockingUserId] = useState<string | null>(null);
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentProfile | null>(null);

  const handleStatusChange = async (userId: string, active: boolean) => {
    setMutatingUserId(userId);
    try {
      await onUpdateUserStatus(userId, active);
    } finally {
      setMutatingUserId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const student = deleteTarget;
    setMutatingUserId(student.id);
    try {
      await onDeleteUser(student.id);
      setDeleteTarget(null);
    } finally {
      setMutatingUserId(null);
    }
  };

  const handleResend = async (email: string, role: string) => {
    setResendingEmail(email);
    try {
      await onResendInvitation(email, role);
    } finally {
      setResendingEmail(null);
    }
  };

  const handleUnlock = async (userId: string) => {
    setUnlockingUserId(userId);
    try {
      await onUnlockUser(userId);
    } finally {
      setUnlockingUserId(null);
    }
  };

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "2008-05-15",
    grade: "",
    schoolName: "Metropolitan STEM Collegiate",
    guardianName: "",
    guardianPhone: "",
    attendanceMode: "IN_PERSON" as "IN_PERSON" | "ONLINE" | "HYBRID",
    addressLine1: "",
    addressLine2: "",
    city: "San Jose",
    district: "Santa Clara",
    postalCode: "95112",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const activeGradeOptions = useMemo(
    () => availableGrades.filter((grade) => grade.active),
    [availableGrades],
  );

  const selectedGradeName = formData.grade || activeGradeOptions[0]?.name || "";

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = gradeFilter === "ALL" || s.grade === gradeFilter;
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim()))
        errors.email = "Valid institutional or student email is required";
    }
    if (step === 2) {
      if (!selectedGradeName.trim()) errors.grade = "Select an active grade";
      if (!formData.guardianName.trim()) errors.guardianName = "Guardian name is required";
      if (!formData.guardianPhone.trim()) errors.guardianPhone = "Guardian phone is required";
    }
    if (step === 3) {
      if (!formData.addressLine1.trim()) errors.addressLine1 = "Address line 1 is required";
      if (!formData.city.trim()) errors.city = "City is required";
      if (!formData.postalCode.trim()) errors.postalCode = "Postal code is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev - 1) as any);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      const createdStudent = await onRegisterStudent({ ...formData, grade: selectedGradeName });
      onAddStudent(createdStudent);
      setCreatedStudentId(createdStudent.studentId);
      setCreatedStudent(createdStudent);
      setSelectedCourseIds([]);
      setEnrollmentNotice("");
      setEnrollmentError("");
      setCurrentStep(5);
    } catch (error) {
      setFormErrors({
        api: error instanceof Error ? error.message : "Unable to register student.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "2008-05-15",
      grade: activeGradeOptions[0]?.name || "",
      schoolName: "Metropolitan STEM Collegiate",
      guardianName: "",
      guardianPhone: "",
      attendanceMode: "IN_PERSON",
      addressLine1: "",
      addressLine2: "",
      city: "San Jose",
      district: "Santa Clara",
      postalCode: "95112",
    });
    setFormErrors({});
    setCreatedStudent(null);
    setCreatedStudentId("");
    setSelectedCourseIds([]);
    setEnrollmentNotice("");
    setEnrollmentError("");
    setIsSubmitting(false);
    setCurrentStep(1);
    setIsWizardOpen(false);
  };

  const studentCourses = useMemo(() => {
    if (!createdStudent) return [];
    const normalizedStudentGrade = createdStudent.grade
      .trim()
      .toLowerCase()
      .replace(/^grade\s*/i, "");
    const comparableStudentGrade = /^\d+$/.test(normalizedStudentGrade)
      ? normalizedStudentGrade.padStart(2, "0")
      : normalizedStudentGrade;
    return courses.filter((course) => {
      const courseGrade = (course.gradeName || course.grade || "")
        .trim()
        .toLowerCase()
        .replace(/^grade\s*/i, "");
      const comparableCourseGrade = /^\d+$/.test(courseGrade)
        ? courseGrade.padStart(2, "0")
        : courseGrade;
      return course.status !== "ARCHIVED" && comparableCourseGrade === comparableStudentGrade;
    });
  }, [courses, createdStudent]);

  const handleEnrollCreatedStudent = async () => {
    if (!createdStudent || selectedCourseIds.length === 0 || isEnrolling) return;
    setIsEnrolling(true);
    setEnrollmentError("");
    try {
      await onCreateEnrollment(createdStudent.id, selectedCourseIds);
      setEnrollmentNotice(
        `${selectedCourseIds.length} course${selectedCourseIds.length === 1 ? "" : "s"} added to ${createdStudent.firstName}'s learning plan.`,
      );
      setSelectedCourseIds([]);
    } catch (error) {
      setEnrollmentError(error instanceof Error ? error.message : "Unable to enroll the student.");
    } finally {
      setIsEnrolling(false);
    }
  };

  // Student specific relations
  const studentEnrollments = selectedStudent
    ? enrollments.filter((e) => e.studentId === selectedStudent.studentId)
    : [];

  const studentGrades = selectedStudent
    ? grades.filter((g) => g.studentId === selectedStudent.studentId)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        description="Comprehensive directory, enrollment tracking, academic records, and multi-step registration."
        breadcrumbs={[{ label: "Admin" }, { label: "User Management" }, { label: "Students" }]}
        actions={
          <button
            onClick={() => {
              setCurrentStep(1);
              setIsWizardOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, or Student ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Grades</option>
            {activeGradeOptions.length === 0 ? (
              <option value="">No active grades available</option>
            ) : (
              activeGradeOptions.map((grade) => (
                <option key={grade.id} value={grade.name}>
                  {/^\d+$/.test(grade.name.trim()) ? `Grade ${grade.name.trim()}` : grade.name}
                </option>
              ))
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INVITED">Invited</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <span className="text-xs text-slate-400 pl-2 tabular-nums">
            {filteredStudents.length} students
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Student ID</th>
                <th className="py-3 px-4 font-semibold">Full Name & Email</th>
                <th className="py-3 px-4 font-semibold">Grade</th>
                <th className="py-3 px-4 font-semibold">Guardian Info</th>
                <th className="py-3 px-4 font-semibold">Mode</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <EmptyState
                      compact
                      icon={GraduationCap}
                      title="No students found"
                      description="No student records match the selected filters."
                      className="border-0 py-0"
                    />
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr
                    key={stu.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {stu.studentId}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={`${stu.firstName} ${stu.lastName}`}
                          avatarUrl={stu.avatarUrl}
                          size="md"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {stu.firstName} {stu.lastName}
                          </span>
                          <span className="text-slate-400">{stu.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {stu.grade}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <span className="font-medium text-slate-700 dark:text-slate-300 block">
                        {stu.guardianName}
                      </span>
                      <span className="text-[11px] text-slate-400">{stu.guardianPhone}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                        {stu.attendanceMode.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={stu.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(stu);
                            setDetailTab("overview");
                          }}
                          className="group relative rounded p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                          title="View student details"
                          aria-label={`View details for ${stu.firstName} ${stu.lastName}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            View details
                          </span>
                        </button>
                        {stu.status === "INVITED" && (
                          <button
                            disabled={resendingEmail === stu.email}
                            onClick={() => void handleResend(stu.email, "STUDENT")}
                            className="px-2 py-1 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
                          >
                            {resendingEmail === stu.email ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            {resendingEmail === stu.email ? "Sending..." : "Resend"}
                          </button>
                        )}
                        {stu.accountLocked && (
                          <button
                            disabled={unlockingUserId === stu.id}
                            onClick={() => void handleUnlock(stu.id)}
                            className="group relative rounded p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            title="Unlock account immediately"
                            aria-label={`Unlock ${stu.firstName} ${stu.lastName}`}
                          >
                            <Unlock
                              className={`h-3.5 w-3.5 ${unlockingUserId === stu.id ? "animate-pulse" : ""}`}
                            />
                            <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                              Unlock account
                            </span>
                          </button>
                        )}
                        {stu.status === "ACTIVE" || stu.status === "SUSPENDED" ? (
                          <button
                            disabled={mutatingUserId === stu.id}
                            onClick={() =>
                              void handleStatusChange(stu.id, stu.status === "SUSPENDED")
                            }
                            className="group relative rounded p-1.5 text-amber-600 hover:bg-amber-50 disabled:cursor-wait disabled:opacity-60 dark:text-amber-400 dark:hover:bg-amber-950/40"
                            title={stu.status === "ACTIVE" ? "Suspend account" : "Activate account"}
                            aria-label={
                              stu.status === "ACTIVE"
                                ? `Suspend ${stu.firstName} ${stu.lastName}`
                                : `Activate ${stu.firstName} ${stu.lastName}`
                            }
                          >
                            <Ban className="h-3.5 w-3.5" />
                            <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                              {stu.status === "ACTIVE" ? "Suspend account" : "Activate account"}
                            </span>
                          </button>
                        ) : null}
                        <button
                          disabled={mutatingUserId === stu.id}
                          onClick={() => setDeleteTarget(stu)}
                          className="group relative rounded p-1.5 text-rose-600 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                          title="Delete user"
                          aria-label={`Delete ${stu.firstName} ${stu.lastName}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            Delete user
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-STEP REGISTRATION WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Registration Wizard
                </h3>
                <p className="text-xs text-slate-500">
                  Add a new student and their academic details
                </p>
              </div>
              <button
                onClick={resetWizard}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            {currentStep < 5 && (
              <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {[
                  { step: 1, title: "Personal Info" },
                  { step: 2, title: "Academic & Guardian" },
                  { step: 3, title: "Address Info" },
                  { step: 4, title: "Review & Submit" },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep === s.step
                          ? "bg-indigo-600 text-white"
                          : currentStep > s.step
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {currentStep > s.step ? "✓" : s.step}
                    </span>
                    <span
                      className={`hidden sm:inline font-medium ${
                        currentStep === s.step
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="py-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 1: Student Identity
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Liam"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.firstName && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Bennett"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.lastName && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Student Institutional Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. liam.bennett@mentify.edu"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.email && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>
                    )}
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      An invitation will be sent to this email address.
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Primary Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Student Information */}
            {currentStep === 2 && (
              <div className="py-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 2: Academic Level & Guardian Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Enrolling Grade Level
                    </label>
                    <select
                      value={selectedGradeName}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      disabled={activeGradeOptions.length === 0}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {activeGradeOptions.length === 0 ? (
                        <option value="">No active grades available</option>
                      ) : (
                        activeGradeOptions.map((grade) => (
                          <option key={grade.id} value={grade.name}>
                            {/^\d+$/.test(grade.name.trim())
                              ? `Grade ${grade.name.trim()}`
                              : grade.name}
                          </option>
                        ))
                      )}
                    </select>
                    {formErrors.grade && (
                      <p className="mt-1 text-[11px] text-rose-600">{formErrors.grade}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      School / Tuition Center
                    </label>
                    <input
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Attendance Mode
                    </label>
                    <select
                      value={formData.attendanceMode}
                      onChange={(e) =>
                        setFormData({ ...formData, attendanceMode: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="IN_PERSON">In-Person Tuition Center</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ONLINE">Fully Online LMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Guardian Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="e.g. Richard Bennett"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.guardianName && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.guardianName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Guardian Contact Phone *
                    </label>
                    <input
                      type="text"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="+1 (555) 887-1290"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.guardianPhone && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.guardianPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address Information */}
            {currentStep === 3 && (
              <div className="py-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 3: Residential Address
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="Street address or P.O. Box"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.addressLine1 && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.addressLine1}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      placeholder="Apartment, suite, unit, building"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.city && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      District / State
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.postalCode && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Register */}
            {currentStep === 4 && (
              <div className="py-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 4: Verify Registration Parameters
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block">Full Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email Address:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formData.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Grade & Mode:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {selectedGradeName} · {formData.attendanceMode}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Guardian:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formData.guardianName} ({formData.guardianPhone})
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Residential Address:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formData.addressLine1}, {formData.city}, {formData.postalCode}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>
                      A student ID will be generated automatically when registration is confirmed.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Success Dialog */}
            {currentStep === 5 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Student Registered
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    The student account was created successfully. The invitation email is being sent
                    in the background.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Generated Student ID:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {createdStudentId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Status:</span>
                    <StatusBadge status={createdStudent?.status || "ACTIVE"} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Invitation Email:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {formData.email}
                    </span>
                  </div>
                </div>

                <div className="max-w-xl mx-auto text-left rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/20 p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <BookOpen className="w-4 h-4 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h5 className="text-xs font-semibold text-slate-900 dark:text-white">
                        Enroll in courses now
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Choose courses for {createdStudent?.firstName || "this student"}. You can
                        also do this later from Enrollments.
                      </p>
                    </div>
                  </div>

                  {studentCourses.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {studentCourses.map((course) => {
                        const selected = selectedCourseIds.includes(course.id);
                        return (
                          <label
                            key={course.id}
                            className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              selected
                                ? "border-indigo-400 bg-white dark:bg-slate-900"
                                : "border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                setSelectedCourseIds((current) =>
                                  selected
                                    ? current.filter((id) => id !== course.id)
                                    : [...current, course.id],
                                )
                              }
                              className="mt-0.5 accent-indigo-600"
                            />
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {course.title || course.courseName}
                              </span>
                              <span className="block text-[10px] text-slate-500 truncate">
                                {course.code} · {course.category || course.subject || "Course"}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-white/70 dark:bg-slate-900/50 px-3 py-3 text-center text-[11px] text-slate-500">
                      No active courses are available for {createdStudent?.grade || "this grade"}{" "}
                      yet.
                    </div>
                  )}

                  {enrollmentNotice && (
                    <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {enrollmentNotice}
                    </p>
                  )}
                  {enrollmentError && (
                    <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
                      {enrollmentError}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={selectedCourseIds.length === 0 || isEnrolling}
                    onClick={handleEnrollCreatedStudent}
                    className="mt-3 w-full px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1.5"
                  >
                    {isEnrolling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5" />
                    )}
                    {isEnrolling ? "Enrolling..." : "Enroll Selected Courses"}
                  </button>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={resetWizard}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Done & Return to Directory
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setFormData({
                        ...formData,
                        firstName: "",
                        lastName: "",
                        email: "",
                        guardianName: "",
                        guardianPhone: "",
                      });
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Register Another Student
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            {formErrors.api && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {formErrors.api}
              </p>
            )}
            {currentStep < 5 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  disabled={currentStep === 1}
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Registering...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Register Student</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT DETAILS SLIDE-OUT DRAWER WITH TABS */}
      {selectedStudent && (
        <DetailDrawer
          isOpen={!!selectedStudent}
          title={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
          subtitle={`${selectedStudent.studentId} · ${selectedStudent.grade}`}
          onClose={() => setSelectedStudent(null)}
          width="xl"
        >
          <div className="space-y-5">
            {/* Tab navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(["overview", "courses", "grades", "attendance"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                    detailTab === tab
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {detailTab === "overview" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <UserAvatar
                    name={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    avatarUrl={selectedStudent.avatarUrl}
                    size="lg"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h4>
                    <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={selectedStudent.status} />
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold tabular-nums">
                        Avg Grade: {selectedStudent.averageGrade}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                    <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                      {selectedStudent.dob}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">School Name</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedStudent.schoolName || "St. Jude International Academy"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Guardian Name</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedStudent.guardianName}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Guardian Contact</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedStudent.guardianPhone}
                    </span>
                  </div>
                  <div className="col-span-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Residential Address</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedStudent.addressLine1}, {selectedStudent.city},{" "}
                      {selectedStudent.postalCode}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {detailTab === "courses" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Course Enrollments ({studentEnrollments.length})
                </h4>
                {studentEnrollments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    <EmptyState
                      compact
                      icon={BookOpen}
                      title="No active enrollments"
                      description="No active course enrollments are recorded for this student."
                      className="border-0 py-2"
                    />
                  </p>
                ) : (
                  studentEnrollments.map((e) => (
                    <div
                      key={e.id}
                      className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {e.courseCode}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {e.courseTitle}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Enrolled: {e.enrolledDate} · Progress: {e.progressPercentage}%
                        </span>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Grades Tab */}
            {detailTab === "grades" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Assessment Grades & Evaluations ({studentGrades.length})
                </h4>
                {studentGrades.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    <EmptyState
                      compact
                      icon={Award}
                      title="No grade records"
                      description="No grade records have been submitted for this student yet."
                      className="border-0 py-2"
                    />
                  </p>
                ) : (
                  studentGrades.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {g.assessmentTitle}
                        </span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {g.score} / {g.maxScore} ({g.letterGrade})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{g.feedback}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {detailTab === "attendance" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recent Class Attendance Log
                </h4>
                {attendanceSessions.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {att.courseTitle}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {att.date} · {att.timeSlot}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      PRESENT
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DetailDrawer>
      )}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        title="Delete student account?"
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`
            : ""
        }
        consequences={[
          "The student will no longer be able to sign in.",
          "The student profile will be permanently deleted.",
          "Historical academic records may remain in related services.",
        ]}
        confirmText={mutatingUserId === deleteTarget?.id ? "Deleting…" : "Delete student"}
        variant="danger"
        onConfirm={() => void handleDelete()}
        onCancel={() => (mutatingUserId ? undefined : setDeleteTarget(null))}
      />
    </div>
  );
};
