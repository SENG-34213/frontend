/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import type { LiveCourse } from "@/features/admin/types";

const sampleCourseImages = [
  {
    src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=85",
    fallback: "/course-art/math.svg",
  },
  {
    src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85",
    fallback: "/course-art/science.svg",
  },
  {
    src: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=85",
    fallback: "/course-art/literature.svg",
  },
];

function courseImage(course: LiveCourse, index: number) {
  return course.courseThumbnail || sampleCourseImages[index % sampleCourseImages.length].src;
}

export function CourseCatalog({
  courses,
  loading,
  error,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}: {
  courses: LiveCourse[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onCreate: () => void;
  onEdit?: (course: LiveCourse) => void;
  onDelete?: (course: LiveCourse) => void;
}) {
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "online" | "in-person">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "offers">("all");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "price">("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<LiveCourse | null>(null);
  const pageSize = 6;
  const gradeGroups = useMemo(
    () => Array.from(new Set(courses.map((course) => course.gradeId || "unassigned"))),
    [courses],
  );
  const featuredCourses = courses.filter((course) => Number(course.discountOfferPercent || 0) > 0);
  const publishedCount = courses.filter(
    (course) => course.isPublished || course.courseStatus === "PUBLISHED",
  ).length;
  const onlineCount = courses.filter((course) => course.online).length;
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses
      .filter((course) => {
        const matchesGrade =
          selectedGrade === "all" || (course.gradeId || "unassigned") === selectedGrade;
        const matchesDelivery =
          deliveryFilter === "all" ||
          (deliveryFilter === "online" ? course.online : !course.online);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "published"
            ? course.isPublished || course.courseStatus === "PUBLISHED"
            : Number(course.discountOfferPercent || 0) > 0);
        const matchesSearch =
          !query ||
          [course.courseName, course.subject, course.courseDescription]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(query));
        return matchesGrade && matchesDelivery && matchesStatus && matchesSearch;
      })
      .sort((a, b) =>
        sortBy === "name"
          ? a.courseName.localeCompare(b.courseName)
          : sortBy === "price"
            ? Number(a.courseFeeMonthly || 0) - Number(b.courseFeeMonthly || 0)
            : String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
      );
  }, [courses, deliveryFilter, search, selectedGrade, sortBy, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const visibleCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);
  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <section
      className="course-catalog professional-course-catalog"
      aria-labelledby="course-catalog-title"
    >
      <div className="course-catalog-heading">
        <div>
          <span className="catalog-kicker">
            LEARNING OPS <b>•</b> CURRICULUM BUILDER
          </span>
          <h2 id="course-catalog-title">
            Course Management &amp;
            <br />
            Curriculum Builder
          </h2>
          <p>
            Design, publish, and optimize your academy curriculum across grades, subjects, teachers,
            and delivery modes.
          </p>
        </div>
        <div className="course-heading-actions">
          <button type="button" className="secondary-button">
            ⇧ Import syllabus
          </button>
          <button type="button" className="primary-button" onClick={onCreate}>
            <Icon name="plus" size={15} /> Create course
          </button>
        </div>
      </div>
      {loading ? (
        <div className="catalog-state">
          <span className="spinner spinner-dark" />
          <strong>Loading courses…</strong>
          <p>Fetching the live course catalog.</p>
        </div>
      ) : error ? (
        <div className="catalog-state catalog-error">
          <span className="empty-roster-icon">
            <Icon name="alert" size={20} />
          </span>
          <strong>Couldn’t load courses</strong>
          <p>{error}</p>
          <button type="button" className="secondary-button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="course-insight-grid">
            <div className="course-insight-card indigo">
              <i>
                <Icon name="book" size={18} />
              </i>
              <span>Total courses</span>
              <strong>{courses.length}</strong>
              <small>Live catalog records</small>
            </div>
            <div className="course-insight-card green">
              <i>
                <Icon name="check" size={18} />
              </i>
              <span>Published</span>
              <strong>{publishedCount}</strong>
              <small>Visible to learners</small>
            </div>
            <div className="course-insight-card blue">
              <i>
                <Icon name="sparkles" size={18} />
              </i>
              <span>Online learning</span>
              <strong>{onlineCount}</strong>
              <small>Remote-ready courses</small>
            </div>
            <div className="course-insight-card amber">
              <i>
                <Icon name="arrow" size={18} />
              </i>
              <span>Special offers</span>
              <strong>{featuredCourses.length}</strong>
              <small>Discounted courses</small>
            </div>
          </div>
          {featuredCourses.length > 0 && (
            <div className="featured-course-strip">
              <div className="featured-course-copy">
                <span className="catalog-kicker">FEATURED THIS TERM</span>
                <h3>Discounted learning picks</h3>
                <p>Promote courses with an active offer to your academy community.</p>
                <span className="featured-course-note">
                  <Icon name="sparkles" size={14} /> Curated for your learners
                </span>
              </div>
              <div className="featured-course-pills">
                {featuredCourses.slice(0, 3).map((course, index) => (
                  <button type="button" key={course.id} onClick={() => setSelectedCourse(course)}>
                    <img
                      src={courseImage(course, index)}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.src =
                          sampleCourseImages[index % sampleCourseImages.length].fallback;
                      }}
                    />
                    <span>
                      <strong>{course.courseName}</strong>
                      <small>
                        {course.discountOfferPercent}% off · {course.subject || "General"}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="course-catalog-toolbar professional-course-toolbar">
            <div className="course-grade-tabs">
              <button
                type="button"
                className={selectedGrade === "all" ? "active" : ""}
                onClick={() => updateFilter(() => setSelectedGrade("all"))}
              >
                All <span>{courses.length}</span>
              </button>
              {gradeGroups.map((gradeId) => (
                <button
                  type="button"
                  className={selectedGrade === gradeId ? "active" : ""}
                  key={gradeId}
                  onClick={() => updateFilter(() => setSelectedGrade(gradeId))}
                >
                  {gradeId === "unassigned" ? "No grade" : `Grade · ${gradeId.slice(0, 8)}`}{" "}
                  <span>
                    {
                      courses.filter((course) => (course.gradeId || "unassigned") === gradeId)
                        .length
                    }
                  </span>
                </button>
              ))}
            </div>
            <div className="course-filter-row">
              <select
                value={deliveryFilter}
                onChange={(event) =>
                  updateFilter(() => setDeliveryFilter(event.target.value as typeof deliveryFilter))
                }
                aria-label="Filter by delivery"
              >
                <option value="all">All delivery</option>
                <option value="online">Online</option>
                <option value="in-person">In person</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) =>
                  updateFilter(() => setStatusFilter(event.target.value as typeof statusFilter))
                }
                aria-label="Filter by course status"
              >
                <option value="all">All courses</option>
                <option value="published">Published</option>
                <option value="offers">Discount offers</option>
              </select>
              <select
                value={sortBy}
                onChange={(event) =>
                  updateFilter(() => setSortBy(event.target.value as typeof sortBy))
                }
                aria-label="Sort courses"
              >
                <option value="newest">Newest first</option>
                <option value="name">Name A–Z</option>
                <option value="price">Price low–high</option>
              </select>
              <input
                className="course-search"
                value={search}
                onChange={(event) => updateFilter(() => setSearch(event.target.value))}
                placeholder="Search courses…"
                aria-label="Search courses"
              />
            </div>
          </div>
          {visibleCourses.length ? (
            <>
              <div className="course-results-heading">
                <strong>
                  {filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"}
                </strong>
                <span>
                  Page {page} of {pageCount}
                </span>
              </div>
              <div className="live-course-grid professional-course-grid">
                {visibleCourses.map((course, index) => (
                  <article
                    className="live-course-card professional-course-card"
                    key={course.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${course.courseName}`}
                    onClick={() => setSelectedCourse(course)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedCourse(course);
                      }
                    }}
                  >
                    <div className="course-image-wrap">
                      <img
                        src={courseImage(course, index)}
                        alt=""
                        className="live-course-thumbnail"
                        onError={(event) => {
                          event.currentTarget.src =
                            sampleCourseImages[index % sampleCourseImages.length].fallback;
                        }}
                      />
                      <span className="course-image-badge">
                        {course.discountOfferPercent
                          ? `${course.discountOfferPercent}% OFF`
                          : course.online
                            ? "ONLINE"
                            : "ACADEMY"}
                      </span>
                    </div>
                    <div className="live-course-card-body">
                      <div className="live-course-card-top">
                        <span className="live-course-grade">
                          {course.gradeId
                            ? `Grade · ${course.gradeId.slice(0, 8)}`
                            : "Grade not assigned"}
                        </span>
                        <span
                          className={`live-course-status ${(course.courseStatus || "").toLowerCase()}`}
                        >
                          {course.courseStatus || "DRAFT"}
                        </span>
                      </div>
                      <h3>{course.courseName}</h3>
                      <p>{course.courseDescription || "No course description provided."}</p>
                      <div className="course-detail-chips">
                        <span>{course.subject || "General"}</span>
                        <span>{course.online ? "Online" : "In person"}</span>
                        <span>{course.gradeId ? "Grade assigned" : "Grade pending"}</span>
                      </div>
                      <div className="live-course-meta">
                        <strong>
                          {course.courseFeeMonthly != null
                            ? `LKR ${Number(course.courseFeeMonthly).toLocaleString()}`
                            : "Fee not set"}
                        </strong>
                        <span>grade fee / month</span>
                      </div>
                      <div className="live-course-footer">
                        <span>
                          <Icon name="users" size={13} /> {course.numberOfStudents || 0} students
                        </span>
                        <small>{course.visible === false ? "Hidden" : "Visible"}</small>
                      </div>
                      <button
                        type="button"
                        className="course-view-details"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedCourse(course);
                        }}
                      >
                        View course details <Icon name="arrow" size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="course-pagination">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>
                <div>
                  {Array.from({ length: pageCount }, (_, index) => index + 1)
                    .slice(Math.max(0, page - 3), page + 2)
                    .map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={page === value ? "active" : ""}
                        onClick={() => setPage(value)}
                      >
                        {value}
                      </button>
                    ))}
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={page === pageCount}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="catalog-state">
              <span className="empty-roster-icon">
                <Icon name="book" size={20} />
              </span>
              <strong>{courses.length ? "No matching courses" : "No courses yet"}</strong>
              <p>
                {courses.length
                  ? "Try another filter or search term."
                  : "Create the first course to start building your academy catalog."}
              </p>
              {!courses.length && (
                <button type="button" className="primary-button" onClick={onCreate}>
                  <Icon name="plus" size={15} /> Create course
                </button>
              )}
            </div>
          )}
        </>
      )}
      {selectedCourse && (
        <div
          className="modal-backdrop detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedCourse(null);
          }}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-detail-title"
          >
            <div className="detail-modal-heading">
              <div>
                <span className="catalog-kicker">COURSE DETAILS</span>
                <h2 id="course-detail-title">{selectedCourse.courseName}</h2>
                <p>
                  {selectedCourse.subject || "General subject"} ·{" "}
                  {selectedCourse.courseStatus || "DRAFT"}
                </p>
              </div>
              <button
                type="button"
                className="notice-dismiss"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close course details"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="detail-modal-body">
              <img
                className="course-detail-image"
                src={courseImage(selectedCourse, 0)}
                alt=""
                onError={(event) => {
                  event.currentTarget.src = sampleCourseImages[0].fallback;
                }}
              />
              <p className="detail-description">
                {selectedCourse.courseDescription || "No course description provided."}
              </p>
              <div className="detail-stat-grid">
                <div>
                  <small>Grade group</small>
                  <strong>{selectedCourse.gradeId || "Not assigned"}</strong>
                </div>
                <div>
                  <small>Grade monthly fee</small>
                  <strong>
                    {selectedCourse.courseFeeMonthly != null
                      ? `LKR ${Number(selectedCourse.courseFeeMonthly).toLocaleString()}`
                      : "Not set"}
                  </strong>
                </div>
                <div>
                  <small>Students</small>
                  <strong>{selectedCourse.numberOfStudents || 0}</strong>
                </div>
                <div>
                  <small>Delivery</small>
                  <strong>{selectedCourse.online ? "Online" : "In person"}</strong>
                </div>
                <div>
                  <small>Visibility</small>
                  <strong>{selectedCourse.visible === false ? "Hidden" : "Visible"}</strong>
                </div>
                <div>
                  <small>Published</small>
                  <strong>{selectedCourse.isPublished ? "Yes" : "No"}</strong>
                </div>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>Course ID</dt>
                  <dd>{selectedCourse.id}</dd>
                </div>
                <div>
                  <dt>Assigned teacher ID</dt>
                  <dd>{selectedCourse.assignedTeacherId || "Not assigned"}</dd>
                </div>
                <div>
                  <dt>Discount offer</dt>
                  <dd>
                    {selectedCourse.discountOfferPercent
                      ? `${selectedCourse.discountOfferPercent}% off`
                      : "No active offer"}
                  </dd>
                </div>
              </dl>
              <div className="detail-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onEdit?.(selectedCourse)}
                  disabled={!onEdit}
                >
                  <Icon name="settings" size={15} /> Edit course
                </button>
                <button
                  type="button"
                  className="secondary-button danger-action"
                  onClick={() => onDelete?.(selectedCourse)}
                  disabled={!onDelete}
                >
                  <Icon name="close" size={15} /> Delete course
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
