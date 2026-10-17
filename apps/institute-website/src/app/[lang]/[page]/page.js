import Link from "next/link";
import { notFound } from "next/navigation";
import { supportedLanguages, translate } from "../../../lib/translations";
import styles from "./Page.module.css";

const pageSlugs = [];

export function generateStaticParams() {
  return pageSlugs.map((page) => ({ page }));
}

export default async function ContentPage({ params }) {
  const { lang, page } = await params;

  if (!supportedLanguages.includes(lang) || !pageSlugs.includes(page)) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{translate(lang, "site.name")}</p>

        <h1>{translate(lang, `pages.${page}.title`)}</h1>

        <p className={styles.description}>{translate(lang, `pages.${page}.description`)}</p>

        <section className={styles.infoCard}>
          <h2>{translate(lang, "shared.sampleHeading")}</h2>
          <p>{translate(lang, "shared.sampleText")}</p>
        </section>

        <Link href={`/${lang}`} className={styles.homeLink}>
          {translate(lang, "shared.backHome")}
        </Link>
      </div>
    </section>
  );
}
