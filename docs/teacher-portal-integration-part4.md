# Teacher portal integration — Part 4 course list

Branch: `integration/teacher-courses`

## Implemented

- Added a typed course API client for the verified teacher endpoint.
- Added an abortable `useTeacherCourses` hook with retry behavior and React Strict Mode request protection.
- Connected the existing Courses page to the authenticated teacher's course list.
- Mapped backend course status, title, description, subject, and enrollment totals into the existing UI model.
- Added loading, empty, and request-error states without changing the existing Tailwind layout.
- Kept unsupported UI metrics such as module counts and average grades at safe zero values until their APIs are integrated.

## Verified backend contract

```text
GET /api/v1/course/my-courses
Authorization: Bearer <access-token>
Role: TEACHER
```

The backend returns `ApiResponse<List<CourseResponse>>`, including `id`, `courseName`,
`courseDescription`, `subject`, `courseStatus`, and `numberOfStudents`.

## Intentionally deferred

- Course creation and update UI wiring: the backend now permits teachers to use
  `POST /api/v1/course` and `PUT /api/v1/course/{courseId}`, with ownership enforcement;
  the frontend forms still need to be connected in a later phase.
- Course detail UI wiring: the backend now permits teachers to use
  `GET /api/v1/course/{courseId}` and restricts the response to the owning teacher;
  the frontend detail page still needs to be connected.
- Modules, lessons, materials, assignments, and grade metrics remain mock-backed until their
  page-specific phases.
