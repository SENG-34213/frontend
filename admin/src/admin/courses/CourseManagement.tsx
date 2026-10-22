import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  FileCheck2,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Sparkles,
  DollarSign,
  Globe,
  MapPin,
  Tag,
  AlertTriangle,
  Info,
  ExternalLink,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { DetailDrawer } from "../components/DetailDrawer";
import { UserAvatar } from "../components/UserAvatar";
import {
  Course,
  CreateCourseRequest,
  Grade,
  TeacherProfile,
  EnrollmentRecord,
  CurriculumModule,
  LearningMaterial,
} from "../types";
import { createCourse, deleteCourse, updateCourse } from "../api/coursesApi";
import { createMaterialApi } from "../../../../shared/materials/materialApi";

const THUMBNAIL_PRESETS = [
  {
    name: "Advanced Mathematics",
    subject: "Mathematics",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Computer Science",
    subject: "Computer Science",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Biology & Life Sciences",
    subject: "Biology",
    url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Physics & Mechanics",
    subject: "Physics",
    url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "World History & Arts",
    subject: "Social Studies",
    url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
  },
];

const COMMON_SUBJECTS = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Studies",
  "English Literature",
  "Business Studies",
];

// Course Service validates assignedTeacherId against the teacher's Keycloak user ID,
// while the admin users endpoint also exposes the database user ID as `id`.
function teacherAssignmentId(teacher: TeacherProfile) {
  return teacher.keycloakUserId || "";
}

function courseTeacherId(course: Course) {
  return course.assignedTeacherId || course.teacherId || "";
}

function displayGradeName(name?: string) {
  const value = name?.trim();
  return value && /^\d+$/.test(value) ? `Grade ${value}` : value || "Unassigned";
}

function materialIdFromThumbnail(source?: string) {
  return source?.startsWith("material:") ? source.slice("material:".length) : "";
}

function CourseThumbnailImage({
  source,
  alt,
  className,
}: {
  source?: string;
  alt: string;
  className: string;
}) {
  const materialId = materialIdFromThumbnail(source);
  const [materialSource, setMaterialSource] = useState("");
  const [loadedMaterialId, setLoadedMaterialId] = useState("");

  useEffect(() => {
    if (!materialId) return;

    let active = true;
    void createMaterialApi()
      .download(materialId)
      .then((response) => {
        if (active) {
          setMaterialSource(response.downloadUrl || response.url || "");
          setLoadedMaterialId(materialId);
        }
      })
      .catch(() => {
        if (active) {
          setMaterialSource("");
          setLoadedMaterialId(materialId);
        }
      });

    return () => {
      active = false;
    };
  }, [materialId, source]);

  const resolvedSource = materialId
    ? loadedMaterialId === materialId
      ? materialSource
      : ""
    : source || "";

  if (!resolvedSource) return null;
  return <img src={resolvedSource} alt={alt} className={className} />;
}

interface CourseManagementProps {
  courses: Course[];
  grades: Grade[];
  teachers: TeacherProfile[];
  enrollments: EnrollmentRecord[];
  curriculum: CurriculumModule[];
  materials: LearningMaterial[];
  onAddCourse: (newCourse: Course) => void;
  onUpdateCourse?: (
    courseId: string,
    updatedCourse: Parameters<typeof updateCourse>[1],
  ) => Promise<Course>;
  onDeleteCourse?: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  showCreateModalDirectly?: boolean;
  preselectedGradeId?: string | null;
  onNavigateToGrades?: () => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  courses,
  grades,
  teachers,
  enrollments,
  curriculum,
  materials,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  showCreateModalDirectly = false,
  preselectedGradeId = null,
  onNavigateToGrades,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState<"ALL" | "ONLINE" | "PHYSICAL">("ALL");
  const [publishFilter, setPublishFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(showCreateModalDirectly);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "curriculum" | "students" | "materials">(
    "overview",
  );

  // Course Form State (Matching latest Spring Boot CourseRequest contract)
  const initialFormState: CreateCourseRequest = {
    courseName: "",
    courseDescription: "",
    courseThumbnail: "",
    gradeId: preselectedGradeId || grades[0]?.id || "",
    assignedTeacherId: teachers[0] ? teacherAssignmentId(teachers[0]) : "",
    subject: "Mathematics",
    isOnline: true,
    isVisible: true,
    isPublished: true,
    courseEnrollmentId: null,
  };

  const [formData, setFormData] = useState<CreateCourseRequest>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState<number | null>(null);

  const thumbnailImage = thumbnailPreview || formData.courseThumbnail || "";

  const clearThumbnailFile = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const chooseThumbnail = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormErrors((current) => ({ ...current, courseThumbnail: "Choose an image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((current) => ({
        ...current,
        courseThumbnail: "Image must be 5 MB or smaller.",
      }));
      return;
    }

    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setFormErrors((current) => {
      const next = { ...current };
      delete next.courseThumbnail;
      return next;
    });
  };

  // Sync preselected grade if passed
  useEffect(() => {
    if (grades.length === 0) return;

    const selectedGradeStillExists = grades.some((grade) => grade.id === formData.gradeId);
    const preselectedGradeStillExists = Boolean(
      preselectedGradeId && grades.some((grade) => grade.id === preselectedGradeId),
    );

    // A grade can be deleted in another admin session while this page is open. Never
    // carry that stale UUID into the Course Service request.
    const nextGradeId = preselectedGradeStillExists
      ? preselectedGradeId!
      : selectedGradeStillExists
        ? formData.gradeId
        : grades[0].id;

    if (nextGradeId !== formData.gradeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({ ...prev, gradeId: nextGradeId }));
    }

    if (preselectedGradeStillExists) {
      setIsCreateOpen(true);
    }
  }, [formData.gradeId, grades, preselectedGradeId]);

  // Form Reset
  const resetForm = () => {
    clearThumbnailFile();
    setFormData({
      courseName: "",
      courseDescription: "",
      courseThumbnail: "",
      gradeId: grades[0]?.id || "",
      assignedTeacherId: teachers[0] ? teacherAssignmentId(teachers[0]) : "",
      subject: "Mathematics",
      isOnline: true,
      isVisible: true,
      isPublished: true,
      courseEnrollmentId: null,
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (course: Course) => {
    clearThumbnailFile();
    const assignedTeacher = teachers.find(
      (teacher) =>
        teacherAssignmentId(teacher) === courseTeacherId(course) ||
        teacher.id === courseTeacherId(course),
    );

    setFormData({
      courseName: course.courseName || course.title || "",
      courseDescription: course.courseDescription || course.description || "",
      courseThumbnail: course.courseThumbnail || "",
      gradeId: course.gradeId || grades[0]?.id || "",
      assignedTeacherId:
        assignedTeacher?.keycloakUserId ||
        courseTeacherId(course) ||
        (teachers[0] ? teacherAssignmentId(teachers[0]) : ""),
      subject: course.subject || course.category || "Mathematics",
      isOnline: course.isOnline ?? course.online ?? true,
      isVisible: course.isVisible ?? course.visible ?? true,
      isPublished:
        course.isPublished ??
        (course.courseStatus === "PUBLISHED" ||
          course.status === "ACTIVE" ||
          course.status === "PUBLISHED"),
      courseEnrollmentId: course.courseEnrollmentId || null,
    });
    setFormErrors({});
    setEditingCourse(course);
  };

  // Validation strictly adhering to Spring Boot @Valid constraints
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.courseName.trim()) {
      errors.courseName = "Course name is required";
    } else if (formData.courseName.length > 150) {
      errors.courseName = "Course name must not exceed 150 characters";
    }

    if (!formData.courseDescription.trim()) {
      errors.courseDescription = "Course description is required";
    } else if (formData.courseDescription.length > 2000) {
      errors.courseDescription = "Course description must not exceed 2000 characters";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject classification is required";
    } else if (formData.subject.length > 100) {
      errors.subject = "Subject must not exceed 100 characters";
    }

    const selectedGrade = grades.find((grade) => grade.id === formData.gradeId);
    if (!formData.gradeId) {
      errors.gradeId = "Target Grade selection is required";
    } else if (!selectedGrade) {
      errors.gradeId =
        "The selected grade is no longer available. Refresh and select an existing grade.";
    }

    const selectedTeacher = teachers.find(
      (teacher) => teacherAssignmentId(teacher) === formData.assignedTeacherId,
    );
    if (!formData.assignedTeacherId || !selectedTeacher?.keycloakUserId) {
      errors.assignedTeacherId =
        "Select a teacher with a valid Keycloak identity before creating the course";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Selected grade and faculty in real time
  const formSelectedGrade = grades.find((g) => g.id === formData.gradeId);
  const subjectDomainOptions =
    formSelectedGrade?.subjectDomains?.length ? formSelectedGrade.subjectDomains : COMMON_SUBJECTS;
  const formSelectedTeacher = teachers.find(
    (teacher) => teacherAssignmentId(teacher) === formData.assignedTeacherId,
  );

  const gradeNameForCourse = (course: Course) =>
    displayGradeName(
      course.gradeName || grades.find((grade) => grade.id === course.gradeId)?.name || course.grade,
    );

  const teacherForCourse = (course: Course) =>
    teachers.find(
      (teacher) =>
        teacherAssignmentId(teacher) === courseTeacherId(course) ||
        teacher.id === courseTeacherId(course),
    );

  const teacherNameForCourse = (course: Course) => {
    const teacher = teacherForCourse(course);
    return teacher
      ? `${teacher.firstName} ${teacher.lastName}`
      : course.teacherName || "Unassigned faculty";
  };

  // Submit the same form through the real Course Service API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormErrors({});

    let newlyCreatedCourseId: string | null = null;
    let uploadedThumbnailId: string | null = null;
    const materialApi = createMaterialApi();

    try {
      const selectedGrade = grades.find((grade) => grade.id === formData.gradeId);
      if (!selectedGrade) {
        setFormErrors({
          gradeId:
            "The selected grade is no longer available. Refresh and select an existing grade.",
        });
        return;
      }
      const payload = {
        courseName: formData.courseName.trim(),
        courseDescription: formData.courseDescription.trim(),
        courseThumbnail: thumbnailFile ? undefined : formData.courseThumbnail?.trim() || undefined,
        courseFeeMonthly: selectedGrade?.monthlyFee || 1,
        gradeId: formData.gradeId,
        assignedTeacherId: formData.assignedTeacherId,
        subject: formData.subject.trim(),
        isOnline: Boolean(formData.isOnline),
        isVisible: Boolean(formData.isVisible),
        isPublished: Boolean(formData.isPublished),
        courseEnrollmentId: formData.courseEnrollmentId || null,
      };

      let saved: Course;
      if (thumbnailFile) {
        // A new thumbnail must upload successfully before an existing course
        // is changed. This keeps failed oversized uploads from partially
        // updating the course.
        saved = editingCourse ? editingCourse : await createCourse(payload);
        if (!editingCourse) newlyCreatedCourseId = saved.id;

        setThumbnailUploadProgress(0);
        const uploadedMaterial = await materialApi.upload(
          thumbnailFile,
          {
            title: `${payload.courseName} cover thumbnail`,
            description: "Course cover thumbnail",
            purpose: "OTHER",
            type: "IMAGE",
            courseId: saved.id,
          },
          setThumbnailUploadProgress,
        );
        uploadedThumbnailId = uploadedMaterial.id;
        // Persist the stable material ID instead of a five-minute presigned
        // URL. The UI requests a fresh S3 URL whenever it renders the image.
        const thumbnailPayload = {
          ...payload,
          courseThumbnail: `material:${uploadedMaterial.id}`,
        };
        saved = editingCourse
          ? onUpdateCourse
            ? await onUpdateCourse(editingCourse.id, thumbnailPayload)
            : await updateCourse(editingCourse.id, thumbnailPayload)
          : await updateCourse(saved.id, thumbnailPayload);
      } else {
        saved = editingCourse
          ? onUpdateCourse
            ? await onUpdateCourse(editingCourse.id, payload)
            : await updateCourse(editingCourse.id, payload)
          : await createCourse(payload);
        if (!editingCourse) newlyCreatedCourseId = saved.id;
      }

      if (!editingCourse) {
        onAddCourse({
          ...saved,
          gradeName: selectedGrade.name,
          grade: selectedGrade.name,
          teacherName: formSelectedTeacher
            ? `${formSelectedTeacher.firstName} ${formSelectedTeacher.lastName}`
            : saved.teacherName,
          teacherCode: formSelectedTeacher?.teacherCode,
          title: formData.courseName.trim(),
          description: formData.courseDescription.trim(),
          category: formData.subject.trim(),
          gradeId: formData.gradeId,
          maxCapacity: 60,
        });
      }
      setIsCreateOpen(false);
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      // Do not leave an empty course behind when its required thumbnail upload
      // fails during creation. Best-effort cleanup keeps the form retryable.
      if (uploadedThumbnailId) {
        await materialApi.remove(uploadedThumbnailId).catch(() => undefined);
      }
      if (newlyCreatedCourseId) {
        await deleteCourse(newlyCreatedCourseId).catch(() => undefined);
      }
      setFormErrors({
        api:
          error instanceof Error ? error.message : "Unable to save the course. Please try again.",
      });
    } finally {
      setThumbnailUploadProgress(null);
      setIsSubmitting(false);
    }
  };

  // Delete Course
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmCourse) return;

    if (
      (deleteConfirmCourse.studentCount ?? 0) > 0 ||
      (deleteConfirmCourse.enrollmentCount && deleteConfirmCourse.enrollmentCount > 0)
    ) {
      setDeleteError(
        `Cannot delete course: ${deleteConfirmCourse.studentCount} active students are currently enrolled. Reassign or unenroll students first.`,
      );
      return;
    }

    if (onDeleteCourse) {
      const res = await onDeleteCourse(deleteConfirmCourse.id);
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete course");
        return;
      }
    } else {
      const idx = courses.findIndex((c) => c.id === deleteConfirmCourse.id);
      if (idx !== -1) courses.splice(idx, 1);
    }

    setDeleteConfirmCourse(null);
    setDeleteError(null);
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const name = (c.courseName || c.title || "").toLowerCase();
      const subject = (c.subject || c.category || "").toLowerCase();
      const teacher = teacherNameForCourse(c).toLowerCase();
      const code = (c.code || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        subject.includes(query) ||
        teacher.includes(query) ||
        code.includes(query);

      const matchesGrade =
        gradeFilter === "ALL" || c.gradeId === gradeFilter || c.gradeName === gradeFilter;

      const isOnlineCourse = c.isOnline ?? c.online ?? true;
      const matchesMode =
        modeFilter === "ALL" ? true : modeFilter === "ONLINE" ? isOnlineCourse : !isOnlineCourse;

      const isPublished = c.isPublished ?? (c.status === "PUBLISHED" || c.status === "ACTIVE");
      const matchesPublish =
        publishFilter === "ALL" ? true : publishFilter === "PUBLISHED" ? isPublished : !isPublished;

      return matchesSearch && matchesGrade && matchesMode && matchesPublish;
    });
  }, [courses, searchQuery, gradeFilter, modeFilter, publishFilter]);

  // Course Relations for Detail Drawer
  const courseEnrollments = selectedCourse
    ? enrollments.filter(
        (e) =>
          e.courseId === selectedCourse.id ||
          (selectedCourse.code && e.courseCode === selectedCourse.code),
      )
    : [];

  const courseMaterials = selectedCourse
    ? materials.filter(
        (m) =>
          m.courseId === selectedCourse.id ||
          (selectedCourse.code && m.courseCode === selectedCourse.code),
      )
    : [];

  const courseCurriculum = selectedCourse
    ? curriculum.filter((c) => c.courseId === selectedCourse.id)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        description="Comprehensive academic course catalogue, faculty allocations, delivery modes, and catalog governance."
        breadcrumbs={[{ label: "Admin" }, { label: "Academic Management" }, { label: "Courses" }]}
        actions={
          <div className="flex items-center gap-2">
            {grades.length === 0 && onNavigateToGrades && (
              <button
                onClick={onNavigateToGrades}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Create Grade First</span>
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          </div>
        }
      />

      {/* Warning Notice if No Grades Exist */}
      {grades.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Grade Requirement Notice
              </p>
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                Every course in the Mentify backend must link to an existing Grade ID to inherit its
                monthly fee. Please define at least one Grade level before creating new academic
                courses.
              </p>
            </div>
          </div>
          {onNavigateToGrades && (
            <button
              onClick={onNavigateToGrades}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium shrink-0 hover:bg-amber-700"
            >
              Go to Grades
            </button>
          )}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course name, subject, faculty, or code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Grades</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Delivery Mode filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Modes</option>
            <option value="ONLINE">Online</option>
            <option value="PHYSICAL">Physical / Campus</option>
          </select>

          {/* Publish status filter */}
          <select
            value={publishFilter}
            onChange={(e) => setPublishFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          <span className="text-xs text-slate-400 tabular-nums ml-1">
            {filteredCourses.length} courses
          </span>
        </div>
      </div>

      {/* Courses Directory Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Course & Subject</th>
                <th className="py-3 px-4 font-semibold">Grade Level</th>
                <th className="py-3 px-4 font-semibold">Inherited Monthly Tuition</th>
                <th className="py-3 px-4 font-semibold">Assigned Faculty</th>
                <th className="py-3 px-4 font-semibold">Delivery Mode</th>
                <th className="py-3 px-4 font-semibold">Catalog Status</th>
                <th className="py-3 px-4 font-semibold">Enrolled</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      No courses found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try adjusting your search criteria or create a new course.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Create First Course
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const isOnlineCourse = course.isOnline ?? course.online ?? true;
                  const isPublishedCourse =
                    course.isPublished ??
                    (course.status === "PUBLISHED" || course.status === "ACTIVE");
                  const feeValue = course.gradeMonthlyFee ?? course.courseFeeMonthly ?? 5000;
                  const feeCurrency = course.gradeCurrencyCode || "LKR";

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Course Title & Subject */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          {course.courseThumbnail ? (
                            <CourseThumbnailImage
                              source={course.courseThumbnail}
                              alt={course.courseName || course.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                              {(course.courseName || course.title || "C").charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate">
                              {course.courseName || course.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                {course.subject || course.category}
                              </span>
                              {course.code && (
                                <span className="font-mono text-[10px] text-slate-400">
                                  · {course.code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{gradeNameForCourse(course)}</span>
                        </span>
                      </td>

                      {/* Inherited Monthly Fee from Grade */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex flex-col">
                          <div className="flex items-baseline gap-1 text-slate-900 dark:text-white font-bold tabular-nums">
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              {feeCurrency}
                            </span>
                            <span>
                              {feeValue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">/ mo</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Tier: {gradeNameForCourse(course)}
                          </span>
                        </div>
                      </td>

                      {/* Faculty */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={teacherNameForCourse(course)} size="sm" />
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white block">
                              {teacherNameForCourse(course)}
                            </span>
                            {course.teacherCode && (
                              <span className="font-mono text-[10px] text-slate-400 block">
                                {course.teacherCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Delivery Mode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isOnlineCourse ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            <Globe className="w-3 h-3" />
                            <span>Online Live</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <MapPin className="w-3 h-3" />
                            <span>Campus Physical</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <StatusBadge status={isPublishedCourse ? "PUBLISHED" : "DRAFT"} />
                          {course.isVisible ? (
                            <span className="block text-[10px] text-slate-400">
                              Publicly Listed
                            </span>
                          ) : (
                            <span className="block text-[10px] text-amber-500">Unlisted</span>
                          )}
                        </div>
                      </td>

                      {/* Enrolled Students */}
                      <td className="py-3.5 px-4 tabular-nums text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.studentCount ?? course.enrollmentCount ?? 0} students</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setDetailTab("overview");
                            }}
                            title="Inspect Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(course)}
                            title="Edit Course"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteConfirmCourse(course);
                            }}
                            title="Delete Course"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CREATE / EDIT COURSE MODAL — PROFESSIONAL ALIGNED FORM & UX               */}
      {/* ========================================================================= */}
      {(isCreateOpen || editingCourse) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-sm overflow-hidden">
          <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{editingCourse ? "Edit Academic Course" : "Create Academic Course"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure institutional curriculum attributes, grade assignment, and faculty
                    ownership.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCourse(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* LEFT COLUMN: Structured Form Inputs (Span 7) */}
                <div className="lg:col-span-7 space-y-6 text-xs">
                  {/* SECTION 1: COURSE IDENTITY */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                        1
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Course Identity & Classification
                      </h4>
                    </div>

                    {/* Course Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-semibold text-slate-800 dark:text-slate-200">
                          Course Title <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {formData.courseName.length} / 150
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={150}
                          value={formData.courseName}
                          onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                          placeholder="e.g. Advanced Calculus & Analytic Geometry"
                          className={`w-full px-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 ${
                            formErrors.courseName
                              ? "border-rose-400 focus:ring-rose-400/20"
                              : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                          }`}
                        />
                      </div>
                      {formErrors.courseName ? (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{formErrors.courseName}</span>
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Official institutional course title as displayed in syllabus and
                          transcripts.
                        </span>
                      )}
                    </div>

                    {/* Subject Domain maintained by the selected grade */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-semibold text-slate-800 dark:text-slate-200">
                          Subject Domain <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {formData.subject.length} / 100
                        </span>
                      </div>
                      <div className="relative">
                        <select
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData((previous) => ({ ...previous, subject: e.target.value }))
                          }
                          className={`w-full px-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 ${
                            formErrors.subject
                              ? "border-rose-400 focus:ring-rose-400/20"
                              : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                          }`}
                        >
                          <option value="">Select a subject domain...</option>
                          {subjectDomainOptions.map((subjectDomain) => (
                            <option key={subjectDomain} value={subjectDomain}>
                              {subjectDomain}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.subject && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{formErrors.subject}</span>
                        </p>
                      )}

                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Subject domains are maintained for the selected grade.
                      </span>
                    </div>

                    {/* Thumbnail URL with Inline Preview and Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-semibold text-slate-800 dark:text-slate-200">
                          Course Cover Thumbnail
                        </label>
                        {thumbnailImage && (
                          <button
                            type="button"
                            onClick={() => {
                              clearThumbnailFile();
                              setFormData({ ...formData, courseThumbnail: "" });
                            }}
                            className="text-[10px] text-rose-500 hover:underline"
                          >
                            Clear image
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Thumbnail Square Box */}
                        <label className="group relative w-24 h-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors">
                          {thumbnailImage ? (
                            <img
                              src={thumbnailImage}
                              alt="Thumbnail preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                              <span className="text-[9px] font-medium">Upload image</span>
                            </div>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/65 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            {thumbnailFile ? "Change image" : "Upload image"}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="sr-only"
                            onChange={(e) => {
                              chooseThumbnail(e.target.files?.[0]);
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>

                        {/* URL text input */}
                        <div className="flex-1">
                          <input
                            type="url"
                            value={formData.courseThumbnail || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, courseThumbnail: e.target.value })
                            }
                            placeholder="Paste an image link (optional)"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {thumbnailFile && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                          {thumbnailFile.name} · uploads securely to S3 when you save the course
                        </p>
                      )}
                      {thumbnailUploadProgress !== null && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-400 mb-1">
                            <span>Uploading cover image…</span>
                            <span>{thumbnailUploadProgress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-[width]"
                              style={{ width: `${thumbnailUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {formErrors.courseThumbnail && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{formErrors.courseThumbnail}</span>
                        </p>
                      )}

                      {/* 1-Click Curated Presets */}
                      <div className="mt-2.5">
                        <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                          Or select an educational cover photo preset:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {THUMBNAIL_PRESETS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() =>
                                (() => {
                                  clearThumbnailFile();
                                  setFormData({
                                    ...formData,
                                    courseThumbnail: p.url,
                                    subject: formData.subject || p.subject,
                                  });
                                })()
                              }
                              className={`group relative rounded-lg overflow-hidden border p-1 text-left transition-all ${
                                formData.courseThumbnail === p.url
                                  ? "border-indigo-600 ring-2 ring-indigo-500/30"
                                  : "border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                              }`}
                            >
                              <img
                                src={p.url}
                                alt={p.name}
                                className="w-full h-10 object-cover rounded"
                              />
                              <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block truncate mt-1">
                                {p.name.split(" ")[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: ACADEMIC HIERARCHY & FACULTY */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                        2
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Academic Hierarchy & Faculty Assignment
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Target Grade Level */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5 h-4">
                          <label className="font-semibold text-slate-800 dark:text-slate-200">
                            Target Grade Level <span className="text-rose-500">*</span>
                          </label>
                          {onNavigateToGrades && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreateOpen(false);
                                onNavigateToGrades();
                              }}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Manage Grades</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <select
                          value={formData.gradeId}
                          onChange={(e) => {
                            const gradeId = e.target.value;
                            const selectedGrade = grades.find((grade) => grade.id === gradeId);
                            const domains = selectedGrade?.subjectDomains || [];
                            setFormData((previous) => ({
                              ...previous,
                              gradeId,
                              subject: domains.includes(previous.subject)
                                ? previous.subject
                                : domains[0] || "",
                            }));
                            setFormErrors((previous) => ({
                              ...previous,
                              gradeId: "",
                              subject: "",
                            }));
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 ${
                            formErrors.gradeId
                              ? "border-rose-400 focus:ring-rose-400/20"
                              : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                          }`}
                        >
                          <option value="">Select target grade level...</option>
                          {grades.map((g) => (
                            <option key={g.id} value={g.id}>
                              {displayGradeName(g.name)} {!g.active ? "(Inactive)" : ""}
                            </option>
                          ))}
                        </select>
                        {formErrors.gradeId && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>{formErrors.gradeId}</span>
                          </p>
                        )}
                      </div>

                      {/* Assigned Faculty Teacher */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5 h-4">
                          <label className="font-semibold text-slate-800 dark:text-slate-200">
                            Lead Faculty Teacher <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {teachers.length} faculty available
                          </span>
                        </div>
                        <select
                          value={formData.assignedTeacherId}
                          onChange={(e) =>
                            setFormData({ ...formData, assignedTeacherId: e.target.value })
                          }
                          className={`w-full px-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 ${
                            formErrors.assignedTeacherId
                              ? "border-rose-400 focus:ring-rose-400/20"
                              : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                          }`}
                        >
                          <option value="">Select lead faculty teacher...</option>
                          {teachers.map((t) => (
                            <option key={t.id} value={teacherAssignmentId(t)}>
                              {t.teacherCode} — {t.firstName} {t.lastName} ({t.email})
                            </option>
                          ))}
                        </select>
                        {formErrors.assignedTeacherId && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>{formErrors.assignedTeacherId}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: SYLLABUS & DESCRIPTION */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                          3
                        </span>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                          Syllabus & Course Objectives
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {formData.courseDescription.length} / 2000
                      </span>
                    </div>

                    <div>
                      <textarea
                        rows={4}
                        maxLength={2000}
                        value={formData.courseDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, courseDescription: e.target.value })
                        }
                        placeholder="Comprehensive academic course description covering syllabus overview, prerequisites, textbook readings, and practical laboratory components..."
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 ${
                          formErrors.courseDescription
                            ? "border-rose-400 focus:ring-rose-400/20"
                            : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                        }`}
                      />
                      {formErrors.courseDescription && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{formErrors.courseDescription}</span>
                        </p>
                      )}

                      {/* Quick Template Fill Buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-slate-400">Insert template:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              courseDescription: `Comprehensive ${formData.subject || "curriculum"} course designed for ${formSelectedGrade?.name || "secondary"} students. Focuses on theoretical foundations, analytical problem-solving, structured modular lessons, and continuous academic assessment with weekly quizzes and final examination.`,
                            })
                          }
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] hover:bg-slate-200 transition-colors"
                        >
                          Standard Academic Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: DELIVERY & PUBLICATION GOVERNANCE */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                        4
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Delivery Mode & Catalog Governance
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Delivery Mode Segmented Switch */}
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                          Delivery Format
                        </span>
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-200/60 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isOnline: true })}
                            className={`py-1.5 px-2 rounded-md font-medium text-[11px] flex items-center justify-center gap-1 transition-all ${
                              formData.isOnline
                                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Online</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isOnline: false })}
                            className={`py-1.5 px-2 rounded-md font-medium text-[11px] flex items-center justify-center gap-1 transition-all ${
                              !formData.isOnline
                                ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Campus</span>
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {formData.isOnline
                            ? "Virtual Zoom / Meet live classes"
                            : "Physical in-person campus lectures"}
                        </span>
                      </div>

                      {/* Catalog Visibility Segmented Switch */}
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                          Catalog Visibility
                        </span>
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-200/60 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isVisible: true })}
                            className={`py-1.5 px-2 rounded-md font-medium text-[11px] flex items-center justify-center gap-1 transition-all ${
                              formData.isVisible
                                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Listed</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isVisible: false })}
                            className={`py-1.5 px-2 rounded-md font-medium text-[11px] flex items-center justify-center gap-1 transition-all ${
                              !formData.isVisible
                                ? "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden</span>
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {formData.isVisible
                            ? "Searchable in student directory"
                            : "Hidden from public student catalog"}
                        </span>
                      </div>

                      {/* Publication State Segmented Switch */}
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                          Publication State
                        </span>
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-200/60 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPublished: true })}
                            className={`py-1.5 px-2 rounded-md font-medium text-[11px] flex items-center justify-center gap-1 transition-all ${
                              formData.isPublished
                                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Live</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPublished: false })}
                            className={`py-1.5 px-2 rounded-md font-medium text-[11px] flex items-center justify-center gap-1 transition-all ${
                              !formData.isPublished
                                ? "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Draft</span>
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {formData.isPublished
                            ? "Open for enrollment & classwork"
                            : "Under preparation by instructors"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Sticky real-time student preview (Span 5) */}
                <div className="lg:col-span-5 sticky top-0 space-y-5">
                  {/* LIVE STUDENT CARD PREVIEW */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Live Student Portal View</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Realistic Preview</span>
                    </div>

                    {/* Rendered Student Card */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 overflow-hidden shadow-xs">
                      {/* Image header */}
                      <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {thumbnailImage ? (
                          <img
                            src={thumbnailImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white font-extrabold text-3xl">
                            {(formData.courseName || "M").charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Badges on card */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[10px] font-bold shadow-xs backdrop-blur-xs">
                            {formData.subject || "Subject"}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-semibold shadow-xs backdrop-blur-xs">
                            {formSelectedGrade ? formSelectedGrade.name : "Grade Level"}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          {formData.isOnline ? (
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/90 text-white text-[10px] font-medium shadow-xs backdrop-blur-xs flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              <span>Online</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-medium shadow-xs backdrop-blur-xs flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>Campus</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-3">
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                          {formData.courseName || "Course Title Preview"}
                        </h5>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {formData.courseDescription ||
                            "Course description and academic syllabus objectives will be presented to prospective students here."}
                        </p>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar
                              name={
                                formSelectedTeacher
                                  ? `${formSelectedTeacher.firstName} ${formSelectedTeacher.lastName}`
                                  : "Faculty"
                              }
                              size="sm"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                                {formSelectedTeacher
                                  ? `${formSelectedTeacher.firstName} ${formSelectedTeacher.lastName}`
                                  : "Assigned Faculty"}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {formSelectedTeacher?.teacherCode || "TCH-0000"}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Grade</span>
                            <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                              {formSelectedGrade?.name || "Not selected"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STICKY MODAL FOOTER */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  {formErrors.api ? (
                    <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formErrors.api}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Course details are ready to save.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-2 font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving course...</span>
                    ) : (
                      <span>{editingCourse ? "Save Course Changes" : "Create Course"}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG                                                */}
      {/* ========================================================================= */}
      {deleteConfirmCourse && (
        <ConfirmationDialog
          isOpen={!!deleteConfirmCourse}
          title={`Delete Course "${deleteConfirmCourse.courseName || deleteConfirmCourse.title}"?`}
          description={
            deleteError ||
            `Are you sure you want to delete this course? This invokes DELETE /api/v1/course/${deleteConfirmCourse.id}.`
          }
          consequences={[
            "The course record will be permanently purged from the Course Service registry.",
            "Cannot be deleted if active student enrollments exist.",
          ]}
          confirmText="Confirm Delete"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteConfirmCourse(null);
            setDeleteError(null);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* COURSE DETAIL SLIDE-OVER DRAWER                                           */}
      {/* ========================================================================= */}
      {selectedCourse && (
        <DetailDrawer
          isOpen={!!selectedCourse}
          title={selectedCourse.courseName || selectedCourse.title || "Course Details"}
          subtitle={`${selectedCourse.code || "CRS"} · ${selectedCourse.subject || selectedCourse.category || "Academic"}`}
          onClose={() => setSelectedCourse(null)}
          width="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Drawer Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setDetailTab("overview")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  detailTab === "overview"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDetailTab("curriculum")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  detailTab === "curriculum"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Curriculum ({courseCurriculum.length})
              </button>
              <button
                onClick={() => setDetailTab("students")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  detailTab === "students"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Students ({courseEnrollments.length})
              </button>
              <button
                onClick={() => setDetailTab("materials")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  detailTab === "materials"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Materials ({courseMaterials.length})
              </button>
            </div>

            {/* TAB: OVERVIEW */}
            {detailTab === "overview" && (
              <div className="space-y-4">
                {/* Thumbnail Header */}
                {selectedCourse.courseThumbnail && (
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <CourseThumbnailImage
                      source={selectedCourse.courseThumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Status & Pricing Card */}
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold block">
                      Inherited Monthly Tuition Standard
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                        {(
                          selectedCourse.gradeMonthlyFee ??
                          selectedCourse.courseFeeMonthly ??
                          0
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {selectedCourse.gradeCurrencyCode || "LKR"}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Configured via Grade Level ({gradeNameForCourse(selectedCourse)})
                    </span>
                  </div>

                  <div className="space-y-1 text-right">
                    <StatusBadge
                      status={
                        (selectedCourse.isPublished ??
                        (selectedCourse.status === "PUBLISHED" ||
                          selectedCourse.status === "ACTIVE"))
                          ? "PUBLISHED"
                          : "DRAFT"
                      }
                    />
                    <span className="block text-[10px] text-slate-400">
                      {selectedCourse.isVisible ? "Catalog Visible" : "Unlisted"}
                    </span>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Grade Level
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {gradeNameForCourse(selectedCourse)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Delivery Mode
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {(selectedCourse.isOnline ?? selectedCourse.online) ? "Online" : "Physical"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Enrolled Students
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                      {selectedCourse.studentCount ?? selectedCourse.enrollmentCount ?? 0}
                    </span>
                  </div>
                </div>

                {/* Assigned Faculty Section */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Assigned Lead Faculty
                  </span>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={teacherNameForCourse(selectedCourse)} size="md" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {teacherNameForCourse(selectedCourse)}
                      </span>
                      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                        {selectedCourse.teacherCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Course Description & Objectives
                  </span>
                  <p className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedCourse.courseDescription ||
                      selectedCourse.description ||
                      "No description provided."}
                  </p>
                </div>

                {/* Audit & Timestamps */}
                <div className="grid grid-cols-2 gap-3 text-slate-500">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400">Created At</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                      {selectedCourse.createdAt
                        ? new Date(selectedCourse.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400">Last Modified</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                      {selectedCourse.updatedAt
                        ? new Date(selectedCourse.updatedAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CURRICULUM */}
            {detailTab === "curriculum" && (
              <div className="space-y-3">
                {courseCurriculum.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">
                    No modules linked to this course yet.
                  </p>
                ) : (
                  courseCurriculum.map((mod) => (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {mod.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {mod.lessons.length} lessons
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mod.lessons.map((les) => (
                          <div
                            key={les.id}
                            className="py-2 flex items-center justify-between text-[11px]"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{les.title}</span>
                            <span className="text-slate-400 tabular-nums">
                              {les.durationMinutes} mins
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: ENROLLED STUDENTS */}
            {detailTab === "students" && (
              <div className="space-y-2">
                {courseEnrollments.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No students currently enrolled.</p>
                ) : (
                  courseEnrollments.map((enr) => (
                    <div
                      key={enr.id}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {enr.studentName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {enr.studentId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                          {enr.progressPercentage}%
                        </span>
                        <StatusBadge status={enr.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: MATERIALS */}
            {detailTab === "materials" && (
              <div className="space-y-2">
                {courseMaterials.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">
                    No learning materials uploaded to AWS S3 yet.
                  </p>
                ) : (
                  courseMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {mat.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{mat.s3Key}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                        {mat.fileType}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};
