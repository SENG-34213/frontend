
import { notFound } from "next/navigation";
import { supportedLanguages, translate } from "../../../lib/translations";
import styles from "./AboutPage.module.css";

export default async function AboutPage({ params }) {
    const { lang } = await params;

    // Only render the page for supported languages.
    if (!supportedLanguages.includes(lang)) {
        notFound();
    }

    const sections = ["mission", "vision", "values"];

    return (
        <section className={styles.page}>
            <div className={styles.container}>
                <header className={styles.introduction}>

                    <h1>{translate(lang, "pages.about.title")}</h1>

                    <p className={styles.lead}>
                        {translate(lang, "aboutPage.introduction")}
                    </p>
                </header>

                <div className={styles.sectionGrid}>
                    {sections.map((section) => (
                        <article className={styles.card} key={section}>
                            <h2>
                                {translate(lang, `aboutPage.sections.${section}.title`)}
                            </h2>

                            <p>
                                {translate(lang, `aboutPage.sections.${section}.description`)}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
