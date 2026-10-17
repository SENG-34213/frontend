import { notFound } from "next/navigation";
import { supportedLanguages, translate } from "../../../lib/translations";
import styles from "./LegalPage.module.css";

const sectionIds = ["information", "usage", "forms", "sharing", "security", "rights", "contact"];

export default async function PrivacyPolicyPage({ params }) {
  const { lang } = await params;

  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <article className={styles.container}>
        <header className={styles.introduction}>
          <h1>{translate(lang, "pages.privacy-policy.title")}</h1>
          <p>{translate(lang, "legalPage.privacy.introduction")}</p>
          <p className={styles.reviewNotice}>{translate(lang, "legalPage.reviewNotice")}</p>
        </header>

        <div className={styles.sections}>
          {sectionIds.map((sectionId) => (
            <section className={styles.section} key={sectionId}>
              <h2>{translate(lang, `legalPage.privacy.sections.${sectionId}.title`)}</h2>
              <p>{translate(lang, `legalPage.privacy.sections.${sectionId}.content`)}</p>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}
