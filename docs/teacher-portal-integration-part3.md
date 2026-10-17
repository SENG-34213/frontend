# Teacher portal integration — Part 3 teacher shell data

Branch: `integration/teacher-shell-data`

## Implemented

- Connected the teacher shell to `GET /api/v1/users/me`.
- Connected the notification badge to `GET /api/v1/notifications/unread-count`.
- Added a shared `useTeacherShellData` hook.
- Added abortable requests so shell requests are cancelled on unmount.
- Added profile loading and workspace error states.
- Added a non-blocking notification-service warning state.
- Added retry behavior for failed shell loads.
- Prevented duplicate development-mode bootstrap requests caused by React Strict Mode.
- Replaced hardcoded navbar/sidebar teacher identity text with the loaded teacher profile.
- Reused the existing teacher UI and mock profile fields where the backend profile does not yet provide equivalent values.

## Verified API contract

```text
GET /api/v1/users/me
GET /api/v1/notifications/unread-count
```

Both requests use the centralized authenticated API client from Part 2. A `401` response can
refresh the session once before the request is retried.

## Fallback behavior

- A missing teacher profile blocks the workspace and shows retry/sign-out actions.
- A notification count failure does not block the workspace; the badge falls back to zero and an inline warning is shown.
- Profile fields not present in the current backend response continue using the existing UI-safe sample defaults until the profile API exposes them.
- Teacher page content remains mock-backed and is intentionally deferred to the page-specific integration phases.
- Dashboard cards, greeting copy, course totals and schedule still come from `mockData`; they are not expected to change until the dashboard/course/calendar integration phases.
