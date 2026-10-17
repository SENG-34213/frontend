import { notFound } from "next/navigation";
import PreRegisterForm from "../../../components/PreRegisterForm";
import { supportedLanguages, translate } from "../../../lib/translations";
import styles from "./PreRegisterPage.module.css";

export default async function PreRegisterPage({ params }) {
  const { lang } = await params;

  // Reject unsupported languages before rendering the page.
  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.introduction}>
          <h1>{translate(lang, "pages.preregister.title")}</h1>

          <p>{translate(lang, "pages.preregister.description")}</p>
        </div>

        <PreRegisterForm lang={lang} />
      </div>
    </section>
  );
}
