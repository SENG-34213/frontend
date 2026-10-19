# Teacher portal integration — Part 2 authentication foundation

Branch: `integration/teacher-auth-foundation`

## Implemented

- Added typed teacher authentication models.
- Added session persistence through browser session storage.
- Added a centralized `apiRequest` helper for future teacher API modules.
- Added normalized `ApiError` responses with HTTP status and backend details.
- Added automatic access-token refresh after a `401` response.
- Added session restoration on page reload.
- Added teacher-role enforcement on login and `/api/v1/users/me`.
- Added logout from the teacher navbar and sidebar.
- Added support for JSON requests and future multipart `FormData` requests.

## Verified backend contract used

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/users/me
```

Login sends `{ identifier, password }`. The access token and refresh token are stored as a
single teacher session. The refresh token is never sent to protected API requests; it is sent
only to the backend refresh and logout endpoints.

## Session behavior

1. The app restores a non-expired teacher session on reload.
2. A session close to expiry is refreshed before the teacher workspace is shown.
3. A protected request receiving `401` attempts one refresh and retries once.
4. If refresh fails, the session is cleared and the request returns an `ApiError`.
5. Login and current-user checks require the `TEACHER` role.
6. Logout invalidates the refresh token through the backend when available and always clears local state.

The teacher pages still use their existing mock data. This part only establishes authentication,
session handling, and the API foundation for the next page integrations.
