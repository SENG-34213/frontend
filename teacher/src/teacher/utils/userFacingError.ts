const UUID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.trim() : "";
}

export function formatTeacherError(
  error: unknown,
  fallback: string,
  context: { courseName?: string } = {},
) {
  const raw = errorMessage(error);
  if (!raw) return fallback;

  if (/communication group already exists for course/i.test(raw)) {
    const courseName = context.courseName?.trim() || "this course";
    return `A communication group already exists for “${courseName}”. The existing group can be used instead.`;
  }

  // Internal record identifiers are useful for logs, but not for portal users.
  return raw.replace(UUID_PATTERN, "the selected course");
}
