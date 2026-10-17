"use client";

import { useState } from "react";
import Link from "next/link";
import { translate } from "../lib/translations";
import styles from "./PreRegisterForm.module.css";

const districts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const juniorSubjects = ["Maths", "Science", "English", "Sinhala", "Tamil"];

const seniorSubjects = [...juniorSubjects, "Business Studies", "History"];

const alSubjects = [
  "Combined Maths",
  "Biology",
  "Chemistry",
  "Physics",
  "Business Studies",
  "Economics",
];

const initialValues = {
  name: "",
  email: "",
  phone: "",
  role: "",
  district: "",
  city: "",
  classFormat: "",
  grade: "",
  subjects: [],
  contactMethod: "",
  consent: false,
  website: "",
};

export default function PreRegisterForm({ lang }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const gradeNumber = Number(values.grade);

  const availableSubjects =
    values.grade === "al"
      ? alSubjects
      : gradeNumber >= 10
        ? seniorSubjects
        : juniorSubjects;

  function updateField(event) {
    const { name, value, checked, type } = event.target;

    setValues((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "grade") {
        next.subjects = [];
      }

      return next;
    });

    setErrors((current) => ({
      ...current,
      [name]: "",
      ...(name === "grade" ? { subjects: "" } : {}),
    }));

    setNotice("");
  }

  function toggleSubject(subject) {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject],
    }));

    setErrors((current) => ({ ...current, subjects: "" }));
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const required = translate(lang, "preRegisterForm.required");
    const nextErrors = {};

    const name = values.name.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const city = values.city.trim();

    if (!name) nextErrors.name = required;
    else if (name.length > 100) {
      nextErrors.name = "Name must be 100 characters or fewer.";
    }

    if (!email) nextErrors.email = required;
    else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = translate(lang, "preRegisterForm.invalidEmail");
    }

    if (!phone) nextErrors.phone = required;
    else if (!/^[+()\d\s.-]{7,25}$/.test(phone)) {
      nextErrors.phone = translate(lang, "preRegisterForm.invalidPhone");
    }

    for (const field of [
      "role",
      "district",
      "classFormat",
      "grade",
      "contactMethod",
    ]) {
      if (!values[field]) nextErrors[field] = required;
    }

    if (city.length > 100) {
      nextErrors.city = "City or town must be 100 characters or fewer.";
    }

    if (
      values.subjects.length === 0 ||
      values.subjects.some((subject) => !availableSubjects.includes(subject))
    ) {
      nextErrors.subjects = required;
    }

    if (!values.consent) {
      nextErrors.consent = translate(lang, "preRegisterForm.consentRequired");
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("");
      return;
    }

    setIsSubmitting(true);
    setNotice("");
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/preregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          role: values.role,
          district: values.district,
          city,
          classFormat: values.classFormat,
          grade: values.grade,
          subjects: values.subjects,
          contactMethod: values.contactMethod,
          consent: values.consent,
          website: values.website,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(
            result.message || "Please check your details and try again.",
          );
        }

        if (response.status === 429) {
          throw new Error(
            "Too many registration attempts. Please try again later.",
          );
        }

        throw new Error(
          "We could not submit your registration. Please try again later.",
        );
      }

      setSubmitSuccess(true);
      setNotice(translate(lang, "preRegisterForm.success"));
      setValues({ ...initialValues });
      setErrors({});
    } catch (error) {
      setSubmitSuccess(false);
      setNotice(
        error instanceof Error
          ? error.message
          : translate(lang, "preRegisterForm.failure"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldError(field) {
    return errors[field] ? (
      <p className={styles.fieldError} id={`preregister-${field}-error`}>
        {errors[field]}
      </p>
    ) : null;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        <label htmlFor="preregister-website">Leave this field empty</label>
        <input
          id="preregister-website"
          name="website"
          value={values.website}
          onChange={updateField}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p>{translate(lang, "preRegisterForm.intro")}</p>

      <div className={styles.field}>
        <label htmlFor="preregister-name">
          {translate(lang, "preRegisterForm.name")}
        </label>
        <input
          id="preregister-name"
          name="name"
          autoComplete="name"
          maxLength={100}
          value={values.name}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.name)}
        />
        {fieldError("name")}
      </div>

      <div className={styles.field}>
        <label htmlFor="preregister-email">
          {translate(lang, "preRegisterForm.email")}
        </label>
        <input
          id="preregister-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          value={values.email}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.email)}
        />
        {fieldError("email")}
      </div>

      <div className={styles.field}>
        <label htmlFor="preregister-phone">
          {translate(lang, "preRegisterForm.phone")}
        </label>
        <input
          id="preregister-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={25}
          value={values.phone}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.phone)}
        />
        {fieldError("phone")}
      </div>

      <div className={styles.field}>
        <label htmlFor="preregister-role">
          {translate(lang, "preRegisterForm.role")}
        </label>
        <select
          id="preregister-role"
          name="role"
          value={values.role}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.role)}
        >
          <option value="">
            {translate(lang, "preRegisterForm.selectOption")}
          </option>
          <option value="student">
            {translate(lang, "preRegisterForm.roles.student")}
          </option>
          <option value="parent">
            {translate(lang, "preRegisterForm.roles.parent")}
          </option>
        </select>
        {fieldError("role")}
      </div>

      <div className={styles.field}>
        <label htmlFor="preregister-district">
          {translate(lang, "preRegisterForm.district")}
        </label>
        <select
          id="preregister-district"
          name="district"
          value={values.district}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.district)}
        >
          <option value="">
            {translate(lang, "preRegisterForm.selectOption")}
          </option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        {fieldError("district")}
      </div>

      <div className={styles.field}>
        <label htmlFor="preregister-city">
          {translate(lang, "preRegisterForm.city")}
        </label>
        <input
          id="preregister-city"
          name="city"
          maxLength={100}
          value={values.city}
          onChange={updateField}
          aria-invalid={Boolean(errors.city)}
        />
        {fieldError("city")}
      </div>

      <div className={styles.field}>
        <label htmlFor="preregister-classFormat">
          {translate(lang, "preRegisterForm.classFormat")}
        </label>
        <select
          id="preregister-classFormat"
          name="classFormat"
          value={values.classFormat}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.classFormat)}
        >
          <option value="">
            {translate(lang, "preRegisterForm.selectOption")}
          </option>
          <option value="online">
            {translate(lang, "preRegisterForm.formats.online")}
          </option>
          <option value="onsite">
            {translate(lang, "preRegisterForm.formats.onsite")}
          </option>
          <option value="either">
            {translate(lang, "preRegisterForm.formats.either")}
          </option>
        </select>
        {fieldError("classFormat")}
      </div>

      <div className={styles.field}>
        <label htmlFor="preregister-grade">
          {translate(lang, "preRegisterForm.grade")}
        </label>
        <select
          id="preregister-grade"
          name="grade"
          value={values.grade}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.grade)}
        >
          <option value="">
            {translate(lang, "preRegisterForm.selectOption")}
          </option>
          {Array.from({ length: 11 }, (_, i) => String(i + 1)).map((grade) => (
            <option key={grade} value={grade}>
              Grade {grade}
            </option>
          ))}
          <option value="al">{translate(lang, "preRegisterForm.al")}</option>
        </select>
        {fieldError("grade")}
      </div>

      <fieldset className={`${styles.field} ${styles.subjectField}`}>
        <legend>{translate(lang, "preRegisterForm.subjects")}</legend>

        {!values.grade ? (
          <p>{translate(lang, "preRegisterForm.selectGradeFirst")}</p>
        ) : (
          <div className={styles.subjectGrid}>
            {availableSubjects.map((subject) => (
              <label key={subject} className={styles.subjectOption}>
                <input
                  type="checkbox"
                  checked={values.subjects.includes(subject)}
                  onChange={() => toggleSubject(subject)}
                />
                <span>{subject}</span>
              </label>
            ))}
          </div>
        )}

        {fieldError("subjects")}
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="preregister-contactMethod">
          {translate(lang, "preRegisterForm.contactMethod")}
        </label>
        <select
          id="preregister-contactMethod"
          name="contactMethod"
          value={values.contactMethod}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.contactMethod)}
        >
          <option value="">
            {translate(lang, "preRegisterForm.selectOption")}
          </option>
          <option value="whatsapp">
            {translate(lang, "preRegisterForm.methods.whatsapp")}
          </option>
          <option value="phone">
            {translate(lang, "preRegisterForm.methods.phone")}
          </option>
          <option value="email">
            {translate(lang, "preRegisterForm.methods.email")}
          </option>
        </select>
        {fieldError("contactMethod")}
      </div>

      <div className={styles.consentGroup}>
        <label className={styles.consentLabel}>
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={updateField}
            aria-invalid={Boolean(errors.consent)}
          />
          <span>
            {translate(lang, "preRegisterForm.consent")}{" "}
            <Link href={`/${lang}/privacy-policy`}>
              {translate(lang, "preRegisterForm.privacyLink")}
            </Link>
          </span>
        </label>
        {fieldError("consent")}
      </div>

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? translate(lang, "preRegisterForm.sending")
          : translate(lang, "preRegisterForm.submit")}
      </button>

      {notice && (
        <p
          className={styles.notice}
          role="status"
          aria-live="polite"
          data-success={submitSuccess}
        >
          {notice}
        </p>
      )}
    </form>
  );
}
