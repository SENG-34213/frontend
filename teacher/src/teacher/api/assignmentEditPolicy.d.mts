export type AssignmentEditPolicy = {
  canEditMetadata: boolean;
  canEditSubmissionSettings: boolean;
  canManageAttachments: boolean;
};

export function getAssignmentEditPolicy(
  status: "DRAFT" | "PUBLISHED" | "CLOSED",
  totalSubmissions: number,
): AssignmentEditPolicy;
