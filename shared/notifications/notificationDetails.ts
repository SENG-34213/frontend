export type NotificationDetails = {
  summary: string;
  details: string[];
};

/** Split the structured detail suffix emitted by the notification service. */
export function splitNotificationDetails(message?: string | null): NotificationDetails {
  const text = String(message || "").trim();
  const marker = text.indexOf(" Details:");
  if (marker < 0) return { summary: text, details: [] };

  const summary = text.slice(0, marker).trim();
  const detailsText = text
    .slice(marker + " Details:".length)
    .trim()
    .replace(/[.]$/, "");
  const details = detailsText
    .split(/;\s*/)
    .map((detail) => detail.trim())
    .filter(Boolean);

  return { summary: summary || text, details };
}

export function notificationKind(type?: string | null): string {
  const value = String(type || "SYSTEM").toUpperCase();
  if (value.includes("CALENDAR") || value.includes("EVENT")) return "Calendar";
  if (value.includes("ASSIGNMENT") || value.includes("SUBMISSION")) return "Assignment";
  if (value.includes("QUIZ")) return "Quiz";
  if (value.includes("EXAM")) return "Exam";
  if (value.includes("ATTENDANCE")) return "Attendance";
  if (value.includes("MATERIAL")) return "Learning material";
  if (value.includes("MESSAGE") || value.includes("COMMUNICATION")) return "Message";
  if (value.includes("ENROLL")) return "Enrollment";
  if (value.includes("PAYMENT")) return "Payment";
  if (value.includes("SECURITY") || value.includes("AUTH")) return "Security";
  return "Platform update";
}

export function notificationTypeLabel(type?: string | null): string {
  return String(type || "SYSTEM")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
