
import { notFound } from "next/navigation";
import { supportedLanguages, translate } from "../../../lib/translations";
import styles from "./ServicesPage.module.css";

const serviceIds = ["education", "consultation", "resources"];

export default async function ServicesPage({ params }) {
    const { lang } = await params;

    // Render the page only for supported languages.
    if (!supportedLanguages.includes(lang)) {
        notFound();
    }

    return (
        <section className={styles.page}>
            <div className={styles.container}>
                <header className={styles.introduction}>
                    <p className={styles.eyebrow}>
                        {translate(lang, "site.name")}
                    </p>

                    <h1>{translate(lang, "pages.services.title")}</h1>

                    <p className={styles.lead}>
                        {translate(lang, "servicesPage.introduction")}
                    </p>
                </header>

                <div className={styles.serviceGrid}>
                    {serviceIds.map((serviceId) => (
                        <article className={styles.card} key={serviceId}>
                            <div className={styles.cardNumber} aria-hidden="true">
                                {String(serviceIds.indexOf(serviceId) + 1).padStart(2, "0")}
                            </div>

                            <h2>
                                {translate(
                                    lang,
                                    `servicesPage.items.${serviceId}.title`
                                )}
                            </h2>

                            <p>
                                {translate(
                                    lang,
                                    `servicesPage.items.${serviceId}.description`
                                )}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
