import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type {
  AccountStatus,
  AdministratorProfile,
  StudentProfile,
  TeacherProfile,
  UserRole,
} from "../types";

interface BackendAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

interface BackendUser {
  id: string;
  authUserId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  accountStatus: string;
  createdAt?: string;
  lastLogin?: string | null;
  accountLocked?: boolean;
  studentProfile?: {
    studentId?: string;
    grade?: string;
    dateOfBirth?: string;
    guardianName?: string;
    guardianPhone?: string;
    attendanceMode?: StudentProfile["attendanceMode"] | "PHYSICAL";
    avatarUrl?: string;
  } | null;
  teacherProfile?: {
    teacherCode?: string;
    dateOfBirth?: string;
    nic?: string;
    specializations?: string[];
    hireDate?: string;
    avatarUrl?: string;
  } | null;
  adminProfile?: {
    adminCode?: string;
    dateOfBirth?: string;
    nic?: string;
  } | null;
  address?: BackendAddress | null;
}

export interface AdminUsersData {
  students: StudentProfile[];
  teachers: TeacherProfile[];
  administrators: AdministratorProfile[];
}

export interface RegisterStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob: string;
  grade: string;
  schoolName: string;
  guardianName: string;
  guardianPhone: string;
  attendanceMode: "IN_PERSON" | "ONLINE" | "HYBRID";
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface RegisterTeacherRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob: string;
  nic: string;
  hireDate: string;
  specializations: string[];
  addressLine1: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface RegisterAdministratorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob: string;
  nic: string;
  addressLine1: string;
  city: string;
  district: string;
  postalCode: string;
}

function accountStatus(value: string): AccountStatus {
  if (value === "ACTIVE" || value === "INVITED" || value === "SUSPENDED") return value;
  return "INACTIVE";
}

function commonUser(user: BackendUser) {
  return {
    id: user.id,
    keycloakUserId: user.authUserId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phoneNumber,
    role: user.role,
    status: accountStatus(user.accountStatus),
    createdAt: user.createdAt || "",
    lastLogin: user.lastLogin || undefined,
    accountLocked: user.accountLocked === true,
    avatarUrl: user.studentProfile?.avatarUrl || user.teacherProfile?.avatarUrl,
    addressLine1: user.address?.addressLine1 || "",
    addressLine2: user.address?.addressLine2 || "",
    city: user.address?.city || "",
    district: user.address?.district || "",
    postalCode: user.address?.postalCode || "",
  };
}

function mapStudent(user: BackendUser): StudentProfile {
  const profile = user.studentProfile;
  return {
    ...commonUser(user),
    role: "STUDENT",
    // The database user UUID is an internal identity and must never be shown
    // as the student's ID. Student IDs are generated in the profile, e.g.
    // `TIT-09-03`.
    studentId: profile?.studentId?.trim() || "Student ID unavailable",
    grade: profile?.grade || "Not assigned",
    guardianName: profile?.guardianName || "Not recorded",
    guardianPhone: profile?.guardianPhone || "Not recorded",
    attendanceMode:
      profile?.attendanceMode === "PHYSICAL" ? "IN_PERSON" : profile?.attendanceMode || "IN_PERSON",
    dob: profile?.dateOfBirth || "",
    enrolledCourseCount: 0,
    averageGrade: "—",
  };
}

function mapTeacher(user: BackendUser): TeacherProfile {
  const profile = user.teacherProfile;
  return {
    ...commonUser(user),
    role: "TEACHER",
    teacherCode: profile?.teacherCode || user.id,
    specializations: profile?.specializations || [],
    hireDate: profile?.hireDate || "",
    dob: profile?.dateOfBirth || "",
    nic: profile?.nic || "",
    assignedCourseCount: 0,
    activeStudentsCount: 0,
  };
}

function mapAdministrator(user: BackendUser): AdministratorProfile {
  const profile = user.adminProfile;
  return {
    ...commonUser(user),
    role: user.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
    adminCode: profile?.adminCode || user.id,
    dob: profile?.dateOfBirth || "",
    nic: profile?.nic || "",
    department: "Administration",
    permissions: [],
  };
}

async function fetchUsersByRole(role: UserRole) {
  const response = await apiRequest<ApiResponse<BackendUser[]>>(
    `/api/v1/admin/users?role=${encodeURIComponent(role)}`,
  );
  return response.data || [];
}

export async function fetchAdminUsers(): Promise<AdminUsersData> {
  const [students, teachers, admins, superAdmins] = await Promise.all([
    fetchUsersByRole("STUDENT"),
    fetchUsersByRole("TEACHER"),
    fetchUsersByRole("ADMIN"),
    fetchUsersByRole("SUPER_ADMIN"),
  ]);

  return {
    students: students.map(mapStudent),
    teachers: teachers.map(mapTeacher),
    administrators: [...admins, ...superAdmins].map(mapAdministrator),
  };
}

function addressFromRequest(request: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
}) {
  return {
    addressLine1: request.addressLine1.trim(),
    addressLine2: request.addressLine2?.trim() || undefined,
    city: request.city.trim(),
    district: request.district.trim(),
    postalCode: request.postalCode.trim() || undefined,
  };
}

function registrationResponse(response: ApiResponse<BackendUser>) {
  if (!response.data) throw new Error(response.message || "Registration returned no user.");
  return response.data;
}

export async function registerStudent(request: RegisterStudentRequest): Promise<StudentProfile> {
  const response = await apiRequest<ApiResponse<BackendUser>>("/api/v1/admin/users/register", {
    method: "POST",
    body: {
      email: request.email.trim(),
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),
      phoneNumber: request.phone?.trim() || undefined,
      role: "STUDENT",
      studentProfile: {
        dateOfBirth: request.dob,
        guardianName: request.guardianName.trim(),
        guardianPhone: request.guardianPhone.trim(),
        attendanceMode:
          request.attendanceMode === "IN_PERSON" ? "PHYSICAL" : request.attendanceMode,
        grade: request.grade.replace(/^Grade\s+/i, ""),
        schoolName: request.schoolName.trim(),
      },
      address: addressFromRequest(request),
    },
  });
  return mapStudent(registrationResponse(response));
}

export async function registerTeacher(request: RegisterTeacherRequest): Promise<TeacherProfile> {
  const response = await apiRequest<ApiResponse<BackendUser>>("/api/v1/admin/users/register", {
    method: "POST",
    body: {
      email: request.email.trim(),
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),
      phoneNumber: request.phone?.trim() || undefined,
      role: "TEACHER",
      teacherProfile: {
        dateOfBirth: request.dob,
        nic: request.nic.trim() || undefined,
        specializations: request.specializations.map((item) => item.trim()).filter(Boolean),
        hireDate: request.hireDate || undefined,
      },
      address: addressFromRequest(request),
    },
  });
  return mapTeacher(registrationResponse(response));
}

export async function registerAdministrator(
  request: RegisterAdministratorRequest,
): Promise<AdministratorProfile> {
  const response = await apiRequest<ApiResponse<BackendUser>>(
    "/api/v1/admin/users/admins/register",
    {
      method: "POST",
      body: {
        email: request.email.trim(),
        firstName: request.firstName.trim(),
        lastName: request.lastName.trim(),
        phoneNumber: request.phone?.trim() || undefined,
        adminProfile: {
          dateOfBirth: request.dob,
          nic: request.nic.trim() || undefined,
        },
        address: addressFromRequest(request),
      },
    },
  );
  return mapAdministrator(registrationResponse(response));
}

export async function resendUserInvitation(userId: string) {
  return apiRequest(`/api/v1/admin/users/${userId}/resend-invitation`, {
    method: "POST",
  });
}

export async function updateUserStatus(userId: string, active: boolean) {
  return apiRequest(`/api/v1/admin/users/${userId}/status`, {
    method: "PATCH",
    body: { active },
  });
}

export async function unlockUserAccount(userId: string) {
  return apiRequest(`/api/v1/admin/users/${userId}/unlock`, {
    method: "POST",
  });
}

export async function deleteUser(userId: string) {
  return apiRequest(`/api/v1/admin/users/${userId}`, {
    method: "DELETE",
  });
}
