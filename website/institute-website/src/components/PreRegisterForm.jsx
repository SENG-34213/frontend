
"use client";

import { useState } from "react";
import Link from "next/link";
import { translate } from "../lib/translations";
import styles from "./PreRegisterForm.module.css";

/*
 * Pre-registration form with client-side validation.
 *
 * Email delivery will be connected in a later step.
 * Until the server confirms successful delivery, the form
 * must not tell applicants that their registration succeeded.
 * Form values remain available if delivery is not configured.
 */
export default function PreRegisterForm({ lang }) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    programme: "",
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
      nextErrors.name = translate(lang, "preRegisterForm.required");
    }

    if (!values.email.trim()) {
      nextErrors.email = translate(lang, "preRegisterForm.required");
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
    ) {
      nextErrors.email = translate(lang, "preRegisterForm.invalidEmail");
    }

    if (!values.phone.trim()) {
      nextErrors.phone = translate(lang, "preRegisterForm.required");
    } else if (!/^[+()\d\s.-]{7,25}$/.test(values.phone.trim())) {
      nextErrors.phone = translate(lang, "preRegisterForm.invalidPhone");
    }

    if (!values.programme) {
      nextErrors.programme = translate(
        lang,
        "preRegisterForm.required"
      );
    }

    if (!values.consent) {
      nextErrors.consent = translate(
        lang,
        "preRegisterForm.consentRequired"
      );
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("");
      return;
    }

    // Do not simulate successful submission before email delivery
    // is configured and confirmed by the server.
    setNotice(translate(lang, "preRegisterForm.setupNotice"));
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.field}>
        <label htmlFor="preregister-name">
          {translate(lang, "preRegisterForm.name")}
        </label>
        <input
          id="preregister-name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={
            errors.name ? "preregister-name-error" : undefined
          }
        />
        {errors.name && (
          <p className={styles.fieldError} id="preregister-name-error">
            {errors.name}
          </p>
        )}
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
          value={values.email}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email ? "preregister-email-error" : undefined
          }
        />
        {errors.email && (
          <p className={styles.fieldError} id="preregister-email-error">
            {errors.email}
          </p>
        )}
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
          value={values.phone}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={
            errors.phone ? "preregister-phone-error" : undefined
          }
        />
        {errors.phone && (
          <p className={styles.fieldError} id="preregister-phone-error">
            {errors.phone}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="preregister-programme">
          {translate(lang, "preRegisterForm.programme")}
        </label>
        <select
          id="preregister-programme"
          name="programme"
          value={values.programme}
          onChange={updateField}
          required
          aria-invalid={Boolean(errors.programme)}
          aria-describedby={
            errors.programme ? "preregister-programme-error" : undefined
          }
        >
          <option value="">
            {translate(lang, "preRegisterForm.programmePlaceholder")}
          </option>
          <option value="general">
            {translate(lang, "preRegisterForm.programmes.general")}
          </option>
          <option value="programmeOne">
            {translate(lang, "preRegisterForm.programmes.programmeOne")}
          </option>
          <option value="programmeTwo">
            {translate(lang, "preRegisterForm.programmes.programmeTwo")}
          </option>
        </select>
        {errors.programme && (
          <p
            className={styles.fieldError}
            id="preregister-programme-error"
          >
            {errors.programme}
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
              errors.consent ? "preregister-consent-error" : undefined
            }
          />
          <span>
            {translate(lang, "preRegisterForm.consent")}{" "}
            <Link href={`/${lang}/privacy-policy`}>
              {translate(lang, "preRegisterForm.privacyLink")}
            </Link>
          </span>
        </label>

        {errors.consent && (
          <p
            className={styles.fieldError}
            id="preregister-consent-error"
          >
            {errors.consent}
          </p>
        )}
      </div>

      <button className={styles.submitButton} type="submit">
        {translate(lang, "preRegisterForm.submit")}
      </button>

      {notice && (
        <p
          className={styles.notice}
          role="status"
          aria-live="polite"
        >
          {notice}
        </p>
      )}
    </form>
  );
}
