"use client";

import { useState } from "react";
import Link from "next/link";
import { translate } from "../lib/translations";
import styles from "./ContactForm.module.css";

export default function ContactForm({ lang }) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    consent: false,
    website: "",
  });

  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  function updateField(event) {
    const { name, value, checked, type } = event.target;

    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    const nextErrors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const subject = values.subject.trim();
    const message = values.message.trim();

    if (!name) {
      nextErrors.name = translate(lang, "contactForm.required");
    } else if (name.length > 100) {
      nextErrors.name = "Name must be 100 characters or fewer.";
    }

    if (!email) {
      nextErrors.email = translate(lang, "contactForm.required");
    } else if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      nextErrors.email = translate(lang, "contactForm.invalidEmail");
    }

    if (!subject) {
      nextErrors.subject = translate(lang, "contactForm.required");
    } else if (subject.length > 150) {
      nextErrors.subject = "Subject must be 150 characters or fewer.";
    }

    if (!message) {
      nextErrors.message = translate(lang, "contactForm.required");
    } else if (message.length > 5000) {
      nextErrors.message = "Message must be 5000 characters or fewer.";
    }

    if (!values.consent) {
      nextErrors.consent = translate(lang, "contactForm.consentRequired");
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("");
      return;
    }

    setIsSubmitting(true);
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
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
          throw new Error("Too many submissions. Please try again later.");
        }

        throw new Error(
          "We could not send your message. Please try again later.",
        );
      }

      setSubmitSuccess(true);
      setNotice(translate(lang, "contactForm.success"));

      setValues({
        name: "",
        email: "",
        subject: "",
        message: "",
        consent: false,
        website: "",
      });
      setErrors({});
    } catch (error) {
      setSubmitSuccess(false);
      setNotice(
        error instanceof Error
          ? error.message
          : translate(lang, "contactForm.failure"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Honeypot field to help detect automated submissions. */}
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
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          value={values.website}
          onChange={updateField}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-name">
          {translate(lang, "contactForm.name")}
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          maxLength={100}
          value={values.name}
          onChange={updateField}
          placeholder={translate(lang, "contactForm.namePlaceholder")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name && (
          <p className={styles.fieldError} id="contact-name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-email">
          {translate(lang, "contactForm.email")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          value={values.email}
          onChange={updateField}
          placeholder={translate(lang, "contactForm.emailPlaceholder")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email && (
          <p className={styles.fieldError} id="contact-email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-subject">
          {translate(lang, "contactForm.subject")}
        </label>
        <input
          id="contact-subject"
          name="subject"
          maxLength={150}
          value={values.subject}
          onChange={updateField}
          placeholder={translate(lang, "contactForm.subjectPlaceholder")}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={
            errors.subject ? "contact-subject-error" : undefined
          }
        />
        {errors.subject && (
          <p className={styles.fieldError} id="contact-subject-error">
            {errors.subject}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message">
          {translate(lang, "contactForm.message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          maxLength={5000}
          value={values.message}
          onChange={updateField}
          placeholder={translate(lang, "contactForm.messagePlaceholder")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
        />
        {errors.message && (
          <p className={styles.fieldError} id="contact-message-error">
            {errors.message}
          </p>
        )}
      </div>

      <div className={styles.consentGroup}>
        <label className={styles.consentLabel}>
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={updateField}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={
              errors.consent ? "contact-consent-error" : undefined
            }
          />
          <span>
            {translate(lang, "contactForm.consent")}{" "}
            <Link href={`/${lang}/privacy-policy`}>
              {translate(lang, "contactForm.privacyLink")}
            </Link>
          </span>
        </label>
        {errors.consent && (
          <p className={styles.fieldError} id="contact-consent-error">
            {errors.consent}
          </p>
        )}
      </div>

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? translate(lang, "contactForm.sending")
          : translate(lang, "contactForm.submit")}
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
