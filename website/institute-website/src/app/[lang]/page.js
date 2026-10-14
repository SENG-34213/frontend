
import Link from "next/link";
import { notFound } from "next/navigation";
import { translate, supportedLanguages } from "../../lib/translations";
import { resources } from "../../data/resources";
import styles from "./Home.module.css";

const serviceIds = ["onsite", "online", "grades"];

export default async function HomePage({ params }) {
    const { lang } = await params;

    if (!supportedLanguages.includes(lang)) {
        notFound();
    }

    // Show a small selection from the existing resource catalogue.
    const featuredResources = resources.slice(0, 3);

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.content}>
                    <p className={styles.eyebrow}>
                        {translate(lang, "home.eyebrow")}
                    </p>

                    <h1>{translate(lang, "home.title")}</h1>

                    <p className={styles.description}>
                        {translate(lang, "home.description")}
                    </p>

                    <div className={styles.actions}>
                        <Link
                            href={`/${lang}/services`}
                            className={styles.primaryButton}
                        >
                            {translate(lang, "home.servicesButton")}
                        </Link>

                        <Link
                            href={`/${lang}/resources`}
                            className={styles.secondaryButton}
                        >
                            {translate(lang, "home.resourcesButton")}
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionContainer}>
                    <header className={styles.sectionHeader}>
                        <p className={styles.sectionEyebrow}>
                            {translate(lang, "home.servicesEyebrow")}
                        </p>
                        <h2>{translate(lang, "home.servicesHeading")}</h2>
                        <p>{translate(lang, "home.servicesDescription")}</p>
                    </header>

                    <div className={styles.serviceGrid}>
                        {serviceIds.map((serviceId, index) => (
                            <article className={styles.serviceCard} key={serviceId}>
                                <span className={styles.cardNumber} aria-hidden="true">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <h3>
                                    {translate(
                                        lang,
                                        `home.serviceCards.${serviceId}.title`
                                    )}
                                </h3>
                                <p>
                                    {translate(
                                        lang,
                                        `home.serviceCards.${serviceId}.description`
                                    )}
                                </p>
                            </article>
                        ))}
                    </div>

                    <div className={styles.sectionActions}>
                        <Link
                            href={`/${lang}/services`}
                            className={styles.textLink}
                        >
                            {translate(lang, "home.viewAllServices")} →
                        </Link>
                    </div>
                </div>
            </section>

            <section className={`${styles.section} ${styles.resourcesSection}`}>
                <div className={styles.sectionContainer}>
                    <header className={styles.sectionHeader}>
                        <p className={styles.sectionEyebrow}>
                            {translate(lang, "resourcesLibrary.eyebrow")}
                        </p>
                        <h2>{translate(lang, "home.resourcesHeading")}</h2>
                        <p>{translate(lang, "home.resourcesDescription")}</p>
                    </header>

                    <div className={styles.resourceGrid}>
                        {featuredResources.map((resource) => (
                            <article className={styles.resourceCard} key={resource.id}>
                                <div className={styles.resourceMeta}>
                                    <span>{resource.type}</span>
                                    <span>
                                        {translate(
                                            lang,
                                            resource.access === "paid"
                                                ? "resourcesLibrary.paid"
                                                : "resourcesLibrary.free"
                                        )}
                                    </span>
                                </div>

                                <h3>{resource.title}</h3>
                                <p>{resource.description}</p>

                                <Link
                                    href={`/${lang}/resources/${resource.id}`}
                                    className={styles.textLink}
                                >
                                    {translate(lang, "resourcesLibrary.viewDetails")} →
                                </Link>
                            </article>
                        ))}
                    </div>

                    <div className={styles.sectionActions}>
                        <Link
                            href={`/${lang}/resources`}
                            className={styles.primaryButton}
                        >
                            {translate(lang, "home.resourcesButton")}
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.callToAction}>
                <div className={styles.callToActionContent}>
                    <h2>{translate(lang, "home.ctaHeading")}</h2>
                    <p>{translate(lang, "home.ctaDescription")}</p>
                    <Link
                        href={`/${lang}/preregister`}
                        className={styles.primaryButton}
                    >
                        {translate(lang, "home.ctaButton")}
                    </Link>
                </div>
            </section>
        </>
    );
}
