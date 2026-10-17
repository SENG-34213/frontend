# Teacher attendance session integration

Branch: `integration/teacher-attendance-sessions`

This integration is based on the backend `development` branch contract.

## Connected endpoints

```text
POST /api/v1/attendance/sessions
GET  /api/v1/attendance/courses/{courseId}/sessions
GET  /api/v1/attendance/sessions/{sessionId}
PUT  /api/v1/attendance/sessions/{sessionId}/records
POST /api/v1/attendance/sessions/{sessionId}/complete
POST /api/v1/attendance/sessions/{sessionId}/cancel
```

All requests use the authenticated API client and the backend `ApiResponse` envelope. The UI uses
the backend request fields `courseId`, `title`, `attendanceDate`, `startTime`, `endTime`, and
`records[{ studentId, status, remarks }]`.

## UI coverage

- Create an open attendance session.
- Load sessions for all assigned teacher courses.
- Load the selected session detail before editing.
- Edit `NOT_MARKED`, `PRESENT`, `ABSENT`, and `LATE` records.
- Save the complete record set.
- Mark all students present.
- Complete or cancel an open session.
- Make completed and cancelled sessions read-only.
- Show loading, empty, retry, validation, success, and server-error states.

The backend response currently contains student IDs rather than student names, so the roster labels
students using their IDs until a teacher-authorized student profile endpoint is available.
