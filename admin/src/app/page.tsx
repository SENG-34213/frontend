"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type Notice = { kind: "success" | "error"; title: string; body: string };
type AdminSection = "student" | "teacher" | "course" | "enrollment";
type RecentTeacher = { id: string; name: string; email: string };
type RecentStudent = { id: string; name: string; email: string; grade?: string; phoneNumber?: string; attendanceMode?: string; studentCode?: string };
type RecentCourse = { id: string; name: string; subject?: string };
type SampleCourse = { id: string; grade: string; name: string; subject: string; teacher: string; schedule: string; fee: number; description: string };
type SampleEnrollment = { studentId: string; courseIds: string[]; enrolledOn: string; updatedOn: string };

type CourseDraft = {
  courseName: string;
  courseDescription: string;
  courseThumbnail: string;
  courseFeeMonthly: string;
  gradeId: string;
  assignedTeacherId: string;
  subject: string;
  isOnline: boolean;
  discountOfferPercent: string;
  isVisible: boolean;
  isPublished: boolean;
  courseEnrollmentId: string;
};

const emptyCourse: CourseDraft = {
  courseName: "", courseDescription: "", courseThumbnail: "", courseFeeMonthly: "",
  gradeId: "", assignedTeacherId: "", subject: "", isOnline: true,
  discountOfferPercent: "0", isVisible: true, isPublished: false, courseEnrollmentId: "",
};

const subjects = ["Mathematics", "Science", "English", "ICT"];
const sampleCourses: SampleCourse[] = Array.from({ length: 13 }, (_, index) => {
  const grade = String(index + 1);
  return subjects.map((subject, subjectIndex) => ({
    id: `sample-grade-${grade}-${subject.toLowerCase()}`,
    grade,
    name: `Grade ${grade} ${subject}`,
    subject,
    teacher: ["Nimali Perera", "Kasun Silva", "Amaya Fernando", "Ruwan Jayasinghe"][subjectIndex],
    schedule: ["Mon · 4:00 PM", "Tue · 3:30 PM", "Wed · 4:30 PM", "Sat · 9:00 AM"][subjectIndex],
    fee: [3500, 4000, 3000, 3200][subjectIndex] + index * 150,
    description: [`Build core concepts and problem-solving confidence for Grade ${grade}.`, `Explore key science topics through examples and guided practice.`, `Develop reading, writing, and communication skills.`, `Learn digital literacy, computing, and practical technology skills.`][subjectIndex],
  }));
}).flat();

const initialValues = {
  firstName: "", lastName: "", email: "", phoneNumber: "", dateOfBirth: "",
  guardianName: "", guardianPhone: "", grade: "", attendanceMode: "PHYSICAL",
  nic: "", hireDate: "", addressLine1: "", addressLine2: "", city: "", district: "", postalCode: "",
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11a4 4 0 0 0 0-8M21 20v-1.5a4 4 0 0 0-3-3.87"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4L7.5 15a8 8 0 0 1 0-1.9L6.1 12l1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 1.9Z" transform="translate(-1 -1) scale(1.08)"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  };
  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
}

function Field({ label, name, type = "text", placeholder, required = true, hint, values, onChange }: {
  label: string; name: keyof typeof initialValues; type?: string; placeholder?: string;
  required?: boolean; hint?: string; values: typeof initialValues; onChange: (name: keyof typeof initialValues, value: string) => void;
}) {
  return <label className="field"><span className="field-label">{label}{required && <span className="required"> *</span>}</span>
    <input name={name} type={type} required={required} placeholder={placeholder} pattern={name === "phoneNumber" || name === "guardianPhone" ? "(?:\\+94|0)7[0-9]{8}" : undefined} title={name === "phoneNumber" || name === "guardianPhone" ? "Use a Sri Lankan mobile number, for example 0771234567 or +94771234567." : undefined} value={values[name]} onChange={(event) => onChange(name, event.target.value)} />
    {hint && <span className="field-hint">{hint}</span>}
  </label>;
}

function SelectField({ label, name, options, values, onChange }: {
  label: string; name: keyof typeof initialValues; options: [string, string][]; values: typeof initialValues; onChange: (name: keyof typeof initialValues, value: string) => void;
}) {
  return <label className="field"><span className="field-label">{label}<span className="required"> *</span></span>
    <select name={name} required value={values[name]} onChange={(event) => onChange(name, event.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
  </label>;
}

export default function Home() {
  const [values, setValues] = useState(initialValues);
  const [activeForm, setActiveForm] = useState<AdminSection>("student");
  const [course, setCourse] = useState<CourseDraft>(emptyCourse);
  const [verifyingTeacher, setVerifyingTeacher] = useState(false);
  const [teacherVerified, setTeacherVerified] = useState(false);
  const [teacherVerification, setTeacherVerification] = useState("");
  const [createdCourse, setCreatedCourse] = useState<{ id: string; name: string; status: string } | null>(null);
  const [recentTeachers, setRecentTeachers] = useState<RecentTeacher[]>([]);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [enrollmentStudentId, setEnrollmentStudentId] = useState("");
  const [enrollmentGrade, setEnrollmentGrade] = useState("1");
  const [selectedSampleCourses, setSelectedSampleCourses] = useState<string[]>([]);
  const [sampleEnrollments, setSampleEnrollments] = useState<SampleEnrollment[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [specializationInput, setSpecializationInput] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080");
  const [token, setToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUser, setAdminUser] = useState<{ firstName?: string; lastName?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    setApiUrl(sessionStorage.getItem("mentify_api_url") || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080");
    const savedToken = sessionStorage.getItem("mentify_access_token") || "";
    setToken(savedToken);
    try {
      const savedTeachers = sessionStorage.getItem("mentify_recent_teachers");
      if (savedTeachers) setRecentTeachers(JSON.parse(savedTeachers));
    } catch {
      sessionStorage.removeItem("mentify_recent_teachers");
    }
    try {
      const savedStudents = sessionStorage.getItem("mentify_recent_students");
      if (savedStudents) setRecentStudents(JSON.parse(savedStudents));
      const savedCourses = sessionStorage.getItem("mentify_recent_courses");
      if (savedCourses) setRecentCourses(JSON.parse(savedCourses));
      const savedEnrollments = sessionStorage.getItem("mentify_sample_enrollments");
      if (savedEnrollments) setSampleEnrollments(JSON.parse(savedEnrollments));
    } catch {
      sessionStorage.removeItem("mentify_recent_students");
      sessionStorage.removeItem("mentify_recent_courses");
    }
    try {
      const savedAdmin = sessionStorage.getItem("mentify_admin_user");
      if (savedAdmin && savedToken) setAdminUser(JSON.parse(savedAdmin));
      else setShowSettings(true);
    } catch {
      sessionStorage.removeItem("mentify_admin_user");
      setShowSettings(true);
    }
  }, []);

  function change(name: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    if (notice?.kind === "error") setNotice(null);
  }

  async function signIn() {
    const normalizedUrl = apiUrl.trim().replace(/\/$/, "");
    if (!normalizedUrl || !adminEmail.trim() || !adminPassword) {
      setNotice({ kind: "error", title: "Complete the sign-in details", body: "Enter the API base URL, your admin email, and password." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(`${normalizedUrl}/api/v1/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: adminEmail.trim(), password: adminPassword }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || result.error || (response.status === 401 ? "Email or password is incorrect." : `The server returned ${response.status}.`));
      const session = result.data ?? {};
      const user = session.user ?? {};
      if (!session.accessToken) throw new Error("The login response did not contain an access token.");
      if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) throw new Error("This account does not have admin access. Sign in with an ADMIN or SUPER_ADMIN account.");
    sessionStorage.setItem("mentify_api_url", normalizedUrl);
      sessionStorage.setItem("mentify_access_token", session.accessToken);
      if (session.refreshToken) sessionStorage.setItem("mentify_refresh_token", session.refreshToken);
      sessionStorage.setItem("mentify_admin_user", JSON.stringify(user));
      setToken(session.accessToken);
      setAdminUser(user);
      setApiUrl(normalizedUrl);
      setAdminPassword("");
      setShowSettings(false);
      setNotice({ kind: "success", title: "Signed in securely", body: `Welcome${user.firstName ? `, ${user.firstName}` : ""}. You can now register students and teachers.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn’t connect to the sign-in service.";
      setNotice({ kind: "error", title: "Sign-in failed", body: message.includes("Failed to fetch") ? "Couldn’t reach the API. Check that the backend is running, the API URL is correct, and CORS allows this frontend origin." : message });
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const refreshToken = sessionStorage.getItem("mentify_refresh_token");
    if (refreshToken) {
      try {
        await fetch(`${apiUrl}/api/v1/auth/logout`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Always clear the local session, even when the API is unavailable.
      }
    }
    sessionStorage.removeItem("mentify_access_token");
    sessionStorage.removeItem("mentify_refresh_token");
    sessionStorage.removeItem("mentify_admin_user");
    setToken("");
    setAdminUser(null);
    setNotice({ kind: "success", title: "Signed out", body: "Your admin session was cleared from this browser tab." });
  }

  function switchForm(form: AdminSection) {
    setActiveForm(form);
    if (form === "student" || form === "teacher") {
      setValues(initialValues);
      setSpecializations([]);
      setSpecializationInput("");
    }
    if (form === "course") {
      setCourse(emptyCourse);
      setTeacherVerified(false);
      setTeacherVerification("");
      setCreatedCourse(null);
    }
    setNotice(null);
  }

  function changeCourse(name: keyof CourseDraft, value: string | boolean) {
    setCourse((current) => ({ ...current, [name]: value }));
    if (name === "assignedTeacherId") {
      setTeacherVerified(false);
      setTeacherVerification("");
    }
    if (notice?.kind === "error") setNotice(null);
  }

  async function authorizedApiRequest(url: string, options: RequestInit) {
    const send = (accessToken: string) => fetch(url, {
      ...options,
      headers: { ...(options.headers as Record<string, string> | undefined), Authorization: `Bearer ${accessToken}` },
    });
    const response = await send(token);
    if (response.status !== 401) return response;

    const refreshToken = sessionStorage.getItem("mentify_refresh_token");
    if (!refreshToken) return response;
    const refreshResponse = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }),
    });
    const refreshed = await refreshResponse.json().catch(() => ({}));
    if (!refreshResponse.ok || !refreshed.data?.accessToken) {
      await signOut();
      return response;
    }
    const nextAccessToken = refreshed.data.accessToken as string;
    sessionStorage.setItem("mentify_access_token", nextAccessToken);
    if (refreshed.data.refreshToken) sessionStorage.setItem("mentify_refresh_token", refreshed.data.refreshToken as string);
    setToken(nextAccessToken);
    return send(nextAccessToken);
  }

  async function verifyTeacher() {
    const teacherId = course.assignedTeacherId.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherId)) {
      setTeacherVerified(false);
      setTeacherVerification("Enter a valid teacher UUID first.");
      return;
    }
    setVerifyingTeacher(true);
    setTeacherVerification("");
    try {
      const response = await authorizedApiRequest(`${apiUrl}/api/v1/users/teachers/${encodeURIComponent(teacherId)}/exists`, { method: "GET" });
      const exists = await response.json().catch(() => false);
      if (!response.ok) throw new Error(response.status === 401 ? "Your admin session expired. Sign in again." : `Could not verify this teacher (HTTP ${response.status}).`);
      setTeacherVerified(exists === true);
      setTeacherVerification(exists === true ? "Teacher account verified." : "No teacher account was found for this ID.");
    } catch (error) {
      setTeacherVerified(false);
      setTeacherVerification(error instanceof Error ? error.message : "Could not verify teacher ID.");
    } finally {
      setVerifyingTeacher(false);
    }
  }

  async function submitCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setShowSettings(true);
      setNotice({ kind: "error", title: "Admin sign-in required", body: "Sign in with an ADMIN or SUPER_ADMIN account before creating a course." });
      return;
    }
    if (!teacherVerified) {
      setNotice({ kind: "error", title: "Verify the assigned teacher", body: "Use the teacher verification control before creating this course." });
      return;
    }
    if (course.courseEnrollmentId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(course.courseEnrollmentId.trim())) {
      setNotice({ kind: "error", title: "Invalid enrollment ID", body: "Course enrollment ID must be a valid UUID or left empty." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const payload = {
        courseName: course.courseName.trim(),
        courseDescription: course.courseDescription.trim(),
        courseThumbnail: course.courseThumbnail.trim() || null,
        courseFeeMonthly: Number(course.courseFeeMonthly),
        gradeId: course.gradeId.trim(),
        assignedTeacherId: course.assignedTeacherId.trim(),
        subject: course.subject.trim(),
        isOnline: course.isOnline,
        discountOfferPercent: Number(course.discountOfferPercent),
        isVisible: course.isVisible,
        isPublished: course.isPublished,
        courseEnrollmentId: course.courseEnrollmentId.trim() || null,
      };
      const response = await authorizedApiRequest(`${apiUrl}/api/v1/course`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = result.message || result.error || (response.status === 401 ? "Your admin session expired. Sign in again." : response.status === 403 ? "This account does not have permission to create courses." : response.status === 409 ? "A course with this name already exists for the selected grade." : `The server returned ${response.status}.`);
        throw new Error(message);
      }
      const created = result.data ?? {};
      setCreatedCourse({ id: created.id || "", name: created.courseName || course.courseName, status: created.courseStatus || (course.isPublished ? "PUBLISHED" : "DRAFT") });
      if (created.id) {
        const recent: RecentCourse[] = [{ id: created.id, name: created.courseName || course.courseName, subject: created.subject || course.subject }, ...recentCourses.filter((item) => item.id !== created.id)].slice(0, 50);
        sessionStorage.setItem("mentify_recent_courses", JSON.stringify(recent));
        setRecentCourses(recent);
      }
      setNotice({ kind: "success", title: "Course created", body: `${created.courseName || course.courseName} was created successfully as ${created.courseStatus || (course.isPublished ? "PUBLISHED" : "DRAFT")}.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create the course.";
      setNotice({ kind: "error", title: "Course creation failed", body: message.includes("Failed to fetch") ? "Couldn’t reach the course API. Confirm the backend and API gateway are running and allow this frontend origin." : message });
    } finally {
      setBusy(false);
    }
  }

  async function registerAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) {
      setShowSettings(true);
      setNotice({ kind: "error", title: "Admin sign-in required", body: "Sign in with an ADMIN or SUPER_ADMIN account before registering users." });
      return;
    }
    if (activeForm === "teacher" && specializations.length === 0) {
      setNotice({ kind: "error", title: "Add a teaching specialization", body: "Add at least one subject or area the teacher specializes in." });
      return;
    }
    setBusy(true);
    setNotice(null);
    const payload = {
      email: values.email.trim(), firstName: values.firstName.trim(), lastName: values.lastName.trim(),
      phoneNumber: values.phoneNumber.trim(), role: activeForm === "student" ? "STUDENT" : "TEACHER",
      ...(activeForm === "student" ? { studentProfile: {
        dateOfBirth: values.dateOfBirth, guardianName: values.guardianName.trim(), guardianPhone: values.guardianPhone.trim(),
        attendanceMode: values.attendanceMode, grade: values.grade,
      } } : { teacherProfile: {
        dateOfBirth: values.dateOfBirth, nic: values.nic.trim(), specializations, hireDate: values.hireDate,
      } }),
      address: {
        addressLine1: values.addressLine1.trim(), addressLine2: values.addressLine2.trim(), city: values.city.trim(),
        district: values.district.trim(), postalCode: values.postalCode.trim(),
      },
    };
    try {
      const requestOptions: RequestInit = {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.trim()}` }, body: JSON.stringify(payload),
      };
      let response = await fetch(`${apiUrl}/api/v1/admin/users/register`, requestOptions);
      if (response.status === 401) {
        const refreshToken = sessionStorage.getItem("mentify_refresh_token");
        if (refreshToken) {
          const refreshResponse = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }),
          });
          const refreshed = await refreshResponse.json().catch(() => ({}));
          if (refreshResponse.ok && refreshed.data?.accessToken) {
            const nextAccessToken = refreshed.data.accessToken as string;
            const nextRefreshToken = refreshed.data.refreshToken as string | undefined;
            sessionStorage.setItem("mentify_access_token", nextAccessToken);
            if (nextRefreshToken) sessionStorage.setItem("mentify_refresh_token", nextRefreshToken);
            setToken(nextAccessToken);
            requestOptions.headers = { "Content-Type": "application/json", Authorization: `Bearer ${nextAccessToken}` };
            response = await fetch(`${apiUrl}/api/v1/admin/users/register`, requestOptions);
          } else {
            await signOut();
          }
        }
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = result.message || result.error || (response.status === 401 ? "Your admin session may have expired. Sign in again and update API settings." : response.status === 403 ? `This account does not have permission to register ${activeForm === "student" ? "students" : "teachers"}.` : `The server returned ${response.status}.`);
        throw new Error(detail);
      }
      const registered = result.data ?? {};
      const identifier = activeForm === "student" ? registered.studentProfile?.studentId : registered.teacherProfile?.teacherCode;
      const kind = activeForm === "student" ? "Student" : "Teacher";
      const accountId = activeForm === "teacher" ? registered.id : null;
      if (activeForm === "teacher" && registered.id) {
        const teacher: RecentTeacher = { id: registered.id, name: `${registered.firstName || values.firstName} ${registered.lastName || values.lastName}`, email: registered.email || values.email };
        const updatedTeachers = [teacher, ...recentTeachers.filter((item) => item.id !== teacher.id)].slice(0, 20);
        setRecentTeachers(updatedTeachers);
        sessionStorage.setItem("mentify_recent_teachers", JSON.stringify(updatedTeachers));
      }
      if (activeForm === "student" && registered.id) {
        const student: RecentStudent = {
          id: registered.id,
          name: `${registered.firstName || values.firstName} ${registered.lastName || values.lastName}`,
          email: registered.email || values.email,
          grade: String(registered.studentProfile?.grade ?? values.grade),
          phoneNumber: registered.phoneNumber || values.phoneNumber,
          attendanceMode: registered.studentProfile?.attendanceMode || values.attendanceMode,
          studentCode: registered.studentProfile?.studentId,
        };
        const recent = [student, ...recentStudents.filter((item) => item.id !== student.id)].slice(0, 50);
        sessionStorage.setItem("mentify_recent_students", JSON.stringify(recent));
        setRecentStudents(recent);
        setEnrollmentGrade(student.grade || "1");
        setEnrollmentStudentId(student.id);
        setSelectedSampleCourses([]);
        setActiveForm("enrollment");
        setNotice({ kind: "success", title: "Student registered · ready to enroll", body: `${student.name} is selected in Grade ${student.grade}. Choose the sample courses to add.` });
      } else {
        setNotice({ kind: "success", title: `${kind} registered`, body: `${registered.firstName || values.firstName} ${registered.lastName || values.lastName} has been added${identifier ? ` with ${activeForm === "student" ? "student ID" : "teacher code"} ${identifier}` : ""}${accountId ? `. Teacher account ID for course assignment: ${accountId}` : ""}. A password setup invitation will be sent by the backend.` });
      }
      setValues(initialValues);
      setSpecializations([]);
      document.querySelector(".form-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn’t connect to the registration service. Check the API URL and try again.";
      setNotice({ kind: "error", title: "Registration failed", body: message.includes("Failed to fetch") ? "Couldn’t reach the API. Check that the backend is running, the API URL is correct, and CORS allows this frontend origin." : message });
    } finally {
      setBusy(false);
    }
  }

  const gradeStudents = recentStudents.filter((student) => (student.grade || "1") === enrollmentGrade);
  const selectedEnrollmentStudent = recentStudents.find((student) => student.id === enrollmentStudentId) || null;
  const selectedEnrollment = sampleEnrollments.find((item) => item.studentId === enrollmentStudentId);
  const gradeCourses = sampleCourses.filter((sampleCourse) => sampleCourse.grade === enrollmentGrade);

  function chooseEnrollmentGrade(grade: string) {
    setEnrollmentGrade(grade);
    const nextStudent = recentStudents.find((student) => (student.grade || "1") === grade);
    setEnrollmentStudentId(nextStudent?.id || "");
    setSelectedSampleCourses([]);
    setNotice(null);
  }

  function chooseEnrollmentStudent(student: RecentStudent) {
    setEnrollmentGrade(student.grade || "1");
    setEnrollmentStudentId(student.id);
    setSelectedSampleCourses([]);
    setNotice(null);
  }

  function saveSampleEnrollment() {
    if (!selectedEnrollmentStudent || selectedSampleCourses.length === 0) return;
    const current = sampleEnrollments.find((item) => item.studentId === selectedEnrollmentStudent.id);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const nextRecord: SampleEnrollment = {
      studentId: selectedEnrollmentStudent.id,
      courseIds: [...new Set([...(current?.courseIds || []), ...selectedSampleCourses])],
      enrolledOn: current?.enrolledOn || today,
      updatedOn: today,
    };
    const nextEnrollments = [nextRecord, ...sampleEnrollments.filter((item) => item.studentId !== nextRecord.studentId)];
    sessionStorage.setItem("mentify_sample_enrollments", JSON.stringify(nextEnrollments));
    setSampleEnrollments(nextEnrollments);
    setSelectedSampleCourses([]);
    setNotice({ kind: "success", title: "Sample enrollment saved", body: `${selectedEnrollmentStudent.name} is now enrolled in ${nextRecord.courseIds.length} Grade ${enrollmentGrade} course${nextRecord.courseIds.length === 1 ? "" : "s"}.` });
  }

  return <div className="dashboard-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="Mentify home"><span className="brand-mark"><span>m</span></span><span className="brand-name">mentify<span>.</span></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-picker"><span className="workspace-avatar">M</span><span className="workspace-copy"><strong>Mentify Academy</strong><small>Education workspace</small></span><span className="workspace-dots">···</span></div>
      <nav className="nav-group" aria-label="Main navigation">
        <span className="nav-caption">OVERVIEW</span>
        <a className="nav-link" href="#overview"><Icon name="grid"/><span>Dashboard</span></a>
        <span className="nav-caption nav-caption-spaced">PEOPLE</span>
        <a className={`nav-link ${activeForm === "student" ? "active" : ""}`} href="#registration" onClick={(event) => { event.preventDefault(); switchForm("student"); }}><Icon name="users"/><span>Students</span><span className="nav-chevron"><Icon name="chevron" size={16}/></span></a>
        {activeForm === "student" && <a className="nav-link sub-link selected" href="#registration"><span className="sub-dot"/>Register student</a>}
        <a className={`nav-link ${activeForm === "teacher" ? "active" : ""}`} href="#registration" onClick={(event) => { event.preventDefault(); switchForm("teacher"); }}><Icon name="users"/><span>Teachers</span><span className="nav-chevron"><Icon name="chevron" size={16}/></span></a>
        {activeForm === "teacher" && <a className="nav-link sub-link selected" href="#registration"><span className="sub-dot"/>Register teacher</a>}
        <span className="nav-caption nav-caption-spaced">LEARNING</span>
        <a className={`nav-link ${activeForm === "course" ? "active" : ""}`} href="#registration" onClick={(event) => { event.preventDefault(); switchForm("course"); }}><Icon name="book"/><span>Courses</span>{activeForm === "course" && <span className="nav-chevron"><Icon name="chevron" size={16}/></span>}</a>
        {activeForm === "course" && <a className="nav-link sub-link selected" href="#registration"><span className="sub-dot"/>Create course</a>}
        <a className={`nav-link ${activeForm === "enrollment" ? "active" : ""}`} href="#registration" onClick={(event) => { event.preventDefault(); switchForm("enrollment"); }}><Icon name="calendar"/><span>Enrollments</span>{activeForm === "enrollment" && <span className="nav-chevron"><Icon name="chevron" size={16}/></span>}</a>
        {activeForm === "enrollment" && <a className="nav-link sub-link selected" href="#registration"><span className="sub-dot"/>Enroll student</a>}
        <a className="nav-link" href="#registration"><Icon name="calendar"/><span>Classes</span></a>
      </nav>
      <div className="sidebar-bottom"><a className="nav-link" href="#api-settings" onClick={(event) => { event.preventDefault(); setShowSettings(true); }}><Icon name="settings"/><span>{adminUser ? "Account settings" : "Admin sign in"}</span></a>
        <div className="profile-card"><div className="profile-avatar">{adminUser ? `${adminUser.firstName?.[0] || "A"}${adminUser.lastName?.[0] || "D"}` : "AD"}</div><span className="profile-copy"><strong>{adminUser ? `${adminUser.firstName || "Admin"} ${adminUser.lastName || ""}` : "Admin session"}</strong><small>{adminUser?.email || "Sign in to get started"}</small></span><button className="profile-menu" type="button" onClick={() => adminUser ? void signOut() : setShowSettings(true)} aria-label={adminUser ? "Sign out" : "Sign in"}>{adminUser ? "↗" : "···"}</button></div>
      </div>
    </aside>

    <main className="main-area" id="top">
      <header className="topbar"><div className="breadcrumb"><span>{activeForm === "course" || activeForm === "enrollment" ? "Academic" : "People"}</span><Icon name="chevron" size={14}/><span className="crumb-current">{activeForm === "student" ? "Students" : activeForm === "teacher" ? "Teachers" : activeForm === "course" ? "Courses" : "Enrollments"}</span><Icon name="chevron" size={14}/><span className="crumb-current">{activeForm === "course" ? "Create" : activeForm === "enrollment" ? "Enroll student" : "Register"}</span></div><div className="topbar-right"><span className="secure-indicator"><span className="secure-dot"/>{adminUser ? `Signed in as ${adminUser.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}` : "Admin sign in required"}</span><button className="top-avatar" aria-label={adminUser ? "Account settings" : "Sign in"} onClick={() => setShowSettings(true)}>{adminUser ? `${adminUser.firstName?.[0] || "A"}${adminUser.lastName?.[0] || "D"}` : "AD"}</button></div></header>
      <div className="content-wrap" id="registration">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{activeForm === "course" || activeForm === "enrollment" ? "ACADEMIC MANAGEMENT" : "PEOPLE MANAGEMENT"}</div><h1>{activeForm === "course" ? "Create a course" : activeForm === "enrollment" ? "Grade enrollments" : `Register a ${activeForm}`}</h1><p className="page-description">{activeForm === "course" ? "Set up a course, assign a teacher, and choose its grade and visibility." : activeForm === "enrollment" ? "Review each grade’s student roster, enrollment status, and available courses." : `Add a ${activeForm} to your academy and send their account setup invitation.`}</p></div><button className="text-action" type="button" onClick={() => setShowSettings(true)}><Icon name="settings" size={16}/> API settings</button></div>

        {activeForm !== "course" && activeForm !== "enrollment" && <div className="progress-strip"><div className="progress-step active-step"><span className="step-number"><Icon name="check" size={13}/></span><span>{activeForm === "student" ? "Student" : "Teacher"} details</span></div><span className="progress-line"/><div className="progress-step upcoming-step"><span className="step-number">2</span><span>Account invitation</span></div><span className="progress-note"><Icon name="shield" size={15}/> Secure registration</span></div>}

        {notice && <div className={`notice ${notice.kind}`} role="status"><span className="notice-icon"><Icon name={notice.kind === "success" ? "check" : "alert"} size={18}/></span><span className="notice-copy"><strong>{notice.title}</strong><span>{notice.body}</span></span><button className="notice-dismiss" type="button" onClick={() => setNotice(null)} aria-label="Dismiss"><Icon name="close" size={16}/></button></div>}

        {activeForm === "course" ? <form className="form-card course-form" onSubmit={submitCourse}>
          <section className="form-section"><div className="section-heading"><div className="section-icon"><Icon name="book" size={18}/></div><div><h2>Course details</h2><p>Give the course a clear name and description for learners.</p></div><span className="section-index">01</span></div>
            <div className="field-grid two-col"><label className="field"><span className="field-label">Course name<span className="required"> *</span></span><input required maxLength={150} value={course.courseName} placeholder="e.g. Grade 10 Mathematics" onChange={(event) => changeCourse("courseName", event.target.value)} /></label><label className="field"><span className="field-label">Subject<span className="required"> *</span></span><input required maxLength={100} value={course.subject} placeholder="e.g. Mathematics" onChange={(event) => changeCourse("subject", event.target.value)} /></label><label className="field course-description-field"><span className="field-label">Course description<span className="required"> *</span></span><textarea required maxLength={2000} rows={5} value={course.courseDescription} placeholder="Describe what students will learn in this course…" onChange={(event) => changeCourse("courseDescription", event.target.value)} /><span className="field-hint">{course.courseDescription.length}/2000 characters</span></label><label className="field"><span className="field-label">Course thumbnail URL</span><input type="url" maxLength={255} value={course.courseThumbnail} placeholder="https://example.com/course-image.jpg" onChange={(event) => changeCourse("courseThumbnail", event.target.value)} /><span className="field-hint">Optional. Provide a public image URL.</span></label></div>
          </section>
          <section className="form-section"><div className="section-heading"><div className="section-icon lavender"><Icon name="users" size={18}/></div><div><h2>Grade &amp; instructor</h2><p>Assign an existing grade and a teacher to this course.</p></div><span className="section-index">02</span></div>
            <div className="field-grid two-col"><label className="field"><span className="field-label">Grade ID<span className="required"> *</span></span><input required pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" title="Enter the UUID for the grade." value={course.gradeId} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" onChange={(event) => changeCourse("gradeId", event.target.value)} /><span className="field-hint">The backend requires a grade UUID. No grade-list endpoint is currently available, so use an existing grade ID.</span></label><div className="field"><span className="field-label">Assigned teacher ID<span className="required"> *</span></span><div className="verify-input-row"><input aria-label="Assigned teacher UUID" list="recent-teacher-ids" required pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" title="Enter the UUID for an existing teacher." value={course.assignedTeacherId} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" onChange={(event) => changeCourse("assignedTeacherId", event.target.value)} /><datalist id="recent-teacher-ids">{recentTeachers.map((teacher) => <option key={teacher.id} value={teacher.id} label={`${teacher.name} · ${teacher.email}`} />)}</datalist><button className="secondary-button verify-button" type="button" disabled={verifyingTeacher || !course.assignedTeacherId.trim()} onClick={() => void verifyTeacher()}>{verifyingTeacher ? <><span className="spinner spinner-dark"/> Checking</> : "Verify ID"}</button></div><span className={`field-hint ${teacherVerification ? teacherVerified ? "verified-hint" : "invalid-hint" : ""}`}>{teacherVerification || (recentTeachers.length ? `Choose one of ${recentTeachers.length} recently registered teachers or enter a teacher UUID, then verify it.` : "Register a teacher first or paste an existing teacher UUID, then verify it.")}</span></div></div>
          </section>
          <section className="form-section"><div className="section-heading"><div className="section-icon mint"><Icon name="settings" size={18}/></div><div><h2>Pricing &amp; availability</h2><p>Choose the monthly fee, delivery mode, and publishing options.</p></div><span className="section-index">03</span></div>
            <div className="field-grid two-col"><label className="field"><span className="field-label">Monthly fee (LKR)<span className="required"> *</span></span><div className="money-input"><span>LKR</span><input required type="number" min="0.01" step="0.01" value={course.courseFeeMonthly} placeholder="2500.00" onChange={(event) => changeCourse("courseFeeMonthly", event.target.value)} /></div></label><label className="field"><span className="field-label">Discount offer (%)</span><input type="number" min="0" max="100" step="0.01" value={course.discountOfferPercent} onChange={(event) => changeCourse("discountOfferPercent", event.target.value)} /><span className="field-hint">Enter a value between 0 and 100.</span></label><label className="field"><span className="field-label">Delivery mode</span><select value={course.isOnline ? "online" : "in-person"} onChange={(event) => changeCourse("isOnline", event.target.value === "online")}><option value="online">Online</option><option value="in-person">In person</option></select></label><label className="field"><span className="field-label">Enrollment ID</span><input value={course.courseEnrollmentId} placeholder="Optional UUID" onChange={(event) => changeCourse("courseEnrollmentId", event.target.value)} /><span className="field-hint">Optional link to an enrollment record.</span></label></div>
            <div className="course-switches"><label className="toggle-row"><span className="toggle-copy"><strong>Visible to students</strong><small>Allow students to discover this course.</small></span><input type="checkbox" checked={course.isVisible} onChange={(event) => changeCourse("isVisible", event.target.checked)} /><span className="toggle-control"/></label><label className="toggle-row"><span className="toggle-copy"><strong>Publish course</strong><small>{course.isPublished ? "This course will be published immediately." : "Save as a draft and publish it later."}</small></span><input type="checkbox" checked={course.isPublished} onChange={(event) => changeCourse("isPublished", event.target.checked)} /><span className="toggle-control"/></label></div>
          </section>
          <div className="form-footer"><span className="required-note"><span className="required">*</span> Required fields · Teacher ID must be verified</span><div className="form-actions"><button className="secondary-button" type="reset" onClick={() => { setCourse(emptyCourse); setTeacherVerified(false); setTeacherVerification(""); setCreatedCourse(null); setNotice(null); }}>Clear form</button><button className="primary-button" type="submit" disabled={busy}>{busy ? <><span className="spinner"/> Creating…</> : <>Create course <Icon name="arrow" size={16}/></>}</button></div></div>
        </form> : activeForm === "enrollment" ? <section className="grade-workspace">
          <div className="sample-mode-banner"><span className="sample-mode-icon"><Icon name="book" size={17}/></span><span><strong>Sample course catalog</strong><small>Grade-based demo courses and enrollment changes are saved for this browser session.</small></span><span className="sample-mode-tag">DEMO DATA</span></div>
          <div className="grade-picker-heading"><div><h2>Browse by grade</h2><p>Select a grade to view its students, courses, and enrollment activity.</p></div><button type="button" className="secondary-button" onClick={() => switchForm("student")}><Icon name="plus" size={15}/> Register student</button></div>
          <div className="grade-tabs" role="tablist" aria-label="Grades">{Array.from({ length: 13 }, (_, index) => String(index + 1)).map((grade) => { const count = recentStudents.filter((student) => (student.grade || "1") === grade).length; return <button className={`grade-tab ${enrollmentGrade === grade ? "active" : ""}`} type="button" role="tab" aria-selected={enrollmentGrade === grade} key={grade} onClick={() => chooseEnrollmentGrade(grade)}><span>Grade</span><strong>{grade}</strong><small>{count} student{count === 1 ? "" : "s"}</small></button>; })}</div>
          <div className="grade-summary-grid"><div className="grade-summary-card"><span className="summary-icon violet"><Icon name="users" size={17}/></span><span><small>Students in grade</small><strong>{gradeStudents.length}</strong></span></div><div className="grade-summary-card"><span className="summary-icon green"><Icon name="check" size={17}/></span><span><small>Students enrolled</small><strong>{gradeStudents.filter((student) => sampleEnrollments.some((item) => item.studentId === student.id && item.courseIds.length > 0)).length}</strong></span></div><div className="grade-summary-card"><span className="summary-icon blue"><Icon name="book" size={17}/></span><span><small>Available courses</small><strong>{gradeCourses.length}</strong></span></div><div className="grade-summary-card"><span className="summary-icon amber"><Icon name="calendar" size={17}/></span><span><small>Open enrollments</small><strong>{gradeStudents.filter((student) => !sampleEnrollments.some((item) => item.studentId === student.id && item.courseIds.length > 0)).length}</strong></span></div></div>
          <div className="grade-columns">
            <section className="roster-card"><div className="roster-heading"><div><h2>Grade {enrollmentGrade} students</h2><p>Choose a student to review or add courses.</p></div><span className="roster-count">{gradeStudents.length}</span></div>
              {gradeStudents.length ? <div className="roster-list">{gradeStudents.map((student) => { const enrollment = sampleEnrollments.find((item) => item.studentId === student.id); return <button type="button" key={student.id} className={`roster-student ${enrollmentStudentId === student.id ? "selected" : ""}`} onClick={() => chooseEnrollmentStudent(student)}><span className="roster-avatar">{student.name.trim().charAt(0).toUpperCase()}</span><span className="roster-student-copy"><strong>{student.name}</strong><small>{student.email}</small><span className={`enrollment-status ${enrollment?.courseIds.length ? "has-enrollment" : "no-enrollment"}`}>{enrollment?.courseIds.length ? `${enrollment.courseIds.length} course${enrollment.courseIds.length === 1 ? "" : "s"} enrolled` : "Not enrolled"}</span></span><Icon name="chevron" size={17}/></button>; })}</div> : <div className="roster-empty"><span className="empty-roster-icon"><Icon name="users" size={21}/></span><strong>No students in Grade {enrollmentGrade} yet</strong><p>Register a student and they’ll appear here automatically.</p><button type="button" className="primary-button" onClick={() => switchForm("student")}><Icon name="plus" size={15}/> Register a student</button></div>}
            </section>
            <section className="student-enrollment-card">{selectedEnrollmentStudent && (selectedEnrollmentStudent.grade || "1") === enrollmentGrade ? <>
              <div className="student-detail-heading"><span className="student-detail-avatar">{selectedEnrollmentStudent.name.trim().charAt(0).toUpperCase()}</span><div><span className="detail-kicker">STUDENT PROFILE</span><h2>{selectedEnrollmentStudent.name}</h2><p>{selectedEnrollmentStudent.email}</p></div><span className="grade-pill">Grade {enrollmentGrade}</span></div>
              <div className="student-detail-facts"><div><small>Phone</small><strong>{selectedEnrollmentStudent.phoneNumber || "Not provided"}</strong></div><div><small>Attendance</small><strong>{selectedEnrollmentStudent.attendanceMode || "Not provided"}</strong></div><div><small>Enrollment record</small><strong>{selectedEnrollment ? `Started ${selectedEnrollment.enrolledOn}` : "No courses yet"}</strong></div></div>
              <div className="current-courses"><div className="course-section-title"><div><h3>Current courses</h3><p>Courses already assigned to this student.</p></div><span>{selectedEnrollment?.courseIds.length || 0}</span></div>{selectedEnrollment?.courseIds.length ? <div className="current-course-chips">{selectedEnrollment.courseIds.map((courseId) => { const item = sampleCourses.find((sampleCourse) => sampleCourse.id === courseId); return <span className="current-course-chip" key={courseId}><Icon name="check" size={13}/>{item?.name || courseId}</span>; })}</div> : <p className="no-courses-copy">No courses enrolled yet. Add a course below.</p>}</div>
              <div className="available-courses"><div className="course-section-title"><div><h3>Grade {enrollmentGrade} course catalog</h3><p>Sample courses available to this grade.</p></div><span>{gradeCourses.length} courses</span></div><div className="sample-course-list">{gradeCourses.map((item) => { const enrolled = Boolean(selectedEnrollment?.courseIds.includes(item.id)); const selected = selectedSampleCourses.includes(item.id); return <article key={item.id} className={`sample-course-card ${selected ? "selected" : ""} ${enrolled ? "enrolled" : ""}`}><label className="sample-course-select"><input type="checkbox" disabled={enrolled} checked={enrolled || selected} onChange={(event) => setSelectedSampleCourses((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}/><span className="course-choice-check"><Icon name="check" size={13}/></span><span className="sample-course-copy"><strong>{item.name}</strong><small>{item.subject} · {item.teacher}</small></span></label><p>{item.description}</p><div className="sample-course-meta"><span>{item.schedule}</span><strong>LKR {item.fee.toLocaleString()} / month</strong>{enrolled && <span className="added-tag">ENROLLED</span>}</div></article>; })}</div></div>
              <div className="enrollment-save-row"><span>{selectedSampleCourses.length ? `${selectedSampleCourses.length} new course${selectedSampleCourses.length === 1 ? "" : "s"} selected` : "Select courses to add to this student"}</span><button type="button" className="primary-button" disabled={!selectedSampleCourses.length} onClick={saveSampleEnrollment}>Save enrollment <Icon name="arrow" size={15}/></button></div>
            </> : <div className="student-detail-empty"><span className="empty-roster-icon"><Icon name="book" size={21}/></span><strong>Select a Grade {enrollmentGrade} student</strong><p>Student information, current courses, and available courses will appear here.</p></div>}</section>
          </div>
        </section> : <form className="form-card" onSubmit={registerAccount}>
          <section className="form-section"><div className="section-heading"><div className="section-icon"><Icon name="users" size={18}/></div><div><h2>{activeForm === "student" ? "Personal information" : "Teacher information"}</h2><p>{activeForm === "student" ? "Start with the student’s basic details." : "Add the teacher’s contact and employment details."}</p></div><span className="section-index">01</span></div>
            <div className="field-grid two-col"><Field label="First name" name="firstName" placeholder="e.g. Amaya" values={values} onChange={change}/><Field label="Last name" name="lastName" placeholder="e.g. Perera" values={values} onChange={change}/><Field label="Email address" name="email" type="email" placeholder={activeForm === "student" ? "student@example.com" : "teacher@example.com"} hint="Their account invitation will be sent to this email." values={values} onChange={change}/><Field label="Phone number" name="phoneNumber" type="tel" placeholder="0771234567" hint="Use a Sri Lankan mobile number." values={values} onChange={change}/><Field label="Date of birth" name="dateOfBirth" type="date" values={values} onChange={change}/>{activeForm === "student" ? <SelectField label="Grade" name="grade" options={[["", "Select grade"], ...Array.from({ length: 13 }, (_, i) => [String(i + 1), `Grade ${i + 1}`] as [string, string])]} values={values} onChange={change}/> : <><Field label="NIC number" name="nic" placeholder="e.g. 901234567V" hint="Enter the teacher’s national identity number." values={values} onChange={change}/><Field label="Hire date" name="hireDate" type="date" values={values} onChange={change}/></>}</div>
          </section>
          {activeForm === "student" ? <section className="form-section"><div className="section-heading"><div className="section-icon lavender"><Icon name="users" size={18}/></div><div><h2>Guardian &amp; attendance</h2><p>Keep a guardian contact on file and choose how the student attends.</p></div><span className="section-index">02</span></div>
            <div className="field-grid two-col"><Field label="Guardian full name" name="guardianName" placeholder="e.g. Nadeesha Perera" values={values} onChange={change}/><Field label="Guardian phone" name="guardianPhone" type="tel" placeholder="0779876543" values={values} onChange={change}/><div className="attendance-field"><SelectField label="Attendance mode" name="attendanceMode" options={[["PHYSICAL", "In person"], ["ONLINE", "Online"], ["HYBRID", "Hybrid"]]} values={values} onChange={change}/><span className="field-hint">You can update this later in the student profile.</span></div></div>
          </section> : <section className="form-section"><div className="section-heading"><div className="section-icon lavender"><Icon name="book" size={18}/></div><div><h2>Teaching specializations</h2><p>Add the subjects or areas this teacher can teach.</p></div><span className="section-index">02</span></div>
            <div className="specialization-input-wrap"><label className="field"><span className="field-label">Specializations<span className="required"> *</span></span><div className="specialization-entry"><input value={specializationInput} placeholder="Type a subject and press Enter" onChange={(event) => setSpecializationInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); const next = specializationInput.trim(); if (next && !specializations.some((item) => item.toLowerCase() === next.toLowerCase())) setSpecializations((current) => [...current, next]); setSpecializationInput(""); } }} /><button className="secondary-button" type="button" onClick={() => { const next = specializationInput.trim(); if (next && !specializations.some((item) => item.toLowerCase() === next.toLowerCase())) setSpecializations((current) => [...current, next]); setSpecializationInput(""); }}>Add subject</button></div><span className="field-hint">Add at least one specialization. You can include several.</span></label>{specializations.length > 0 && <div className="specialization-chips" aria-label="Selected specializations">{specializations.map((subject) => <span className="specialization-chip" key={subject}>{subject}<button type="button" aria-label={`Remove ${subject}`} onClick={() => setSpecializations((current) => current.filter((item) => item !== subject))}>×</button></span>)}</div>}</div>
          </section>}
          <section className="form-section address-section"><div className="section-heading"><div className="section-icon mint"><Icon name="pin" size={18}/></div><div><h2>Home address</h2><p>Add the {activeForm === "student" ? "student’s" : "teacher’s"} residential address.</p></div><span className="section-index">03</span></div>
            <div className="field-grid two-col"><Field label="Address line 1" name="addressLine1" placeholder="House number and street" values={values} onChange={change}/><Field label="Address line 2" name="addressLine2" placeholder="Apartment, suite, etc." required={false} values={values} onChange={change}/><Field label="City" name="city" placeholder="e.g. Colombo" values={values} onChange={change}/><Field label="District" name="district" placeholder="e.g. Colombo" values={values} onChange={change}/><Field label="Postal code" name="postalCode" placeholder="e.g. 00100" required={false} values={values} onChange={change}/></div>
          </section>
          <div className="form-footer"><span className="required-note"><span className="required">*</span> Required fields</span><div className="form-actions"><button className="secondary-button" type="reset" onClick={() => { setValues(initialValues); setSpecializations([]); setSpecializationInput(""); setNotice(null); }}>Clear form</button><button className="primary-button" type="submit" disabled={busy}>{busy ? <><span className="spinner"/> Registering…</> : <>Register {activeForm} <Icon name="arrow" size={16}/></>}</button></div></div>
        </form>}

        {activeForm === "course" ? createdCourse ? <div className="course-created-card"><div className="created-check"><Icon name="check" size={19}/></div><div><strong>Course is ready</strong><p>{createdCourse.name} · {createdCourse.status}{createdCourse.id ? ` · ID ${createdCourse.id}` : ""}</p><small>The course record is created. Modules, lessons, and learning materials can be added next.</small></div><button className="secondary-button" type="button" onClick={() => switchForm("course")}>Create another</button></div> : <div className="invitation-note course-contract-note"><div className="invitation-icon"><Icon name="shield" size={18}/></div><div><strong>Course content comes next</strong><p>The backend creates the course record here. Its separate module, lesson, and material endpoints can be connected once the course has been created.</p></div><span className="invitation-lock"><Icon name="book" size={17}/></span></div> : activeForm === "enrollment" ? <div className="invitation-note course-contract-note"><div className="invitation-icon"><Icon name="shield" size={18}/></div><div><strong>Sample enrollment workspace</strong><p>Course assignments here use sample records saved in this browser session. The live enrollment API needs real course UUIDs, but the backend currently has no grade-based course catalog endpoint to provide them.</p></div><span className="invitation-lock"><Icon name="users" size={17}/></span></div> : <div className="invitation-note"><div className="invitation-icon"><Icon name="mail" size={18}/></div><div><strong>What happens next?</strong><p>The {activeForm} will receive a secure email invitation to verify their address and set a password. You don&apos;t need to create one for them.</p></div><span className="invitation-lock"><Icon name="shield" size={17}/></span></div>}
        <footer className="page-footer"><span>© 2026 Mentify Academy</span><span><Icon name="shield" size={14}/> User data is securely encrypted</span></footer>
      </div>
    </main>

    {showSettings && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSettings(false); }}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="modal-heading"><div className="modal-icon"><Icon name="shield" size={19}/></div><button className="notice-dismiss" type="button" onClick={() => setShowSettings(false)} aria-label="Close"><Icon name="close" size={17}/></button></div><h2 id="settings-title">{adminUser ? "Admin account" : "Sign in to Mentify"}</h2><p className="modal-description">{adminUser ? `You’re signed in as ${adminUser.email}. Your session is stored in this browser tab.` : "Sign in with your academy admin account to manage students, teachers, and courses. Only ADMIN and SUPER_ADMIN accounts can continue."}</p>{notice?.kind === "error" && <div className="modal-error" role="alert"><Icon name="alert" size={16}/><span>{notice.body}</span></div>}<label className="field modal-field"><span className="field-label">API base URL</span><input value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="http://localhost:8080" autoComplete="url" /></label>{!adminUser && <><label className="field modal-field"><span className="field-label">Admin email</span><input type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="admin@youracademy.lk" autoComplete="username" /></label><label className="field modal-field"><span className="field-label">Password</span><input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" onKeyDown={(event) => { if (event.key === "Enter") void signIn(); }} /><span className="field-hint">Your password is sent directly to your Mentify API and is never saved in this browser.</span></label></>}<div className="modal-actions">{adminUser && <button className="secondary-button" type="button" onClick={() => void signOut()}>Sign out</button>}<button className="secondary-button" type="button" onClick={() => setShowSettings(false)}>Cancel</button>{!adminUser && <button className="primary-button" type="button" disabled={busy} onClick={() => void signIn()}>{busy ? <><span className="spinner"/> Signing in…</> : <>Sign in <Icon name="arrow" size={16}/></>}</button>}</div></section></div>}
  </div>;
}
