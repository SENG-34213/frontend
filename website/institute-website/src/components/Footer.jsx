"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { translate, supportedLanguages } from "../lib/translations";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  const language = supportedLanguages.includes(firstSegment)
    ? firstSegment
    : "en";

  // Every internal link uses the visitor's current language.
  const pagePath = (page) => `/${language}${page ? `/${page}` : ""}`;

  const quickLinks = [
    { key: "home", href: "" },
    { key: "about", href: "about" },
    { key: "services", href: "services" },
    { key: "resources", href: "resources" },
    { key: "contact", href: "contact" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <section className={styles.introduction}>
          <h2>TiT Education</h2>

          <p>{translate(language, "footer.description")}</p>

          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
            YouTube Channel
          </a>
        </section>

        <section>
          <h3>{translate(language, "footer.quickLinks")}</h3>

          <ul className={styles.linkList}>
            {quickLinks.map((item) => (
              <li key={item.key}>
                <Link href={pagePath(item.href)}>
                  {translate(language, `nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>{translate(language, "footer.addressLabel")}</h3>
          <p>Jaffna, Sri Lanka</p>

          <h3>{translate(language, "footer.phoneLabel")}</h3>
          <a href={`tel:+94770158446`}>
            +94770158446
          </a>

          <h3>{translate(language, "footer.emailLabel")}</h3>
          <a href={`mailto:admin@titjaffna.lk`}>
            admin@titjaffna.lk
          </a>
        </section>

        <section>
          <h3>{translate(language, "footer.legal")}</h3>

          <ul className={styles.linkList}>
            <li>
              <Link href={pagePath("privacy-policy")}>
                {translate(language, "footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href={pagePath("terms-of-use")}>
                {translate(language, "footer.terms")}
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <div className={styles.copyright}>
        <p>
          © 2026 TiT Education.{" "}
          All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
