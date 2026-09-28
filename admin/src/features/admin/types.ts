export type Notice = { kind: "success" | "error"; title: string; body: string };

export type AdminSection = "student" | "teacher" | "course" | "enrollment";
export type RecentTeacher = { id: string; name: string; email: string };
export type RecentStudent = { id: string; name: string; email: string; grade?: string; phoneNumber?: string; attendanceMode?: string; studentCode?: string };
export type RecentCourse = { id: string; name: string; subject?: string };
export type LiveCourse = {
  id: string;
  courseName: string;
  courseDescription?: string;
  courseThumbnail?: string;
  courseFeeMonthly?: number;
  assignedTeacherId?: string;
  gradeId?: string;
  subject?: string;
  online?: boolean;
  discountOfferPercent?: number;
  visible?: boolean;
  isPublished?: boolean;
  courseStatus?: string;
  numberOfStudents?: number;
  createdAt?: string;
  updatedAt?: string;
};
export type SampleCourse = { id: string; grade: string; name: string; subject: string; teacher: string; schedule: string; fee: number; description: string };
export type SampleEnrollment = { studentId: string; courseIds: string[]; enrolledOn: string; updatedOn: string };

export type CourseDraft = {
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

export type RegistrationValues = {
  firstName: string; lastName: string; email: string; phoneNumber: string; dateOfBirth: string;
  guardianName: string; guardianPhone: string; grade: string; attendanceMode: string;
  nic: string; hireDate: string; addressLine1: string; addressLine2: string; city: string; district: string; postalCode: string;
};

export type AdminUser = { firstName?: string; lastName?: string; email?: string; role?: string };
export type CreatedCourse = { id: string; name: string; status: string };
export type DirectoryUser = { id: string; name: string; email: string; phoneNumber?: string; grade?: string; code?: string; accountStatus?: string; specializations?: string[] };
