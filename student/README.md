# Mentify · Student Portal

A comprehensive, next-generation student learning portal frontend for the Mentify Learning Management System. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Lucide Icons, following the exact UI/UX design language and components from `student-portal`.

---

## Key Features & Architecture

### 1. Complete UI/UX Experience (from `student-portal`)

- **Dashboard**: Metric cards (GPA, enrolled courses, upcoming deadlines, attendance), continue learning quick actions, and recent announcements.
- **My Courses & Course Discovery**: Enrolled course catalog, explore catalog, detailed syllabus views, and full **Course Workspace** (interactive lesson reader, video player, completion tracker, code snippet display, downloadable attachments).
- **Assessments (Assignments, Quizzes & Exams)**:
  - **Assignments**: Filtering by Pending, Submitted, Graded, Overdue. Rich submission modal with draft saving and file attachment simulator.
  - **Quizzes**: Live timed quiz taker, multi-question stepper, question navigation matrix, instant scoring, and celebratory confetti result modal.
  - **Examinations**: Proctored exam schedules, exam guidelines, comprehensive weightage breakdown, and live exam taking view.
  - **Grades & Results**: Academic standing, cumulative GPA calculator, credits progress, and historical transcript table.
- **Collaboration & Tools**:
  - **My Calendar**: Color-coded class, exam, quiz, and assignment timeline with monthly/weekly/daily perspectives.
  - **Communication & Messages**: Real-time course group chat with instructor messaging simulation.
  - **Mentify AI Assistant**: Specialized educational AI tutor with formula rendering, code generation, and practice prompt suggestions.
  - **Notifications**: Interactive alerts center with quick navigation to deadlines, grades, and announcements.
  - **Command Palette (`Cmd+K` / `Ctrl+K`)**: Rapid keyboard search across courses, assignments, quizzes, and materials.
  - **Theme**: Seamless persistent Light/Dark mode.

---

### 2. Microservices Backend Integration (`services`)

Connected directly to the Mentify backend microservices through the Spring Cloud API Gateway:

| Backend Service           | Port / Path                                                           | Integrated Features                                                    |
| ------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **User Service**          | `/api/v1/users/me`, `/api/v1/auth/*`                                  | Student profile, Keycloak JWT authentication, session logout           |
| **Course Service**        | `/api/v1/course/*`                                                    | Course catalog lookup, modules, lessons, course syllabus               |
| **Enrollment Service**    | `/api/v1/enrollments/*`                                               | Student course enrollments (`/me`), enrollment checks                  |
| **Assignment Service**    | `/api/v1/assignments/*`, `/api/v1/submissions/*`                      | Course assignments, submission drafts, submission finalization         |
| **Quiz Service**          | `/api/courses/{id}/quizzes`, `/api/quizzes/*`, `/api/quiz-attempts/*` | Student quiz view, attempt creation, answer updates, score calculation |
| **Exam Service**          | `/api/v1/exams/me`                                                    | Official student exam results, grades, and remarks                     |
| **Material Service**      | `/api/v1/materials`                                                   | Learning material library, type/purpose filtering, download URLs       |
| **Calendar Service**      | `/api/v1/calendar/*`                                                  | Upcoming schedule queries, date-range event synchronization            |
| **Communication Service** | `/api/communication/*`                                                | Course study groups, message history, chat message sending             |
| **Attendance Service**    | `/api/v1/attendance/*`                                                | Course attendance summaries (present, late, absent counts, %)          |
| **Notification Service**  | `/api/v1/notifications/*`                                             | Live notification feed, unread count badge, mark as read               |
| **Payment Service**       | `/api/v1/payments/*`                                                  | Student fee receipts, course payment initiation (`/course`)            |
| **AI Service**            | `/api/ai/*`                                                           | Direct LLM / AI conversational tutor endpoints                         |

---

## Dual Mode Operation

The portal operates in two flexible modes:

1. **Live Backend Mode**: When signed in via the Top Navbar (`Sign in to Backend Gateway`), requests are routed through `studentApi.ts` to the backend gateway (default `http://localhost:8080` or configurable via the Sign-In modal).
2. **Demo Mode (Default)**: Automatically populates rich, realistic sample data so that every view, modal, quiz taker, and lesson workspace is fully interactive and functional even before backend services are launched.

---

## Getting Started

### 1. Install Dependencies

```bash
cd student
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```
