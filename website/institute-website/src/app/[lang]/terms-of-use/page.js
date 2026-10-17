import { notFound } from "next/navigation";
import { supportedLanguages, translate } from "../../../lib/translations";
import styles from "../privacy-policy/LegalPage.module.css";

const sectionIds = [
  "acceptance",
  "websiteUse",
  "resources",
  "intellectualProperty",
  "accuracy",
  "externalLinks",
  "liability",
  "changes",
  "contact",
];

export default async function TermsOfUsePage({ params }) {
  const { lang } = await params;

  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <article className={styles.container}>
        <header className={styles.introduction}>
          <p className={styles.eyebrow}>{translate(lang, "site.name")}</p>

          <h1>{translate(lang, "pages.terms-of-use.title")}</h1>

          <p>{translate(lang, "legalPage.terms.introduction")}</p>

          <p className={styles.reviewNotice}>{translate(lang, "legalPage.reviewNotice")}</p>
        </header>

        <div className={styles.sections}>
          {sectionIds.map((sectionId) => (
            <section className={styles.section} key={sectionId}>
              <h2>{translate(lang, `legalPage.terms.sections.${sectionId}.title`)}</h2>

              <p>{translate(lang, `legalPage.terms.sections.${sectionId}.content`)}</p>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}
