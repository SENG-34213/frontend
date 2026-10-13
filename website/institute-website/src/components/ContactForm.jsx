"use client";

import { useState } from "react";
import Link from "next/link";
import { translate } from "../lib/translations";
import styles from "./ContactForm.module.css";

/*
 * Contact form UI and client-side validation.
 *
 * Email delivery will be connected in a later step.
 * Until then, submitting a valid form clearly tells the
 * visitor that no message has been sent. Entered values
 * are preserved so the visitor does not lose their work.
 */
export default function ContactForm({ lang }) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    consent: false,
  });

  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  function updateField(event) {
    const { name, value, checked, type } = event.target;

    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear a field's validation error when the visitor edits it.
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setNotice("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = translate(lang, "contactForm.required");
    }

    if (!values.email.trim()) {
      nextErrors.email = translate(lang, "contactForm.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = translate(lang, "contactForm.invalidEmail");
    }

    if (!values.subject.trim()) {
      nextErrors.subject = translate(lang, "contactForm.required");
    }

    if (!values.message.trim()) {
      nextErrors.message = translate(lang, "contactForm.required");
    }

    if (!values.consent) {
      nextErrors.consent = translate(lang, "contactForm.consentRequired");
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("");
      return;
    }

    // Do not simulate a successful submission before email delivery
    // has been configured and confirmed by the server.
    setNotice(translate(lang, "contactForm.setupNotice"));
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="contact-name">
          {translate(lang, "contactForm.name")}
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
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

      <button className={styles.submitButton} type="submit">
        {translate(lang, "contactForm.submit")}
      </button>

      {notice && (
        <p className={styles.notice} role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </form>
  );
}
