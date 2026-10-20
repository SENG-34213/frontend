# Mentify — Enterprise Admin Portal

> **Premium Enterprise Education Management Platform**  
> Complete Administrative Workspace & Unified Governance Interface

---

## 📌 Overview

**Mentify** is a modern, enterprise-grade educational management platform designed to orchestrate complex academic lifecycles across secondary and collegiate institutions.

While Mentify features dedicated Student and Teacher portals, this **Admin Portal** serves as the central administrative mission control. It provides centralized visibility and governance across user provisioning, course rosters, multi-tier curriculum planning, summative examinations, AWS S3 pedagogical media, and Keycloak-federated authentication.

Built with **React 19**, **TypeScript**, and **Tailwind CSS v4**, this workspace adheres strictly to modern SaaS UI/UX conventions, tabular typographic discipline, and role-based access control (RBAC).

---

## 🌟 Key Features & Functional Modules

### 1. Flagship Operations Dashboard

- **Dynamic Institutional KPIs**: Real-time metric cards for Total Students (1,420), Total Faculty (84), Active Courses (48), Enrollments (3,290), Pending Keycloak Invites (12), Active Users (1,485), and Upcoming Exams (9).
- **Registration Velocity Chart**: Interactive registration trend visualization with 7-day, 30-day, and 90-day time filters.
- **Pending Invitations Operational Center**: Direct action card to inspect and dispatch Keycloak invitation reminders.
- **Upcoming Academic Timetable**: Real-time schedule of lectures, quizzes, assignment deadlines, and exam hall sessions.
- **Administrative Audit Stream**: Immediate visibility into recent authorization events, S3 presigned URL issuances, and AI executions.

### 2. User Lifecycle & Registration Wizards

- **All Users Directory**: Global search, multi-role filtering (`STUDENT`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`), and account activation/suspension with an impact explanation dialog.
- **Student Administration**:
  - Complete student directory with guardian contacts, academic grades, and attendance modes.
  - **5-Step Registration Wizard**: Personal Info &rarr; Academic & Guardian &rarr; Residential Address &rarr; Review & Validation &rarr; Backend Auto-Generated Student ID (`STU-2026-xxxx`).
  - Student inspection drawer with dedicated tabs for Overview, Enrolled Courses, Grades, and Roll Call logs.
- **Teacher Administration**:
  - Faculty directory with specializations, hire dates, and assigned course loads.
  - **5-Step Registration Wizard**: Personal Info &rarr; Professional Credentials (NIC, Multiple Specializations) &rarr; Address &rarr; Review &rarr; Auto-Generated Teacher Code (`TCH-91xx`).
- **Administrator Governance (`SUPER_ADMIN` Only)**:
  - Strict role-gated directory for administrative credentials.
  - Multi-step registration flow to provision new platform administrators.

### 3. Academic Operations & Oversight

- **Course Management**: Course code tracking, category tagging, student capacity gauges, and a creation modal. Includes inspection tabs for Syllabus Curriculum, Student Rosters, S3 Assets, and Evaluation Statistics.
- **Enrollment Management**: Cross-department student rosters with approval triggers for pending enrollments.
- **Modules & Lessons Explorer**: Interactive curriculum tree showing lesson durations, attached quizzes, and syllabus publishing states.
- **Assignment Oversight**: Submission tracking and faculty grading velocity progress bars.
- **Quiz Management & Analytics**: Formative assessment statistics, median score distributions, and pass rate thresholds.
- **Examination Management**: Summative exam timetables, candidate hall allocations, and proctoring schedules.
- **Grades & Results Gradebook**: Comprehensive evaluation ledger with score breakdowns and qualitative evaluator feedback.
- **Attendance Management**: Roll-call compliance tracking across In-Person, Hybrid, and Synchronous Online formats.

### 4. Platform Services & Cloud Storage

- **Learning Materials (AWS S3)**:
  - Centralized management for course assets (PDFs, MP4 lecture recordings, PPTX slides, code archives).
  - Storage cluster telemetry (`s3://mentify-course-assets-prod`) with file size metadata and S3 URI inspection.
  - Simulated pre-signed URL upload flow with file validation.
- **Academic Calendar**: Month grid, week, day, and agenda views with event category filtering and event scheduling.
- **Communication & Announcements**: Campus-wide broadcast composer with targeted audience selection and confirmed read receipts.
- **Notification Center**: Filterable operational alert feed for Registration webhooks, Keycloak security events, and academic schedules.

### 5. Intelligence & Administrative Governance

- **Mentify AI Assistant**:
  - Interactive conversational assistant grounded in institutional data and microservice operations.
  - Pre-configured administrative inquiry prompt chips (registration velocity, quiz failure variance, exam venue conflicts).
  - Markdown message rendering, response copy utilities, and new session management.
- **Analytics Dashboard**: Departmental enrollment distribution bars, weekly attendance compliance curves, and demographic KPIs.
- **Certified Institutional Reports**: Report template preview and parameter customization with CSV/PDF export simulation.
- **System Audit & Activity**: Immutable event stream with full JSON payload drawer inspection.

### 6. Profile & Settings

- **Admin Profile**: Personal contact preferences, department indicators, and immutable Keycloak SSO attributes.
- **Platform Settings**: Appearance preferences, notification dispatch toggles, Keycloak SSO realm indicators (`mentify-prod-realm`), and active session management.

---

## 🔐 Role-Based Access Control (RBAC)

The application models the institutional authorization policies enforced by Keycloak and Spring Boot:

| Capability                                  |      ADMIN      | SUPER_ADMIN |
| :------------------------------------------ | :-------------: | :---------: |
| View Platform Dashboard & KPIs              |       ✅        |     ✅      |
| Register Students (5-Step Wizard)           |       ✅        |     ✅      |
| Register Teachers (5-Step Wizard)           |       ✅        |     ✅      |
| Update Account Status (Activate / Suspend)  |       ✅        |     ✅      |
| Resend Keycloak Invitations                 |       ✅        |     ✅      |
| Course & Enrollment Management              |       ✅        |     ✅      |
| S3 Learning Materials & Calendar            |       ✅        |     ✅      |
| Mentify AI Assistant & Reports              |       ✅        |     ✅      |
| **View Administrator Directory**            | ❌ (Role-gated) |     ✅      |
| **Register New Administrators**             | ❌ (Role-gated) |     ✅      |
| **Inspect System-Wide Keycloak Audit Logs** |    Read-Only    | Full Access |

> **Interactive Role Switcher**: A live role selector (`ADMIN` / `SUPER_ADMIN`) is available in the top navigation bar to test both permission perspectives instantly.

---

## 🎨 Design System & Theming

- **Color Distribution (60-30-10 Rule)**:
  - **60% Dominant Canvas**: Clean off-white (`#F8FAFC`) in Light mode; dark neutral slate (`#020617` / `#0F172A`) in Dark mode.
  - **30% Structural Surfaces**: White card surfaces (`#FFFFFF`) with subtle hairline dividers (`border-slate-200 dark:border-slate-800`).
  - **10% Accent Intent**: High-contrast indigo/violet actions (`#4F46E5`), emerald for active/success states, amber for pending/invited states, and rose for suspended/alert states.
- **Anti-AI Slop & Zero-Pill Discipline**: Metadata is presented with clean typography and subtle separators (`·`), avoiding decorative pill badges and artificial telemetry counters.
- **Tabular Figures**: All IDs, timestamps, and percentages use `tabular-nums` (`font-mono`) to prevent layout jitter.
- **Dual Theme Support**:
  - Default: **Light Mode** (fresh, enterprise-clean).
  - Switchable: **Dark Mode** via 1-click segmented toggle in the navigation bar or in Settings.

---

## 📁 Project Structure

All administrative modules reside in `src/admin/`:

```
src/
├── admin/
│   ├── academic/           # Modules & Lessons syllabus explorer
│   ├── ai-assistant/       # Mentify AI conversational assistant
│   ├── administrators/     # SUPER_ADMIN governance & admin registration
│   ├── analytics/          # Department charts and weekly attendance trends
│   ├── assignments/        # Assignment oversight and grading progress
│   ├── attendance/         # Classroom and online roll-call logs
│   ├── audit/              # Immutable audit trail & JSON inspector
│   ├── calendar/           # Operations calendar (Month/Week/Agenda)
│   ├── communication/      # Campus broadcast announcements
│   ├── components/         # Reusable design system components
│   │   ├── AdminNavbar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── ConfirmationDialog.tsx
│   │   ├── DetailDrawer.tsx
│   │   ├── PageHeader.tsx
│   │   ├── RoleBadge.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ToastContainer.tsx
│   │   └── UserAvatar.tsx
│   ├── courses/            # Course directory, create modal, detail tabs
│   ├── dashboard/          # Flagship overview, KPIs, charts, quick actions
│   ├── enrollments/        # Student enrollment status & approvals
│   ├── examinations/       # Summative exam timetables and hall allocation
│   ├── grades/             # Academic gradebook and letter mark records
│   ├── layouts/            # Master AdminLayout, mobile drawer, ⌘K search
│   ├── materials/          # AWS S3-backed learning asset management
│   ├── notifications/      # Notification center & category filters
│   ├── profile/            # Admin user profile & contact preferences
│   ├── quizzes/            # Quiz directory and score distributions
│   ├── registrations/      # Keycloak invitation operations center
│   ├── reports/            # Certified report generation & CSV export
│   ├── settings/           # Appearance, Keycloak SSO, and session settings
│   ├── students/           # Student directory & 5-step registration wizard
│   ├── teachers/           # Teacher directory & 5-step registration wizard
│   ├── users/              # Unified directory across all institutional users
│   ├── mockData.ts         # Seed data grounded in Spring Boot microservices
│   └── types.ts            # Domain TypeScript models
├── App.tsx                 # Core state coordinator & view router
├── index.css               # Tailwind CSS v4 setup & custom dark variant
└── main.tsx                # React 19 entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**

### Installation

1. Clone or open the project repository:

   ```bash
   cd mentify-admin-portal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The portal will be accessible at `http://localhost:3000`.

### Scripts

- `npm run dev`: Launch Vite development server on port 3000.
- `npm run build`: Compile and bundle TypeScript and Tailwind for production.
- `npm run lint`: Run TypeScript compiler (`tsc --noEmit`) to validate type integrity.
- `npm run preview`: Preview the compiled production build locally.

---

## 🛠️ Technology Stack

- **UI Framework**: React 19 (`react`, `react-dom`)
- **Language**: TypeScript (`^7.0.2` / ES2022)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons**: Lucide React (`lucide-react`)
- **Build Tool**: Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Animations**: Motion (`motion`)
- **Backend Architecture Compatibility**: Spring Boot Microservices, PostgreSQL, Keycloak SSO, AWS S3.

---

## 📄 License

This project is licensed under the Apache 2.0 License.
