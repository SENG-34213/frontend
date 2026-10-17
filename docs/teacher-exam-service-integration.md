# Teacher exam service integration

Branch: `integration/teacher-exam-management`

The teacher exam workspace is connected to the backend `development` contract.

## Connected endpoints

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

## UI coverage

- Loads exams for every assigned teacher course.
- Creates and edits draft exams using backend validation rules.
- Supports the backend state flow: `DRAFT` → `SCHEDULED` → `MARKING` → `COMPLETED`.
- Supports cancellation where the exam is not completed or already cancelled.
- Loads result sheets and summaries for the selected exam.
- Allows marks and remarks entry only while the exam is in `MARKING`.
- Validates marks between zero and the exam total before submission.
- Sends only backend-supported marks fields: student ID, attendance status, marks, and remarks.
- Makes completed and cancelled exams read-only.
- Includes loading, empty, retry, validation, success, and server-error states.

The backend result DTO currently returns student IDs rather than student names, so the UI displays
ID-based labels until a teacher-authorized student profile API is available.
