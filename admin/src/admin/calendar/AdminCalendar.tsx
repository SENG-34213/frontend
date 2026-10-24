/**
 * TiT Academic Operations Calendar Service
 * Production-ready enterprise scheduling console with multi-criteria filtering,
 * collision sentinel, mobile filter drawer, comprehensive form validation, and event lifecycle management.
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Filter,
  X,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Layers,
  Building2,
  Trash2,
  User,
  Mail,
  Eye,
  Shield,
  Edit2,
  RotateCcw,
  SlidersHorizontal,
  Info,
  CalendarRange,
  Ban,
  Check,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { AcademicEvent, Course, EventVisibility } from "../types";
import type {
  CalendarEventFilters,
  CalendarEventRequest,
  CalendarEventType,
} from "../api/calendarApi";

interface AdminCalendarProps {
  events: AcademicEvent[];
  courses: Course[];
  onAddEvent: (event: CalendarEventRequest) => Promise<void>;
  onUpdateEvent: (eventId: string, event: CalendarEventRequest) => Promise<void>;
  onCancelEvent: (eventId: string) => Promise<void>;
  onFilterEvents: (filters: CalendarEventFilters, start: Date, end: Date) => Promise<void>;
}

type CalendarViewMode = "month" | "week" | "day" | "agenda";

interface VenueStatus {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: string;
}

const CAMPUS_VENUES: VenueStatus[] = [
  {
    id: "v-01",
    name: "Science Hall Auditorium B",
    building: "Science Complex",
    capacity: 120,
    type: "Exam Certified",
  },
  {
    id: "v-02",
    name: "Turing Computing Lab 304",
    building: "Engineering Wing",
    capacity: 80,
    type: "Computer Lab",
  },
  {
    id: "v-03",
    name: "BioTech Seminar Hall 101",
    building: "Life Sciences Center",
    capacity: 60,
    type: "Tiered Hall",
  },
  {
    id: "v-04",
    name: "Newton Lecture Theater 201",
    building: "Core Campus",
    capacity: 150,
    type: "Lecture Theater",
  },
  {
    id: "v-05",
    name: "Council Boardroom 401",
    building: "Administration Block",
    capacity: 25,
    type: "Executive Boardroom",
  },
  {
    id: "v-06",
    name: "Faculty Wing Room 310",
    building: "Faculty Wing",
    capacity: 15,
    type: "Advising Room",
  },
  {
    id: "v-07",
    name: "TiT LMS Submission Portal",
    building: "Cloud Platform",
    capacity: 2000,
    type: "Virtual Platform",
  },
];

const KNOWN_COURSES = [
  { code: "MATH-401", title: "Advanced Calculus & Real Analysis", dept: "Mathematics" },
  { code: "CS-302", title: "Data Structures & Algorithms", dept: "Computer Science" },
  { code: "PHYS-402", title: "Quantum Mechanics & Field Foundations", dept: "Physics" },
  { code: "BIO-204", title: "Molecular Genetics & Cellular Biology", dept: "Biology" },
  { code: "CHEM-201", title: "Organic Chemistry & Reaction Mechanisms", dept: "Chemistry" },
  { code: "CS-450", title: "Artificial Intelligence & Ethics", dept: "Computer Science" },
  { code: "SENATE", title: "Institutional Governance Council", dept: "Administration" },
  { code: "REGISTRAR", title: "Academic Registrar & Records", dept: "Administration" },
];

const KNOWN_INSTRUCTORS = [
  { name: "Dr. Sarah Chen", email: "sarah.chen@mentify.edu", dept: "Computer Science" },
  { name: "Dr. Marcus Sterling", email: "marcus.sterling@mentify.edu", dept: "Mathematics" },
  { name: "Prof. David Okafor", email: "david.okafor@mentify.edu", dept: "Physics" },
  { name: "Dr. Priya Nambiar", email: "priya.nambiar@mentify.edu", dept: "Biology" },
  { name: "Dr. Aravind Swaminathan", email: "aravind.s@mentify.edu", dept: "Chemistry" },
  { name: "Alex Mercer", email: "alex.mercer@mentify.edu", dept: "Administration" },
];

const EVENT_TYPE_COLORS: Record<
  string,
  { bg: string; text: string; border: string; dot: string; label: string }
> = {
  EXAM: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-900/60",
    dot: "bg-rose-500",
    label: "Examinations",
  },
  QUIZ: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-900/60",
    dot: "bg-purple-500",
    label: "Quizzes & Tests",
  },
  CLASS: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-900/60",
    dot: "bg-indigo-500",
    label: "Course Lectures",
  },
  DEADLINE: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-900/60",
    dot: "bg-amber-500",
    label: "Assignment Deadlines",
  },
  SESSION: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-900/60",
    dot: "bg-emerald-500",
    label: "Administrative Sessions",
  },
};

const TIME_OPTIONS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "08:00 PM",
];

const TIME_HOURS_GRID = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

export const AdminCalendar: React.FC<AdminCalendarProps> = ({
  events: initialEvents,
  courses,
  onAddEvent,
  onUpdateEvent,
  onCancelEvent,
  onFilterEvents,
}) => {
  const courseOptions = courses.map((course) => ({
    code: course.code,
    title: course.title,
    dept: course.category,
  }));

  // Calendar base state follows the user's current local date.
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [view, setView] = useState<CalendarViewMode>("month");
  const [localEvents, setLocalEvents] = useState<AcademicEvent[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSimulatedError, setHasSimulatedError] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    // The parent owns the canonical event list after each API request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalEvents(initialEvents);
  }, [initialEvents]);

  // ----------------------------------------------------
  // FILTER STATES (Course, Teacher, Status, Visibility, Dates, Category, Venue, Search)
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedInstructor, setSelectedInstructor] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("ALL");
  const [dateRangePreset, setDateRangePreset] = useState<
    "ALL" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM"
  >("ALL");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [activeTypes, setActiveTypes] = useState<string[]>([
    "EXAM",
    "QUIZ",
    "CLASS",
    "DEADLINE",
    "SESSION",
  ]);
  const [selectedVenue, setSelectedVenue] = useState<string>("ALL");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    if (dateRangePreset === "CUSTOM" && customStartDate && customEndDate) {
      start.setTime(new Date(`${customStartDate}T00:00:00`).getTime());
      end.setTime(new Date(`${customEndDate}T00:00:00`).getTime());
      end.setDate(end.getDate() + 1);
    } else if (dateRangePreset === "THIS_WEEK") {
      start.setDate(start.getDate() - start.getDay());
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 7);
    } else if (dateRangePreset === "THIS_MONTH" || view === "month" || view === "agenda") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 1);
    } else if (view === "week") {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 7);
    } else {
      end.setDate(end.getDate() + 1);
    }
    const selectedType = activeTypes.length === 1 ? activeTypes[0] : undefined;
    const type =
      selectedType === "DEADLINE"
        ? "ASSIGNMENT"
        : selectedType === "SESSION"
          ? "ADMIN"
          : selectedType;
    const course = courses.find((item) => item.code === selectedCourse);
    void onFilterEvents(
      {
        type: type as CalendarEventType | undefined,
        courseId: course?.id,
        status:
          selectedStatus === "SCHEDULED" || selectedStatus === "CANCELLED"
            ? selectedStatus
            : undefined,
      },
      start,
      end,
    ).catch(() => undefined);
  }, [
    activeTypes,
    courses,
    currentDate,
    customEndDate,
    customStartDate,
    dateRangePreset,
    onFilterEvents,
    selectedCourse,
    selectedStatus,
    view,
  ]);

  // Modals & Selected Event Drawer
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<AcademicEvent | null>(null);

  // ----------------------------------------------------
  // ADD / EDIT FORM STATE WITH VALIDATION
  // ----------------------------------------------------
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<"CLASS" | "EXAM" | "QUIZ" | "DEADLINE" | "SESSION">(
    "EXAM",
  );
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [formStartTime, setFormStartTime] = useState("09:00 AM");
  const [formEndTime, setFormEndTime] = useState("11:30 AM");
  const [formLocation, setFormLocation] = useState("");
  const [formCourseCode, setFormCourseCode] = useState(courseOptions[0]?.code || "");
  const [formCourseTitle, setFormCourseTitle] = useState(courseOptions[0]?.title || "");
  const [formInstructorName, setFormInstructorName] = useState("");
  const [formInstructorEmail, setFormInstructorEmail] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formVisibility, setFormVisibility] = useState<EventVisibility>("PUBLIC_STUDENTS");
  const [formStatus, setFormStatus] = useState<"SCHEDULED" | "COMPLETED" | "CANCELLED">(
    "SCHEDULED",
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset or initialize form for creating new event
  const openCreateModal = (defaultDate?: string) => {
    setEditingEventId(null);
    setFormTitle("");
    setFormType("EXAM");
    setFormDate(
      defaultDate ||
        `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`,
    );
    setFormStartTime("09:00 AM");
    setFormEndTime("11:30 AM");
    setFormLocation("");
    setFormCourseCode(courseOptions[0]?.code || "");
    setFormCourseTitle(courseOptions[0]?.title || "");
    setFormInstructorName("");
    setFormInstructorEmail("");
    setFormDescription("");
    setFormVisibility("PUBLIC_STUDENTS");
    setFormStatus("SCHEDULED");
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Populate form for editing existing event
  const openEditModal = (evt: AcademicEvent) => {
    setEditingEventId(evt.id);
    setFormTitle(evt.title);
    setFormType(evt.type);
    setFormDate(evt.date);

    // Extract start and end time if possible
    const times = evt.time.split("-").map((t) => t.trim());
    setFormStartTime(times[0] || "09:00 AM");
    setFormEndTime(times[1] || "10:30 AM");

    setFormLocation(evt.location);
    setFormCourseCode(evt.courseCode || courseOptions[0]?.code || "");
    setFormCourseTitle(evt.courseTitle || courseOptions[0]?.title || "");
    setFormInstructorName(evt.instructorName || "");
    setFormInstructorEmail(evt.instructorEmail || "");
    setFormDescription(evt.description || "");
    setFormVisibility(evt.visibility || "PUBLIC_STUDENTS");
    setFormStatus(evt.status || "SCHEDULED");
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Month navigation helpers
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    triggerSimulatedLoading();
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    triggerSimulatedLoading();
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    triggerSimulatedLoading();
    setCurrentDate(new Date());
  };

  const handlePrevWeek = () => {
    triggerSimulatedLoading();
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 7);
    setCurrentDate(next);
  };

  const handleNextWeek = () => {
    triggerSimulatedLoading();
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handlePrevDay = () => {
    triggerSimulatedLoading();
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNextDay = () => {
    triggerSimulatedLoading();
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const triggerSimulatedLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 180);
  };

  // Course change in form: auto-populate courseTitle
  const handleCourseSelectionChange = (code: string) => {
    setFormCourseCode(code);
    const found = courseOptions.find((c) => c.code === code);
    if (found) {
      setFormCourseTitle(found.title);
    } else {
      setFormCourseTitle("");
    }
  };

  // Instructor change in form: auto-populate instructorEmail
  const handleInstructorSelectionChange = (name: string) => {
    setFormInstructorName(name);
    const found = KNOWN_INSTRUCTORS.find((i) => i.name === name);
    if (found) {
      setFormInstructorEmail(found.email);
    }
  };

  // ----------------------------------------------------
  // OVERLAPPING-EVENT / COLLISION SENTINEL
  // ----------------------------------------------------
  const venueConflicts = useMemo(() => {
    const conflicts: { eventA: AcademicEvent; eventB: AcademicEvent; reason: string }[] = [];
    for (let i = 0; i < localEvents.length; i++) {
      for (let j = i + 1; j < localEvents.length; j++) {
        const a = localEvents[i];
        const b = localEvents[j];
        if (a.date === b.date && a.status !== "CANCELLED" && b.status !== "CANCELLED") {
          // Check venue overlap
          if (
            a.location === b.location &&
            a.location !== "TiT LMS Submission Portal" &&
            a.location !== "Campus Wide"
          ) {
            conflicts.push({
              eventA: a,
              eventB: b,
              reason: `Venue Double-Booking: ${a.location}`,
            });
          }
          // Check teacher overlap
          if (
            a.instructorName &&
            b.instructorName &&
            a.instructorName === b.instructorName &&
            a.instructorName !== "Alex Mercer"
          ) {
            conflicts.push({
              eventA: a,
              eventB: b,
              reason: `Instructor Double-Booking: ${a.instructorName}`,
            });
          }
        }
      }
    }
    return conflicts;
  }, [localEvents]);

  // Check if a specific event is in conflict
  const isEventConflicted = (evtId: string) => {
    return venueConflicts.some((c) => c.eventA.id === evtId || c.eventB.id === evtId);
  };

  // In-form real-time conflict detector
  const inlineFormConflict = useMemo(() => {
    if (!formDate || !formLocation) return null;
    if (formLocation === "TiT LMS Submission Portal" || formLocation === "Campus Wide") return null;

    const conflict = localEvents.find(
      (e) =>
        e.id !== editingEventId &&
        e.date === formDate &&
        e.location === formLocation &&
        e.status !== "CANCELLED",
    );

    if (conflict) {
      return `Venue Warning: "${conflict.title}" is already scheduled in ${formLocation} on ${formDate} (${conflict.time}).`;
    }
    return null;
  }, [formDate, formLocation, localEvents, editingEventId]);

  // ----------------------------------------------------
  // FILTERING LOGIC WITH MULTI-DIMENSIONAL CRITERIA
  // ----------------------------------------------------
  const filteredEvents = useMemo(() => {
    return localEvents.filter((e) => {
      // 1. Category / Type
      if (!activeTypes.includes(e.type)) return false;

      // 2. Course Filter
      if (selectedCourse !== "ALL" && e.courseCode !== selectedCourse) return false;

      // 3. Teacher Filter
      if (selectedInstructor !== "ALL" && e.instructorName !== selectedInstructor) return false;

      // 4. Status Filter
      if (selectedStatus !== "ALL" && e.status !== selectedStatus) return false;

      // 5. Visibility Filter
      if (selectedVisibility !== "ALL") {
        const vis = e.visibility || "PUBLIC_STUDENTS";
        if (vis !== selectedVisibility) return false;
      }

      // 6. Venue Filter
      if (selectedVenue !== "ALL" && e.location !== selectedVenue) return false;

      // 7. Date Range Filter
      const now = new Date();
      if (dateRangePreset === "THIS_WEEK") {
        const d = new Date(e.date + "T00:00:00");
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (d < weekStart || d > weekEnd) return false;
      } else if (dateRangePreset === "THIS_MONTH") {
        if (
          !e.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
        )
          return false;
      } else if (dateRangePreset === "CUSTOM") {
        if (customStartDate && e.date < customStartDate) return false;
        if (customEndDate && e.date > customEndDate) return false;
      }

      // 8. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesCourse =
          e.courseCode?.toLowerCase().includes(q) || e.courseTitle?.toLowerCase().includes(q);
        const matchesLocation = e.location.toLowerCase().includes(q);
        const matchesInstructor = e.instructorName?.toLowerCase().includes(q);
        const matchesDesc = e.description?.toLowerCase().includes(q);
        if (
          !matchesTitle &&
          !matchesCourse &&
          !matchesLocation &&
          !matchesInstructor &&
          !matchesDesc
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    localEvents,
    activeTypes,
    selectedCourse,
    selectedInstructor,
    selectedStatus,
    selectedVisibility,
    selectedVenue,
    dateRangePreset,
    customStartDate,
    customEndDate,
    searchQuery,
  ]);

  // Check if any filter is active
  const isAnyFilterActive = useMemo(() => {
    return (
      selectedCourse !== "ALL" ||
      selectedInstructor !== "ALL" ||
      selectedStatus !== "ALL" ||
      selectedVisibility !== "ALL" ||
      selectedVenue !== "ALL" ||
      dateRangePreset !== "ALL" ||
      searchQuery.trim().length > 0 ||
      activeTypes.length !== 5
    );
  }, [
    selectedCourse,
    selectedInstructor,
    selectedStatus,
    selectedVisibility,
    selectedVenue,
    dateRangePreset,
    searchQuery,
    activeTypes,
  ]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCourse !== "ALL") count++;
    if (selectedInstructor !== "ALL") count++;
    if (selectedStatus !== "ALL") count++;
    if (selectedVisibility !== "ALL") count++;
    if (selectedVenue !== "ALL") count++;
    if (dateRangePreset !== "ALL") count++;
    if (searchQuery.trim().length > 0) count++;
    if (activeTypes.length !== 5) count += 5 - activeTypes.length;
    return count;
  }, [
    selectedCourse,
    selectedInstructor,
    selectedStatus,
    selectedVisibility,
    selectedVenue,
    dateRangePreset,
    searchQuery,
    activeTypes,
  ]);

  // Clear all filters handler
  const handleClearAllFilters = () => {
    setSelectedCourse("ALL");
    setSelectedInstructor("ALL");
    setSelectedStatus("ALL");
    setSelectedVisibility("ALL");
    setSelectedVenue("ALL");
    setDateRangePreset("ALL");
    setCustomStartDate("");
    setCustomEndDate("");
    setSearchQuery("");
    setActiveTypes(["EXAM", "QUIZ", "CLASS", "DEADLINE", "SESSION"]);
    triggerSimulatedLoading();
  };

  // ----------------------------------------------------
  // CALENDAR MATRIX GENERATION
  // ----------------------------------------------------
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days: {
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Preceding month trailing days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(currentYear, currentMonth, i);
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const today = new Date();
      const isToday =
        currentYear === today.getFullYear() &&
        currentMonth === today.getMonth() &&
        i === today.getDate();
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Trailing days
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Current week calculation
  const currentWeekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const week: {
      date: Date;
      dateStr: string;
      dayName: string;
      dayNumber: number;
      isToday: boolean;
    }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const today = new Date();
      const isToday =
        day.getFullYear() === today.getFullYear() &&
        day.getMonth() === today.getMonth() &&
        day.getDate() === today.getDate();
      week.push({
        date: day,
        dateStr,
        dayName: dayNames[i],
        dayNumber: day.getDate(),
        isToday,
      });
    }
    return week;
  }, [currentDate]);

  // ----------------------------------------------------
  // FORM SUBMISSION & VALIDATION
  // ----------------------------------------------------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formTitle.trim()) {
      errors.title = "Event title is required.";
    }
    if (!formDate) {
      errors.date = "Date is required.";
    }

    // Time validation
    const startIdx = TIME_OPTIONS.indexOf(formStartTime);
    const endIdx = TIME_OPTIONS.indexOf(formEndTime);
    if (startIdx !== -1 && endIdx !== -1 && startIdx >= endIdx) {
      errors.time = "End time must be later than start time.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const toIsoTime = (value: string) => {
      const [time, meridiem] = value.split(" ");
      let hours = Number(time.split(":")[0]);
      const minutes = Number(time.split(":")[1]);
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
    };
    const apiEventType: CalendarEventType =
      formType === "DEADLINE" ? "ASSIGNMENT" : formType === "SESSION" ? "ADMIN" : formType;
    const apiVisibility =
      formVisibility === "PUBLIC_STUDENTS"
        ? "GLOBAL"
        : formVisibility === "FACULTY_ONLY" || formVisibility === "ADMIN_RESTRICTED"
          ? "ROLE"
          : formVisibility;
    const course = courses.find((item) => item.code === formCourseCode);
    const request: CalendarEventRequest = {
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      eventType: apiEventType,
      startDateTime: `${formDate}T${toIsoTime(formStartTime)}`,
      endDateTime: `${formDate}T${toIsoTime(formEndTime)}`,
      allDay: false,
      courseId: course?.id || null,
      visibility: apiVisibility as CalendarEventRequest["visibility"],
      targetRole:
        formVisibility === "FACULTY_ONLY"
          ? "TEACHER"
          : formVisibility === "ADMIN_RESTRICTED"
            ? "ADMIN"
            : null,
      location: formLocation,
    };
    try {
      if (editingEventId) await onUpdateEvent(editingEventId, request);
      else await onAddEvent(request);
      setIsAddEditModalOpen(false);
    } catch (error) {
      setFormErrors({
        submit: error instanceof Error ? error.message : "Unable to save calendar event.",
      });
      return;
    }
  };

  // ----------------------------------------------------
  // CANCEL / DELETE HANDLERS
  // ----------------------------------------------------
  const handleOpenDeleteConfirm = (evt: AcademicEvent) => {
    setEventToDelete(evt);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!eventToDelete) return;
    await onCancelEvent(eventToDelete.id);
    if (selectedEvent?.id === eventToDelete.id) setSelectedEvent(null);
    setIsDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  const handleConfirmMarkAsCancelled = async () => {
    if (!eventToDelete) return;
    await onCancelEvent(eventToDelete.id);
    setIsDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  // Download iCal (.ics)
  const handleDownloadIcs = (event: AcademicEvent) => {
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TiT Inc//Academic Operations Portal//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@mentify.edu`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || "Academic Event"}\\nCourse: ${event.courseCode || "General"}\\nInstructor: ${event.instructorName || "Faculty"}`,
      `LOCATION:${event.location}`,
      `STATUS:${event.status}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event.id}_${event.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTypeFilter = (type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentDateFormatted = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <PageHeader
        title="Academic Operations Calendar"
        description="Master timetable and facility scheduling for examinations, lectures, assignment cutoffs, and faculty councils."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Platform Operations" },
          { label: "Academic Calendar" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={() => openCreateModal(currentDateFormatted)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/30 cursor-pointer sm:w-auto"
              title="Create a new calendar event"
            >
              <Plus className="w-4 h-4" />
              <span>Create event</span>
            </button>
          </div>
        }
      />

      {/* OVERLAPPING EVENT COLLISION ALERT BANNER */}
      {venueConflicts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start justify-between gap-3 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                Timetable Overlap Warning ({venueConflicts.length} Potential Collisions)
              </span>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                {venueConflicts[0].reason} on {venueConflicts[0].eventA.date}. Review venue bookings
                to prevent student examination room overlap.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSearchQuery(venueConflicts[0].eventA.location);
              setView("agenda");
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-colors shrink-0 shadow-xs"
          >
            Resolve Collision
          </button>
        </div>
      )}

      {/* ERROR STATE BANNER (if simulated/triggered) */}
      {hasSimulatedError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to synchronize calendar sync stream with Keycloak SSO.</span>
          </div>
          <button
            onClick={() => setHasSimulatedError(false)}
            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Operations Bar: Navigation, View Modes, Search, Date Range */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Date Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={
                view === "month"
                  ? handlePrevMonth
                  : view === "week"
                    ? handlePrevWeek
                    : handlePrevDay
              }
              title="Previous"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={
                view === "month"
                  ? handleNextMonth
                  : view === "week"
                    ? handleNextWeek
                    : handleNextDay
              }
              title="Next"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="ml-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {view === "month" && `${monthNames[currentMonth]} ${currentYear}`}
              {view === "week" &&
                `Week of ${monthNames[currentWeekDays[0].date.getMonth()]} ${currentWeekDays[0].dayNumber}, ${currentYear}`}
              {view === "day" &&
                `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentYear}`}
              {view === "agenda" && `Schedule Agenda · ${monthNames[currentMonth]} ${currentYear}`}
            </h2>
            <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Fall 2026 · Week 7
            </span>
          </div>
        </div>

        {/* View Switcher & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex items-center min-w-[160px] sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, teacher, course..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Segmented View Mode Controls */}
          <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl text-xs font-medium">
            {(["month", "week", "day", "agenda"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  triggerSimulatedLoading();
                  setView(mode);
                }}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  view === mode
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE FILTER CHIPS & CLEAR ALL BAR */}
      {isAnyFilterActive && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Active Filters:</span>
            </span>

            {/* Course chip */}
            {selectedCourse !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px]">
                <span>Course: {selectedCourse}</span>
                <button onClick={() => setSelectedCourse("ALL")} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Teacher chip */}
            {selectedInstructor !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-[11px]">
                <span>Teacher: {selectedInstructor}</span>
                <button
                  onClick={() => setSelectedInstructor("ALL")}
                  className="hover:text-violet-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Status chip */}
            {selectedStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px]">
                <span>Status: {selectedStatus}</span>
                <button onClick={() => setSelectedStatus("ALL")} className="hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Visibility chip */}
            {selectedVisibility !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[11px]">
                <span>
                  Visibility:{" "}
                  {selectedVisibility === "PUBLIC_STUDENTS"
                    ? "Public"
                    : selectedVisibility === "FACULTY_ONLY"
                      ? "Faculty"
                      : "Admin"}
                </span>
                <button onClick={() => setSelectedVisibility("ALL")} className="hover:text-sky-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Venue chip */}
            {selectedVenue !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                <span className="truncate max-w-[140px]">Venue: {selectedVenue}</span>
                <button onClick={() => setSelectedVenue("ALL")} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Date range chip */}
            {dateRangePreset !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px]">
                <span>
                  Date:{" "}
                  {dateRangePreset === "THIS_WEEK"
                    ? "This Week"
                    : dateRangePreset === "THIS_MONTH"
                      ? "This Month"
                      : `${customStartDate} to ${customEndDate}`}
                </span>
                <button onClick={() => setDateRangePreset("ALL")} className="hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search query chip */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery("")} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleClearAllFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}

      {/* Main Split Layout: Left Control Sidebar + Main Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* LEFT COLUMN: FILTERS & CONTROL PANEL (Desktop) */}
        <div className="hidden lg:block space-y-4">
          {/* Interactive Mini Calendar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>
                {monthNames[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:text-slate-900 dark:hover:text-white rounded"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:text-slate-900 dark:hover:text-white rounded"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mini Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="text-slate-400 font-semibold py-0.5">
                  {d}
                </span>
              ))}
              {calendarGrid.slice(0, 35).map((cell, idx) => {
                const isSelected =
                  currentDate.getFullYear() === cell.date.getFullYear() &&
                  currentDate.getMonth() === cell.date.getMonth() &&
                  currentDate.getDate() === cell.date.getDate();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentDate(cell.date);
                      if (view === "agenda") setView("day");
                    }}
                    className={`py-1 rounded-md font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white font-bold"
                        : cell.isToday
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                          : cell.isCurrentMonth
                            ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            : "text-slate-300 dark:text-slate-700"
                    }`}
                  >
                    {cell.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Criteria Filters Panel */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                <span>Academic Filters</span>
              </span>
              {isAnyFilterActive && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-[10px] text-rose-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Course Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Course Module
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="ALL">All Courses ({courseOptions.length})</option>
                {courseOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher / Instructor Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Teacher / Proctor
              </label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="ALL">All Faculty Members ({KNOWN_INSTRUCTORS.length})</option>
                {KNOWN_INSTRUCTORS.map((i) => (
                  <option key={i.email} value={i.name}>
                    {i.name} ({i.dept})
                  </option>
                ))}
              </select>
            </div>

            {/* Event Status Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Event Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled / Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Visibility Audience
              </label>
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="ALL">All Audiences</option>
                <option value="PUBLIC_STUDENTS">Public (Student Facing)</option>
                <option value="FACULTY_ONLY">Faculty Only</option>
                <option value="ADMIN_RESTRICTED">Admin Restricted</option>
              </select>
            </div>

            {/* Date-Range Presets Filter */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <CalendarRange className="w-3.5 h-3.5 text-indigo-500" />
                <span>Date Range</span>
              </label>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDateRangePreset("ALL")}
                  className={`px-2 py-1 rounded-md text-left transition-colors ${
                    dateRangePreset === "ALL"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  All Dates
                </button>
                <button
                  type="button"
                  onClick={() => setDateRangePreset("THIS_WEEK")}
                  className={`px-2 py-1 rounded-md text-left transition-colors ${
                    dateRangePreset === "THIS_WEEK"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setDateRangePreset("THIS_MONTH")}
                  className={`px-2 py-1 rounded-md text-left transition-colors ${
                    dateRangePreset === "THIS_MONTH"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => setDateRangePreset("CUSTOM")}
                  className={`px-2 py-1 rounded-md text-left transition-colors ${
                    dateRangePreset === "CUSTOM"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  Custom
                </button>
              </div>

              {dateRangePreset === "CUSTOM" && (
                <div className="space-y-1.5 pt-1.5 animate-in fade-in duration-150">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                    placeholder="End Date"
                  />
                </div>
              )}
            </div>

            {/* Event Category Layers */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Event Categories</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({activeTypes.length}/5)
                </span>
              </label>

              <div className="space-y-1">
                {Object.entries(EVENT_TYPE_COLORS).map(([typeKey, meta]) => {
                  const isChecked = activeTypes.includes(typeKey);
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => toggleTypeFilter(typeKey)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-slate-100/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                          : "text-slate-400 opacity-50 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                        <span>{meta.label}</span>
                      </div>
                      {isChecked && (
                        <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Venue Filter */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Venue Location
              </label>
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-[11.5px]"
              >
                <option value="ALL">All Campus Facilities</option>
                {CAMPUS_VENUES.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CALENDAR VIEWS (3 COLS) */}
        <div className="lg:col-span-3">
          {/* LOADING SKELETON STATE */}
          {isLoading ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
              <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                ))}
              </div>
            </div>
          ) : filteredEvents.length === 0 && isAnyFilterActive ? (
            /* EMPTY STATE WHEN FILTERS YIELD 0 RESULTS */
            <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Academic Events Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  No scheduled timetable entries matched your current combination of course,
                  instructor, status, or date filters.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors"
                >
                  Clear All Filters
                </button>
                <button
                  type="button"
                  onClick={() => openCreateModal(currentDateFormatted)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Schedule New Event
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. MONTH VIEW */}
              {view === "month" && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2.5">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/70">
                    {calendarGrid.map((cell, idx) => {
                      const dayEvents = cell.isCurrentMonth
                        ? filteredEvents.filter((e) => e.date === cell.dateStr)
                        : [];

                      return (
                        <div
                          key={idx}
                          className={`min-h-[120px] p-2 flex flex-col justify-between transition-colors group relative ${
                            !cell.isCurrentMonth
                              ? "bg-slate-50/30 dark:bg-slate-950/20 text-slate-300 dark:text-slate-700"
                              : cell.isToday
                                ? "bg-indigo-50/30 dark:bg-indigo-950/20"
                                : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-xs font-semibold tabular-nums ${
                                cell.isToday
                                  ? "w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs"
                                  : cell.isCurrentMonth
                                    ? "text-slate-800 dark:text-slate-200"
                                    : "text-slate-400 dark:text-slate-600"
                              }`}
                            >
                              {cell.dayNumber}
                            </span>

                            {cell.isToday && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Today
                              </span>
                            )}

                            {cell.isCurrentMonth && (
                              <button
                                type="button"
                                title="Schedule event on this day"
                                onClick={() => openCreateModal(cell.dateStr)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Event Chips */}
                          <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar max-h-24">
                            {dayEvents.slice(0, 3).map((evt) => {
                              const meta = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.CLASS;
                              const isConflict = isEventConflicted(evt.id);
                              const isCancelled = evt.status === "CANCELLED";

                              return (
                                <button
                                  key={evt.id}
                                  type="button"
                                  onClick={() => setSelectedEvent(evt)}
                                  className={`w-full text-left px-2 py-1 rounded-lg border text-[10.5px] font-medium truncate transition-all hover:scale-[1.01] block cursor-pointer ${
                                    isCancelled
                                      ? "line-through opacity-50 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500"
                                      : `${meta.bg} ${meta.text} ${meta.border}`
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {isConflict ? (
                                      <span title="Collision Warning">
                                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                                      </span>
                                    ) : (
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`}
                                      />
                                    )}
                                    {evt.courseCode && (
                                      <span className="font-mono text-[9px] font-bold opacity-85">
                                        {evt.courseCode}
                                      </span>
                                    )}
                                    <span className="truncate">{evt.title}</span>
                                  </div>
                                </button>
                              );
                            })}

                            {dayEvents.length > 3 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentDate(cell.date);
                                  setView("day");
                                }}
                                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1 block text-left"
                              >
                                +{dayEvents.length - 3} more
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. WEEK VIEW */}
              {view === "week" && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-center py-2.5">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
                      Time
                    </div>
                    {currentWeekDays.map((d, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setCurrentDate(d.date);
                          setView("day");
                        }}
                        className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg py-1 transition-colors ${
                          d.isToday ? "bg-indigo-50/80 dark:bg-indigo-950/60" : ""
                        }`}
                      >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {d.dayName}
                        </span>
                        <span
                          className={`text-sm font-bold font-mono tabular-nums ${
                            d.isToday
                              ? "inline-flex w-6 h-6 rounded-full bg-indigo-600 text-white items-center justify-center"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {d.dayNumber}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[620px] overflow-y-auto">
                    {TIME_HOURS_GRID.map((hour, hIdx) => (
                      <div
                        key={hIdx}
                        className="grid grid-cols-8 min-h-[68px] divide-x divide-slate-100 dark:divide-slate-800/80"
                      >
                        <div className="p-2 text-right text-[10px] font-mono font-medium text-slate-400 bg-slate-50/40 dark:bg-slate-950/20 select-none">
                          {hour}
                        </div>

                        {currentWeekDays.map((day, dIdx) => {
                          const hourEvents = filteredEvents.filter((e) => {
                            if (e.date !== day.dateStr) return false;
                            const startTimeLower = e.time.toLowerCase();
                            if (startTimeLower.includes(hour.slice(0, 2).toLowerCase()))
                              return true;
                            if (hIdx === 1 && startTimeLower.includes("09:00")) return true;
                            if (hIdx === 2 && startTimeLower.includes("10:00")) return true;
                            if (hIdx === 3 && startTimeLower.includes("11:00")) return true;
                            if (hIdx === 5 && startTimeLower.includes("01:30")) return true;
                            if (hIdx === 6 && startTimeLower.includes("02:00")) return true;
                            if (hIdx === 7 && startTimeLower.includes("03:00")) return true;
                            return false;
                          });

                          return (
                            <div
                              key={dIdx}
                              onClick={() => {
                                setFormDate(day.dateStr);
                                setFormStartTime(hour);
                                openCreateModal(day.dateStr);
                              }}
                              className={`p-1 transition-colors relative hover:bg-slate-50/60 dark:hover:bg-slate-800/30 cursor-pointer ${
                                day.isToday ? "bg-indigo-50/10 dark:bg-indigo-950/10" : ""
                              }`}
                            >
                              {hourEvents.map((evt) => {
                                const meta = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.CLASS;
                                const isConflict = isEventConflicted(evt.id);
                                return (
                                  <div
                                    key={evt.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(evt);
                                    }}
                                    className={`p-1.5 rounded-lg border text-[10px] mb-1 leading-tight shadow-xs transition-transform hover:scale-[1.02] ${meta.bg} ${meta.text} ${meta.border}`}
                                  >
                                    <div className="font-bold flex items-center justify-between">
                                      <span className="truncate">{evt.courseCode || evt.type}</span>
                                      {isConflict && (
                                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                                      )}
                                    </div>
                                    <div className="truncate font-medium">{evt.title}</div>
                                    <div className="text-[9px] opacity-75 truncate">
                                      {evt.instructorName}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. DAY VIEW */}
              {view === "day" && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {monthNames[currentDate.getMonth()]} {currentDate.getDate()},{" "}
                        {currentDate.getFullYear()} Schedule
                      </h3>
                      <span className="text-xs text-slate-400">
                        Day Operations ·{" "}
                        {filteredEvents.filter((e) => e.date === currentDateFormatted).length}{" "}
                        Scheduled Sessions
                      </span>
                    </div>

                    <button
                      onClick={() => openCreateModal(currentDateFormatted)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add To This Day</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {filteredEvents.filter((e) => e.date === currentDateFormatted).length === 0 ? (
                      <div className="p-12 text-center space-y-2 text-slate-400">
                        <CalendarIcon className="w-8 h-8 mx-auto opacity-30 text-indigo-500" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          No events scheduled for this day
                        </p>
                        <p className="text-[11px]">
                          Campus venues are available for ad-hoc bookings.
                        </p>
                      </div>
                    ) : (
                      filteredEvents
                        .filter((e) => e.date === currentDateFormatted)
                        .map((evt) => {
                          const meta = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.CLASS;
                          const isConflict = isEventConflicted(evt.id);

                          return (
                            <div
                              key={evt.id}
                              onClick={() => setSelectedEvent(evt)}
                              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/40 dark:bg-slate-800/30 flex items-start justify-between cursor-pointer transition-all shadow-xs group"
                            >
                              <div className="flex items-start gap-3.5">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.text} ${meta.border}`}
                                >
                                  {evt.type}
                                </span>

                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {evt.title}
                                    </h4>
                                    {evt.courseCode && (
                                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                                        {evt.courseCode}
                                      </span>
                                    )}
                                    {isConflict && (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Collision</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 font-mono">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{evt.time}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{evt.location}</span>
                                    </span>
                                    {evt.instructorName && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <User className="w-3.5 h-3.5 text-slate-400" />
                                          <span>{evt.instructorName}</span>
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  {evt.description && (
                                    <p className="text-[11.5px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1">
                                      {evt.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div
                                className="flex items-center gap-1 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => openEditModal(evt)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                                  title="Edit Event"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteConfirm(evt)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* 4. AGENDA VIEW */}
              {view === "agenda" && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Chronological Master Timetable
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Displaying {filteredEvents.length} filtered academic events
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[640px] overflow-y-auto">
                    {filteredEvents.map((evt) => {
                      const meta = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.CLASS;
                      const isConflict = isEventConflicted(evt.id);
                      const isCancelled = evt.status === "CANCELLED";

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                            isCancelled ? "opacity-60 bg-slate-50/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 text-center shrink-0">
                              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white block">
                                {evt.date.slice(5)}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase font-medium">
                                {new Date(evt.date + "T00:00:00").toLocaleDateString("en-US", {
                                  weekday: "short",
                                })}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${meta.bg} ${meta.text} ${meta.border}`}
                                >
                                  {evt.type}
                                </span>
                                <h4
                                  className={`text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                                    isCancelled ? "line-through text-slate-400" : ""
                                  }`}
                                >
                                  {evt.title}
                                </h4>
                                {evt.courseCode && (
                                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-200/40 dark:border-indigo-800/40">
                                    {evt.courseCode}
                                  </span>
                                )}
                                {isConflict && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-bold">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Overlap</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{evt.time}</span>
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{evt.location}</span>
                                </span>
                                {evt.instructorName && (
                                  <>
                                    <span>·</span>
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span>{evt.instructorName}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-2 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => openEditModal(evt)}
                              title="Edit Event"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadIcs(evt)}
                              title="Download iCal (.ics)"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <span
                              onClick={() => setSelectedEvent(evt)}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer pl-1"
                            >
                              Inspect
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MOBILE FILTER SLIDE-OVER DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-full h-full bg-white dark:bg-slate-900 p-5 shadow-2xl flex flex-col space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Calendar Filters
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="ALL">All Courses</option>
                {courseOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Instructor
              </label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="ALL">All Faculty</option>
                {KNOWN_INSTRUCTORS.map((i) => (
                  <option key={i.email} value={i.name}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Visibility
              </label>
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="ALL">All Audiences</option>
                <option value="PUBLIC_STUDENTS">Public (Students)</option>
                <option value="FACULTY_ONLY">Faculty Only</option>
                <option value="ADMIN_RESTRICTED">Admin Restricted</option>
              </select>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={handleClearAllFilters}
                className="w-1/2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT DETAIL MODAL / DRAWER (With Full Course & Teacher Metadata & Description) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      EVENT_TYPE_COLORS[selectedEvent.type]?.bg || ""
                    } ${EVENT_TYPE_COLORS[selectedEvent.type]?.text || ""} ${
                      EVENT_TYPE_COLORS[selectedEvent.type]?.border || ""
                    }`}
                  >
                    {selectedEvent.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                      selectedEvent.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : selectedEvent.status === "CANCELLED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    {selectedEvent.status}
                  </span>
                  {selectedEvent.visibility && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {selectedEvent.visibility === "PUBLIC_STUDENTS"
                        ? "Public"
                        : selectedEvent.visibility === "FACULTY_ONLY"
                          ? "Faculty Only"
                          : "Admin Restricted"}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(selectedEvent)}
                  title="Edit Event"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenDeleteConfirm(selectedEvent)}
                  title="Delete/Cancel Event"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Collision Warning if in conflict */}
            {isEventConflicted(selectedEvent.id) && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Venue Collision Detected for this booking slot in {selectedEvent.location}.
                </span>
              </div>
            )}

            {/* Time & Venue Block */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Date & Time
                </span>
                <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{selectedEvent.time}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Facility Location
                </span>
                <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{selectedEvent.location}</span>
                </div>
                <span className="text-[10.5px] text-slate-400 block">
                  Seating Capacity:{" "}
                  {CAMPUS_VENUES.find((v) => v.name === selectedEvent.location)?.capacity || 100}{" "}
                  seats
                </span>
              </div>
            </div>

            {/* Course Information Section */}
            {selectedEvent.courseCode && (
              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Academic Course Syllabus
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedEvent.courseTitle || selectedEvent.courseCode}
                    </h4>
                    <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                      Module Code: {selectedEvent.courseCode}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    4 Academic Credits
                  </span>
                </div>
              </div>
            )}

            {/* Teacher / Instructor Section */}
            {selectedEvent.instructorName && (
              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Faculty Lead / Proctor
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {selectedEvent.instructorName[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedEvent.instructorName}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>
                          {selectedEvent.instructorEmail ||
                            `${selectedEvent.instructorName.toLowerCase().replace(/[^a-z]/g, "")}@mentify.edu`}
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400">Verified Faculty</span>
                </div>
              </div>
            )}

            {/* Description Display */}
            {selectedEvent.description && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Operational Description & Notes
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedEvent.description}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleOpenDeleteConfirm(selectedEvent)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancel / Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadIcs(selectedEvent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export iCal (.ics)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL / DELETE CONFIRMATION DIALOG */}
      {isDeleteConfirmOpen && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Modify or Remove Academic Event
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to alter the schedule for{" "}
              <strong className="text-slate-900 dark:text-white">"{eventToDelete.title}"</strong> on{" "}
              {eventToDelete.date}?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <span>
                • <strong>Mark as Cancelled:</strong> Retains event on timetable with a cancelled
                marker for faculty and students.
              </span>
              <br />
              <span>
                • <strong>Delete Permanently:</strong> Completely removes record from calendar
                database.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Keep Event
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkAsCancelled}
                className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200"
              >
                Mark Cancelled
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE / EDIT EVENT MODAL WITH FORM VALIDATION */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingEventId ? "Edit Academic Event" : "Schedule Academic Event"}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-form Venue Collision Detector Warning */}
            {inlineFormConflict && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{inlineFormConflict}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="py-4 space-y-4 text-xs">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (formErrors.title) setFormErrors((p) => ({ ...p, title: "" }));
                  }}
                  placeholder="e.g. Advanced Calculus Midterm Examination"
                  className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 text-xs ${
                    formErrors.title
                      ? "border-rose-300 focus:ring-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                  }`}
                />
                {formErrors.title && (
                  <span className="text-rose-500 text-[11px] mt-1 block">{formErrors.title}</span>
                )}
              </div>

              {/* Event Category & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Category
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="EXAM">Examination</option>
                    <option value="QUIZ">Quiz / Assessment</option>
                    <option value="CLASS">Regular Lecture</option>
                    <option value="DEADLINE">Submission Cutoff</option>
                    <option value="SESSION">Administrative Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Course & Instructor Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Module
                  </label>
                  <select
                    value={formCourseCode}
                    onChange={(e) => handleCourseSelectionChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  >
                    <option value="">General event (no course)</option>
                    {courseOptions.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instructor / Proctor
                  </label>
                  <select
                    value={formInstructorName}
                    onChange={(e) => handleInstructorSelectionChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    {KNOWN_INSTRUCTORS.map((i) => (
                      <option key={i.email} value={i.name}>
                        {i.name} ({i.dept})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, Start Time & End Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <select
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  >
                    {TIME_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <select
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  >
                    {TIME_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formErrors.time && (
                <span className="text-rose-500 text-[11px] block">{formErrors.time}</span>
              )}

              {/* Campus Venue Location & Visibility */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Venue
                  </label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    {CAMPUS_VENUES.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name} (Cap: {v.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Audience Visibility
                  </label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="PUBLIC_STUDENTS">Public (All Students & Faculty)</option>
                    <option value="FACULTY_ONLY">Faculty & Staff Only</option>
                    <option value="ADMIN_RESTRICTED">Administrative Governance Only</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Description & Clinical Notes
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide syllabus context, materials required, or proctor instructions..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {editingEventId ? "Save Changes" : "Confirm & Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
