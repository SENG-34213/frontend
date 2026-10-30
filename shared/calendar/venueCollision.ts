type CalendarBooking = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  startDateTime?: string;
  endDateTime?: string | null;
  allDay?: boolean;
};

type ProposedBooking = {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  excludeEventId?: string | null;
};

const NON_EXCLUSIVE_LOCATIONS = new Set([
  "tuition wide",
  "tit lms submission portal",
  "not specified",
  "online",
  "virtual",
]);

function normalizeLocation(location: string) {
  return location.trim().normalize("NFKC").toLowerCase();
}

function localDateTimeMinutes(value: string): number | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;
  const [, year, month, day, hour = "0", minute = "0"] = match;
  return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

function dateAndTimeMinutes(date: string, time: string): number | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return localDateTimeMinutes(`${date}T00:00`);
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return localDateTimeMinutes(`${date}T${String(hour).padStart(2, "0")}:${match[2]}`);
}

function eventRange(event: CalendarBooking): [number, number] | null {
  const start = event.allDay
    ? localDateTimeMinutes(`${event.date}T00:00`)
    : event.startDateTime
      ? localDateTimeMinutes(event.startDateTime)
      : dateAndTimeMinutes(event.date, event.time.split(/\s+-\s+/)[0]);
  if (start === null) return null;

  if (event.allDay) {
    const endDate = event.endDateTime ? event.endDateTime.slice(0, 10) : event.date;
    let end = localDateTimeMinutes(`${endDate}T00:00`);
    if (
      end === null ||
      end <= start ||
      (event.endDateTime && !event.endDateTime.endsWith("T00:00:00"))
    ) {
      end = (end ?? start) + 24 * 60 * 60 * 1000;
    }
    return [start, end];
  }

  let end = event.endDateTime ? localDateTimeMinutes(event.endDateTime) : null;
  if (end === null) {
    const labels = event.time.split(/\s+-\s+/);
    end = labels.length > 1 ? dateAndTimeMinutes(event.date, labels[1]) : null;
    if (end !== null && end <= start) end += 24 * 60 * 60 * 1000;
  }
  return end === null ? null : [start, end];
}

export function calendarEventsOverlap(left: CalendarBooking, right: CalendarBooking) {
  const leftRange = eventRange(left);
  const rightRange = eventRange(right);
  return (
    leftRange !== null &&
    rightRange !== null &&
    leftRange[0] < rightRange[1] &&
    rightRange[0] < leftRange[1]
  );
}

export function venueBookingsOverlap(left: CalendarBooking, right: CalendarBooking) {
  const leftVenue = normalizeLocation(left.location || "");
  if (!leftVenue || NON_EXCLUSIVE_LOCATIONS.has(leftVenue)) return false;
  return (
    left.status !== "CANCELLED" &&
    right.status !== "CANCELLED" &&
    leftVenue === normalizeLocation(right.location || "") &&
    calendarEventsOverlap(left, right)
  );
}

export function findVenueCollision<T extends CalendarBooking>(
  events: T[],
  proposed: ProposedBooking,
): T | undefined {
  const venue = normalizeLocation(proposed.location);
  if (!venue || NON_EXCLUSIVE_LOCATIONS.has(venue)) return undefined;

  const start = dateAndTimeMinutes(proposed.date, proposed.startTime);
  let end = dateAndTimeMinutes(proposed.date, proposed.endTime);
  if (start === null || end === null) return undefined;
  if (end <= start) end += 24 * 60 * 60 * 1000;

  return events.find((event) => {
    if (event.id === proposed.excludeEventId || event.status === "CANCELLED") return false;
    if (normalizeLocation(event.location || "") !== venue) return false;
    const range = eventRange(event);
    return range !== null && start < range[1] && range[0] < end;
  });
}
