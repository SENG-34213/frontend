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
