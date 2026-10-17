import Link from "next/link";
import { notFound } from "next/navigation";
import { resources } from "../../../../data/resources";
import { supportedLanguages, translate } from "../../../../lib/translations";
import styles from "../ResourceDetail.module.css";

export function generateStaticParams() {
  return supportedLanguages.flatMap((lang) =>
    resources.map((resource) => ({
      lang,
      id: resource.id,
    })),
  );
}

export default async function ResourceDetailPage({ params }) {
  const { lang, id } = await params;

  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  const resource = resources.find((item) => item.id === id);

  if (!resource) {
    notFound();
  }

  const isPaid = resource.access === "paid";

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <Link href={`/${lang}/resources`} className={styles.backLink}>
          ← {translate(lang, "resourcesLibrary.backToResources")}
        </Link>

        <div className={styles.detailCard}>
          <div className={styles.badges}>
            <span className={styles.fileType}>{resource.type}</span>

            <span className={isPaid ? styles.paidBadge : styles.freeBadge}>
              {translate(lang, isPaid ? "resourcesLibrary.paid" : "resourcesLibrary.free")}
            </span>
          </div>

          <h1>{resource.title}</h1>
          <p className={styles.description}>{resource.description}</p>

          <dl className={styles.metadata}>
            <div>
              <dt>{translate(lang, "resourcesLibrary.fileType")}</dt>
              <dd>{resource.type}</dd>
            </div>
            <div>
              <dt>{translate(lang, "resourcesLibrary.fileSize")}</dt>
              <dd>{resource.size}</dd>
            </div>
          </dl>

          {isPaid ? (
            <p className={styles.notice} role="status">
              {translate(lang, "resourcesLibrary.paidNotice")}
            </p>
          ) : (
            <p className={styles.notice} role="status">
              {translate(lang, "resourcesLibrary.downloadUnavailable")}
            </p>
          )}

          <p className={styles.sampleNotice}>{translate(lang, "resourcesLibrary.sampleNotice")}</p>
        </div>
      </div>
    </section>
  );
}
