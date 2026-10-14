"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  classes,
  classGrades,
  classSubjects,
} from "../../../data/classes";
import { translate } from "../../../lib/translations";
import styles from "./ServicesPage.module.css";

export default function ServicesPage() {
  const params = useParams();
  const lang = params.lang || "en";

  const t = (key) => translate(lang, `classDirectory.${key}`);

  const pageTitle = translate(lang, "pages.services.title");
  const pageDescription = translate(lang, "pages.services.description");

  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");

  // Translate subject names while retaining the existing class data.
  function getSubjectLabel(subject) {
    const subjectKeys = {
      English: "english",
      Mathematics: "mathematics",
      Science: "science",
      History: "history",
      Tamil: "tamil",
      Sinhala: "sinhala",
    };

    const subjectKey = subjectKeys[subject];

    return subjectKey
      ? t(`subjects.${subjectKey}`)
      : subject;
  }

  // Translate grades without changing the values used by the filters.
  function getGradeLabel(gradeValue) {
    if (gradeValue === "advanced-level") {
      return t("grades.advancedLevel");
    }

    const match = /^grade-(\d+)$/.exec(gradeValue || "");

    if (match) {
      return `${t("grades.grade")} ${match[1]}`;
    }

    return t("grades.toBeConfirmed");
  }

  // Localize the example class descriptions by class ID.
  function getClassDescription(classItem) {
    const descriptionKeys = {
      "grade-6-mathematics": "descriptions.grade6Mathematics",
      "grade-8-science": "descriptions.grade8Science",
      "advanced-level-english-online":
        "descriptions.advancedLevelEnglishOnline",
    };

    const descriptionKey = descriptionKeys[classItem.id];

    return descriptionKey
      ? t(descriptionKey)
      : classItem.description;
  }

  // Translate placeholder values while preserving real class information.
  function getTeacherLabel(classItem) {
    return classItem.teacher === "Teacher to be confirmed"
      ? t("placeholders.teacher")
      : classItem.teacher;
  }

  function getDaysLabel(classItem) {
    return classItem.days === "Days to be confirmed"
      ? t("placeholders.days")
      : classItem.days;
  }

  function getTimeLabel(classItem) {
    return classItem.time === "Time to be confirmed"
      ? t("placeholders.time")
      : classItem.time;
  }

  function getLocationLabel(classItem) {
    if (classItem.mode === "online") {
      return classItem.location ===
        "Online — platform to be confirmed"
        ? t("placeholders.onlineLocation")
        : classItem.location;
    }

    return classItem.location === "Institute classroom"
      ? t("placeholders.location")
      : classItem.location;
  }

  function getFeeLabel(classItem) {
    return classItem.fee === "Contact for fees"
      ? t("placeholders.fee")
      : classItem.fee;
  }

  function getAvailabilityLabel(classItem) {
    if (
      classItem.availability ===
      "Occasional classes — schedule to be confirmed"
    ) {
      return t("placeholders.onlineAvailability");
    }

    return classItem.availability === "To be confirmed"
      ? t("placeholders.availability")
      : classItem.availability;
  }

  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const matchesGrade =
        selectedGrade === "all" ||
        classItem.grade === selectedGrade;

      const matchesSubject =
        selectedSubject === "all" ||
        classItem.subject === selectedSubject;

      const matchesMode =
        selectedMode === "all" ||
        classItem.mode === selectedMode;

      return matchesGrade && matchesSubject && matchesMode;
    });
  }, [selectedGrade, selectedSubject, selectedMode]);

  // Keep on-site classes ahead of online classes.
  const sortedClasses = useMemo(() => {
    return [...filteredClasses].sort((a, b) => {
      if (a.mode === b.mode) return 0;
      return a.mode === "onsite" ? -1 : 1;
    });
  }, [filteredClasses]);

  function resetFilters() {
    setSelectedGrade("all");
    setSelectedSubject("all");
    setSelectedMode("all");
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            {t("eyebrow")}
          </p>

          <h1>{pageTitle}</h1>

          <p>{pageDescription}</p>

          <div className={styles.heroTags}>
            <span>{t("heroTags.onsite")}</span>
            <span>{t("heroTags.online")}</span>
            <span>{t("heroTags.subjects")}</span>
          </div>
        </div>
      </section>

      <section className={styles.directory}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionEyebrow}>
            {t("sectionEyebrow")}
          </p>

          <h2>{t("heading")}</h2>

          <p>{t("intro")}</p>
        </div>

        <div className={styles.filterPanel}>
          <div className={styles.filterField}>
            <label htmlFor="grade-filter">
              {t("filters.grade")}
            </label>

            <select
              id="grade-filter"
              value={selectedGrade}
              onChange={(event) =>
                setSelectedGrade(event.target.value)
              }
            >
              <option value="all">
                {t("filters.allGrades")}
              </option>

              {classGrades.map((grade) => (
                <option
                  key={grade.value}
                  value={grade.value}
                >
                  {getGradeLabel(grade.value)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="subject-filter">
              {t("filters.subject")}
            </label>

            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(event) =>
                setSelectedSubject(event.target.value)
              }
            >
              <option value="all">
                {t("filters.allSubjects")}
              </option>

              {classSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {getSubjectLabel(subject)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="mode-filter">
              {t("filters.format")}
            </label>

            <select
              id="mode-filter"
              value={selectedMode}
              onChange={(event) =>
                setSelectedMode(event.target.value)
              }
            >
              <option value="all">
                {t("filters.allFormats")}
              </option>

              <option value="onsite">
                {t("filters.onsite")}
              </option>

              <option value="online">
                {t("filters.online")}
              </option>
            </select>
          </div>

          <button
            type="button"
            className={styles.resetButton}
            onClick={resetFilters}
          >
            {t("filters.reset")}
          </button>
        </div>

        <div className={styles.resultsHeading}>
          <p aria-live="polite">
            <strong>{sortedClasses.length}</strong>{" "}
            {sortedClasses.length === 1
              ? t("results.one")
              : t("results.many")}
          </p>

          <span>{t("results.onsiteFirst")}</span>
        </div>

        {sortedClasses.length > 0 ? (
          <div className={styles.classGrid}>
            {sortedClasses.map((classItem) => {
              const localizedSubject = getSubjectLabel(
                classItem.subject
              );

              const localizedGrade = getGradeLabel(
                classItem.grade
              );

              return (
                <article
                  className={styles.classCard}
                  key={classItem.id}
                >
                  <div className={styles.cardTop}>
                    <span
                      className={
                        classItem.mode === "onsite"
                          ? styles.onsiteBadge
                          : styles.onlineBadge
                      }
                    >
                      {classItem.mode === "onsite"
                        ? t("badges.onsite")
                        : t("badges.online")}
                    </span>

                    <span className={styles.gradeBadge}>
                      {localizedGrade}
                    </span>
                  </div>

                  <div className={styles.cardTitle}>
                    <p className={styles.subjectLabel}>
                      {localizedSubject}
                    </p>

                    <h3>
                      {localizedSubject}{" "}
                      {t("classTitleSuffix")}
                    </h3>

                    <p className={styles.description}>
                      {getClassDescription(classItem)}
                    </p>
                  </div>

                  <div className={styles.classDetails}>
                    <div className={styles.detailRow}>
                      <span
                        className={styles.detailIcon}
                        aria-hidden="true"
                      >
                        ◷
                      </span>

                      <div>
                        <span className={styles.detailLabel}>
                          {t("details.schedule")}
                        </span>

                        <p>
                          {getDaysLabel(classItem)} ·{" "}
                          {getTimeLabel(classItem)}
                        </p>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <span
                        className={styles.detailIcon}
                        aria-hidden="true"
                      >
                        ♙
                      </span>

                      <div>
                        <span className={styles.detailLabel}>
                          {t("details.teacher")}
                        </span>

                        <p>{getTeacherLabel(classItem)}</p>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <span
                        className={styles.detailIcon}
                        aria-hidden="true"
                      >
                        ⌖
                      </span>

                      <div>
                        <span className={styles.detailLabel}>
                          {classItem.mode === "onsite"
                            ? t("details.location")
                            : t("details.format")}
                        </span>

                        <p>{getLocationLabel(classItem)}</p>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <span
                        className={styles.detailIcon}
                        aria-hidden="true"
                      >
                        ◈
                      </span>

                      <div>
                        <span className={styles.detailLabel}>
                          {t("details.fee")}
                        </span>

                        <p>{getFeeLabel(classItem)}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <p>{getAvailabilityLabel(classItem)}</p>

                    <Link
                      href={`/${lang}/contact?class=${encodeURIComponent(
                        `${localizedGrade} - ${localizedSubject}`
                      )}`}
                      className={styles.enquireButton}
                    >
                      {t("enquire")}{" "}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>{t("empty.heading")}</h3>

            <p>{t("empty.description")}</p>

            <button
              type="button"
              className={styles.resetButton}
              onClick={resetFilters}
            >
              {t("empty.reset")}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}