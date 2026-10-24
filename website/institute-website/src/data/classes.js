// Central class directory for the TiT website.
// Replace the sample details with confirmed institute information.

export const classGrades = [
  ...Array.from({ length: 11 }, (_, index) => ({
    value: `grade-${index + 1}`,
    label: `Grade ${index + 1}`,
  })),
  {
    value: "advanced-level",
    label: "Advanced Level",
  },
];

export const classSubjects = ["English", "Mathematics", "Science", "History", "Tamil", "Sinhala"];

// On-site classes are listed first because they are the
// institute's primary teaching format.
export const classModes = [
  { value: "onsite", label: "On-site" },
  { value: "online", label: "Online" },
];

// Sample records demonstrate the information each class needs.
// These are placeholders, not confirmed class schedules.
export const classes = [
  {
    id: "grade-6-mathematics",
    grade: "grade-6",
    subject: "Mathematics",
    mode: "onsite",
    teacher: "Teacher to be confirmed",
    days: "Days to be confirmed",
    time: "Time to be confirmed",
    location: "Institute classroom",
    fee: "Contact for fees",
    availability: "To be confirmed",
    language: "English",
    description: "On-site Mathematics tuition for Grade 6 students.",
    enquiryLabel: "Enquire about this class",
  },
  {
    id: "grade-8-science",
    grade: "grade-8",
    subject: "Science",
    mode: "onsite",
    teacher: "Teacher to be confirmed",
    days: "Days to be confirmed",
    time: "Time to be confirmed",
    location: "Institute classroom",
    fee: "Contact for fees",
    availability: "To be confirmed",
    language: "English",
    description: "On-site Science tuition for Grade 8 students.",
    enquiryLabel: "Enquire about this class",
  },
  {
    id: "advanced-level-english-online",
    grade: "advanced-level",
    subject: "English",
    mode: "online",
    teacher: "Teacher to be confirmed",
    days: "Days to be confirmed",
    time: "Time to be confirmed",
    location: "Online — platform to be confirmed",
    fee: "Contact for fees",
    availability: "Occasional classes — schedule to be confirmed",
    language: "English",
    description: "Example online English class for Advanced Level students.",
    enquiryLabel: "Enquire about this class",
  },
];
