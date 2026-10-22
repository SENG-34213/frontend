export function getAssignmentEditPolicy(status, totalSubmissions) {
  if (status === "DRAFT") {
    return {
      canEditMetadata: true,
      canEditSubmissionSettings: true,
      canManageAttachments: true,
    };
  }

  if (status === "PUBLISHED" && totalSubmissions <= 0) {
    return {
      canEditMetadata: true,
      canEditSubmissionSettings: true,
      canManageAttachments: true,
    };
  }

  if (status === "PUBLISHED") {
    return {
      canEditMetadata: true,
      canEditSubmissionSettings: false,
      canManageAttachments: false,
    };
  }

  return {
    canEditMetadata: false,
    canEditSubmissionSettings: false,
    canManageAttachments: false,
  };
}
