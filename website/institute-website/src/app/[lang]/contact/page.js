
import { notFound } from "next/navigation";
import ContactForm from "../../../components/ContactForm";
import { supportedLanguages, translate } from "../../../lib/translations";
import styles from "./ContactPage.module.css";

export default async function ContactPage({ params }) {
  const { lang } = await params;

  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.introduction}>
          <p className={styles.eyebrow}>
            {translate(lang, "site.name")}
          </p>
          <h1>{translate(lang, "pages.contact.title")}</h1>
          <p>{translate(lang, "pages.contact.description")}</p>
        </div>

        <ContactForm lang={lang} />
      </div>
    </section>
  );
}
