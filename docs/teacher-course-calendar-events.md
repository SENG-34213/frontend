# Teacher course calendar events integration

Branch: `integration/teacher-course-calendar-events`

## Connected read APIs

```text
GET /api/v1/calendar/events?start={start}&end={end}
GET /api/v1/calendar/events?start={start}&end={end}&courseId={courseId}
GET /api/v1/calendar/upcoming?limit={limit}
```

## UI coverage

- Loads the current month from the calendar events query API.
- Supports previous month, next month, and today navigation.
- Supports course filtering through the backend `courseId` query parameter.
- Displays event type, title, time, location, description, and status details.
- Loads upcoming course events in the calendar sidebar.
- Adds a live course schedule section to each course detail overview.
- Includes loading, empty, retry, and server-error states.

Calendar create, update, and cancellation APIs remain deferred as requested until teacher write
permissions are confirmed.
