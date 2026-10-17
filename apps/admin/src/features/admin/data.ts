import type { CourseDraft, RegistrationValues, SampleCourse } from "./types";

export const emptyCourse: CourseDraft = {
  courseName: "",
  courseDescription: "",
  courseThumbnail: "",
  courseFeeMonthly: "",
  gradeId: "",
  assignedTeacherId: "",
  subject: "",
  isOnline: true,
  discountOfferPercent: "0",
  isVisible: true,
  isPublished: false,
  courseEnrollmentId: "",
};

export const initialRegistrationValues: RegistrationValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  guardianName: "",
  guardianPhone: "",
  grade: "",
  attendanceMode: "PHYSICAL",
  nic: "",
  hireDate: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  postalCode: "",
};

const subjects = ["Mathematics", "Science", "English", "ICT"];
export const sampleCourses: SampleCourse[] = Array.from({ length: 13 }, (_, index) => {
  const grade = String(index + 1);
  return subjects.map((subject, subjectIndex) => ({
    id: `sample-grade-${grade}-${subject.toLowerCase()}`,
    grade,
    name: `Grade ${grade} ${subject}`,
    subject,
    teacher: ["Nimali Perera", "Kasun Silva", "Amaya Fernando", "Ruwan Jayasinghe"][subjectIndex],
    schedule: ["Mon · 4:00 PM", "Tue · 3:30 PM", "Wed · 4:30 PM", "Sat · 9:00 AM"][subjectIndex],
    fee: [3500, 4000, 3000, 3200][subjectIndex] + index * 150,
    description: [
      `Build core concepts and problem-solving confidence for Grade ${grade}.`,
      "Explore key science topics through examples and guided practice.",
      "Develop reading, writing, and communication skills.",
      "Learn digital literacy, computing, and practical technology skills.",
    ][subjectIndex],
  }));
}).flat();
