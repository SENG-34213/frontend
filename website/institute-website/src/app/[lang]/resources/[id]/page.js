import Link from "next/link";
import { notFound } from "next/navigation";
import ResourceDetail from "../../../../components/ResourceDetail";
import { supportedLanguages, translate } from "../../../../lib/translations";
import styles from "../ResourceDetail.module.css";

export default async function ResourceDetailPage({ params }) {
  const { lang, id } = await params;

  if (!supportedLanguages.includes(lang)) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <Link href={`/${lang}/resources`} className={styles.backLink}>
          ← {translate(lang, "resourcesLibrary.backToResources")}
        </Link>
        <ResourceDetail key={id} lang={lang} productId={id} />
      </div>
    </section>
  );
}
