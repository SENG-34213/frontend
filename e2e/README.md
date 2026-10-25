# Frontend browser tests

The Playwright suite starts the student, teacher, and admin Next.js portals on ports 3000, 3001,
and 3002. It intercepts requests to the API origin and serves deterministic fixtures, so the browser
tests do not require a running backend, real accounts, or persistent test data.

## Run locally

From the repository root:

```sh
npm ci
npm ci --prefix student
npm ci --prefix teacher
npm ci --prefix admin
npx playwright install chromium
npm run test:e2e
```

Use `npm run test:e2e:headed` to watch the browsers, or `npm run test:e2e:report` to inspect the
HTML report after a run. Traces, screenshots, and video are retained for failed tests under
`test-results/`.

## Coverage

- `student.spec.ts`: authentication pending/error states, course browsing, assignment submission,
  quiz attempt/answer/results, communication message sending, and role-specific portal navigation.
- `teacher.spec.ts`: course and assignment views, AI chat, teacher-profile loading recovery, and
  rejection of a student account by the teacher portal.
- `admin.spec.ts`: admin authentication, administrative navigation, and credential error state.

The API fixtures and captured request list live in `support.ts`. Keep the fixture response envelopes
aligned with the frontend API adapters when those contracts change.
