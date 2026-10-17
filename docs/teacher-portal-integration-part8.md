# Teacher portal integration — Part 8 quizzes and assessments

Branch: `feature/teacher-quiz-assessments-integration`

## Implemented

- Added a typed quiz API client for the verified teacher quiz endpoint.
- Added an abortable quiz hook with retry and React Strict Mode request protection.
- Connected the existing Quizzes & Questions workspace to live teacher quiz data.
- Mapped backend quiz status, course association, marks, duration, and teacher question options
  into the existing Tailwind UI model.
- Added loading, empty, error, and retry states without changing the existing page layout.
- Replaced fabricated quiz totals and completion metrics with safe placeholders where the current
  teacher API does not provide attempt analytics.

## Verified backend contract

```text
GET /api/quizzes/teacher
Authorization: Bearer <access-token>
Role: TEACHER, ADMIN, or SUPER_ADMIN
```

The backend returns `ApiResponse<List<QuizResponse>>`. Teacher quiz responses include the course
ID, title, description, duration, marks, status, and teacher question options.

## Intentionally deferred

- Quiz creation and editing UI submission.
- Publishing and deleting quizzes.
- Creating, updating, and deleting questions through the question endpoints.
- Attempt, submission, and score analytics because the teacher list API does not expose those
  aggregates.

Parts 5–7 remain unchanged.
