# Teacher portal integration — Part 1.2 student roster APIs

Branch: `integration/teacher-student-roster-and-details`

## Implemented

- Connected the teacher student directory to live course rosters.
- Connected student detail attendance cards to the attendance summary API.
- Connected the enrollment workspace to live student-course membership records.
- Added loading, empty, retry, and request-error states.
- Excluded student creation and update workflows as requested.
- Removed mock assignment records from the student detail modal so unavailable backend data is
  not presented as live data.

## Verified API contract used

```text
GET /api/v1/enrollments/courses/{courseId}/students
GET /api/v1/attendance/students/{studentId}/courses/{courseId}
```

Both requests use the authenticated teacher API client. The roster endpoint provides student IDs,
and the attendance endpoint provides attendance percentages and absence counts.

## Backend limitations

- The current verified roster response contains student IDs only. Names, email addresses, GPA,
  grades, activity, submissions, and profile records are not available to this frontend from the
  verified teacher APIs. The UI labels those values as unavailable or uses safe zero values.
- No verified teacher endpoint for pending enrollment applications, approval, or rejection was
  found in the current frontend contract. The enrollment page therefore displays enrolled
  memberships only and does not fabricate approval actions.
- A backend student profile endpoint and teacher enrollment-management endpoint are still required
  before those fields and workflows can be integrated.
