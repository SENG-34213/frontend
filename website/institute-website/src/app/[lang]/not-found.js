"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supportedLanguages, translate } from "../../lib/translations";
import styles from "./NotFound.module.css";

export default function LanguageNotFound() {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  const lang = supportedLanguages.includes(firstSegment) ? firstSegment : "en";

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <p className={styles.code}>404</p>

        <h1>{translate(lang, "notFound.title")}</h1>

        <p>{translate(lang, "notFound.message")}</p>

        <Link href={`/${lang}`} className={styles.homeButton}>
          {translate(lang, "notFound.homeButton")}
        </Link>
      </div>
    </section>
  );
}
