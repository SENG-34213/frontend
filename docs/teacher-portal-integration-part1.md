# Teacher portal integration — Part 1 contract

Status: frontend contract preparation on `feat/teacher-portal-integration-part1`.

This document records the verified local contract from the Mentify backend `development`
branch. No proposed teacher dashboard, student-directory, analytics, or gradebook APIs are
being assumed as existing.

## Local runtime contract

The frontend must call the API gateway rather than individual services:

| Component               | Local URL / port        | Source                                                                 |
| ----------------------- | ----------------------- | ---------------------------------------------------------------------- |
| API gateway             | `http://localhost:8080` | `cloud/config-server/src/main/resources/configuration/api-gateway.yml` |
| User service            | `http://localhost:8081` | `user-service.yml`                                                     |
| Course service          | `http://localhost:8082` | `course-service.yml`                                                   |
| Enrollment service      | `http://localhost:8083` | `entrollment-service.yml`                                              |
| Assignment/quiz service | `http://localhost:8084` | `assignment-service.yml`                                               |
| Communication service   | `http://localhost:8086` | `communication-service.yml`                                            |
| Attendance service      | `http://localhost:8087` | `attendance-service.yml`                                               |
| AI service              | `http://localhost:8088` | `ai-service.yml`                                                       |
| Exam service            | `http://localhost:8089` | `exam-service.yml`                                                     |
| Payment service         | `http://localhost:8090` | `payment-service.yml`                                                  |
| Material service        | `http://localhost:8091` | `material-service.yml`                                                 |
| Calendar service        | `http://localhost:8092` | `calender-service.yml`                                                 |
| Notification service    | `http://localhost:8093` | `notification-service.yml`                                             |
| Keycloak                | `http://localhost:8180` | `docker-compose.yml`                                                   |

The gateway routes service paths through Eureka. Direct service URLs are for backend
diagnostics only and are not frontend configuration values.

## CORS

The gateway defaults to:

- Origins: `http://localhost:*`, `http://127.0.0.1:*`
- Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Headers: `Authorization, Content-Type, Accept, Origin, X-Requested-With`
- Credentials: enabled
- Preflight cache: 3600 seconds

Production must set `GATEWAY_CORS_ALLOWED_ORIGIN_PATTERNS` to explicit trusted frontend
origins. The frontend does not add a wildcard CORS workaround.

## Keycloak and authentication

Verified defaults:

- Realm: `mentify`
- Server: `http://localhost:8180`
- JWT issuer: `http://localhost:8180/realms/mentify`
- Gateway: `http://localhost:8080`
- Backend auth client: `mentify-backend-client` by default

The frontend uses the backend login bridge:

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "identifier": "teacher1@mentify.test",
  "password": "Sample@12345"
}
```

The successful response is an `ApiResponse<LoginResponse>` whose `data` contains the access
token, refresh token, expiry values and resolved user role. The frontend stores the tokens in
session storage for this first integration step. Token refresh and a full authenticated API
layer belong to the next step.

The authenticated current-user endpoint is verified:

```http
GET /api/v1/users/me
Authorization: Bearer <access-token>
```

The response is `ApiResponse<UserRegistrationResponse>`.

## Sample teacher account

The backend development branch documents sample-user bootstrap:

```text
teacher1@mentify.test / Sample@12345
```

The backend must be started with:

```text
MENTIFY_SAMPLE_USERS_ENABLED=true
MENTIFY_SAMPLE_USERS_PASSWORD=Sample@12345
```

The user-service startup log must contain `Sample login users bootstrap completed` before
frontend login is tested.

## Response and error contract

Successful service responses use:

```json
{
  "statusCode": 200,
  "message": "...",
  "data": {}
}
```

Common shared-service errors use the same response shape with an HTTP status and `message`.
The user-service authentication/registration handler uses:

```json
{
  "timestamp": "2026-10-17T00:00:00",
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "path": "/api/v1/auth/login"
}
```

Validation may additionally include `fieldErrors`. The frontend must use HTTP status first,
then `message`, and must not display internal Keycloak details or tokens.

Important authentication statuses:

- `401`: invalid or expired credentials/token
- `403`: authenticated but not permitted for the teacher role/resource
- `428`: invitation setup/password/email action must be completed
- `400`: malformed or invalid request
- `409`: duplicate or invalid state conflict
- `500`/`502`/`503`: backend or identity provider failure

## Verified API decisions

Confirmed and usable for later teacher integration:

- Login, refresh, logout and forgot-password
- Current-user lookup
- Teacher course list
- Course modules, lessons and linked learning materials
- Assignments, submissions and grading
- Quizzes and question management
- Attendance sessions and summaries
- Exams and result entry
- Material upload and management
- Calendar events and queries
- Notifications
- Communication groups/messages/settings
- AI conversations and chat

Not treated as existing teacher capabilities:

- Teacher dashboard aggregate API
- Teacher student directory/profile API
- Teacher enrollment mutation API
- Teacher gradebook API
- Full teacher analytics API

These are backend follow-up items and must not be invented in the frontend.

## Frontend environment

Copy `teacher/.env.example` to `teacher/.env.local` for local development. Only public URLs
and non-secret identifiers belong in the frontend environment. Backend client secrets must
remain server-side.

## Manual Part 1 verification

1. Start Keycloak, databases, gateway, config server and user-service.
2. Enable the documented sample teacher bootstrap values.
3. Start the frontend with `npm run dev` from `teacher`.
4. Open the teacher portal.
5. Submit `teacher1@mentify.test` / `Sample@12345`.
6. Confirm the browser receives a successful login response and stores session tokens.
7. Confirm a non-teacher sample account is rejected by the teacher UI.
8. Confirm an invalid password displays the backend error message without exposing Keycloak details.

The remaining teacher pages still use mock data until the next approved integration phase.
