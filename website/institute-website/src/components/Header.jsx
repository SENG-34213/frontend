"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { translate, supportedLanguages } from "../lib/translations";
import styles from "./Header.module.css";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Read the current language from the first URL segment.
  const segments = pathname.split("/").filter(Boolean);
  const currentLanguage = supportedLanguages.includes(segments[0])
    ? segments[0]
    : "en";

  // Remove the language segment to preserve the current page
  // when the visitor switches languages.
  const pageSegments = supportedLanguages.includes(segments[0])
    ? segments.slice(1)
    : segments;

  function getLocalizedPath(language, page = "") {
    const suffix = page ? `/${page}` : "";
    return `/${language}${suffix}`;
  }

  const navigationItems = [
    { key: "home", href: "" },
    { key: "about", href: "about" },
    { key: "services", href: "services" },
    { key: "resources", href: "resources" },
    { key: "contact", href: "contact" },
  ];

  function handleLanguageChange(event) {
    const newLanguage = event.target.value;
    const destination = getLocalizedPath(newLanguage, pageSegments.join("/"));

    // Full navigation ensures the new language is loaded consistently.
    window.location.assign(destination);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link
          href={getLocalizedPath(currentLanguage)}
          className={styles.brand}
          onClick={closeMenu}
        >
          <Image
            src="/TiTJaffna-logo.jpeg"
            alt="Institute logo"
            width={220}
            height={56}
            priority
            className={styles.logo}
          />
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-label={translate(currentLanguage, "nav.openMenu")}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          id="main-navigation"
          className={`${styles.navigation} ${
            menuOpen ? styles.navigationOpen : ""
          }`}
          aria-label={translate(currentLanguage, "nav.mainNavigation")}
        >
          {navigationItems.map((item) => {
            const href = getLocalizedPath(currentLanguage, item.href);

            return (
              <Link
                key={item.key}
                href={href}
                className={styles.navLink}
                onClick={closeMenu}
              >
                {translate(currentLanguage, `nav.${item.key}`)}
              </Link>
            );
          })}

          <label className={styles.languageControl}>
            <span className={styles.visuallyHidden}>Language</span>

            <select
              value={currentLanguage}
              onChange={handleLanguageChange}
              aria-label={translate(currentLanguage, "nav.selectLanguage")}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="si">සිංහල</option>
            </select>
          </label>

          {/* Social media links — replace placeholder URLs when ready. */}
          <div className={styles.socialLinks}>
            <a
              href="https://www.youtube.com/@titeducation2087"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our YouTube channel"
              title="YouTube"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
              </svg>
            </a>

            <a
              href="https://web.facebook.com/ThirupathyInformationTechnology"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Facebook page"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.3c0-3 1.8-4.7 4.5-4.7 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" />
              </svg>
            </a>
          </div>

          <Link
            href={getLocalizedPath(currentLanguage, "preregister")}
            className={styles.preregisterButton}
            onClick={closeMenu}
          >
            {translate(currentLanguage, "nav.preregister")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
