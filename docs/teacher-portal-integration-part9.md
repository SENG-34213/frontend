# Teacher portal integration — Part 9 exams and gradebook

Branch: `feature/teacher-exams-gradebook-integration`

## Implemented

- Connected teacher exam listing through the verified per-course exam API.
- Added exam creation with client-side time and marks validation.
- Added exam editing while the backend permits updates (`DRAFT` and `SCHEDULED`).
- Connected backend exam state transitions: schedule, start marking, complete, and cancel.
- Connected result sheet and exam summary loading.
- Added marks entry while an exam is in `MARKING` state.
- Sends only the backend-supported marks DTO fields and rejects invalid present/absent entries before submission.
- Made result sheets read-only for non-`MARKING` states, including completed exams.
- Replaced the previous mock gradebook with an explicit unavailable state until a teacher-authorized backend gradebook contract exists.
- Added loading, empty, error, retry, and action-error states.

## Verified backend contract

```text
GET  /api/v1/exams/courses/{courseId}
POST /api/v1/exams
PUT  /api/v1/exams/{examId}
POST /api/v1/exams/{examId}/schedule
POST /api/v1/exams/{examId}/start-marking
POST /api/v1/exams/{examId}/complete
POST /api/v1/exams/{examId}/cancel
GET  /api/v1/exams/{examId}/results
GET  /api/v1/exams/{examId}/summary
PUT  /api/v1/exams/{examId}/results
```

The backend enforces teacher course ownership, valid state transitions, marks between zero and
the exam total, absent-student rules, duplicate-student protection, and completed-exam locking.

## Backend limitations

- There is no teacher gradebook aggregation endpoint. The existing gradebook requires combined
  assignment, quiz, exam, student identity, and authorization data, so it remains explicitly
  unavailable instead of displaying fabricated grades.
- The exam service currently resolves the user identity from the JWT subject before checking the
  `local_user_id` claim. If the Keycloak subject is not the local teacher UUID, backend exam
  authorization must be updated to prefer `local_user_id`, as the course service now does.
- The frontend result sheet receives student IDs but not student names. A student-directory lookup
  is required for named result rows.

Parts 5–8 remain unchanged.
