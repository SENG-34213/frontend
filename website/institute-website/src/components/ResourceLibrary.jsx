"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { resources, resourceCategories } from "../data/resources";
import { translate } from "../lib/translations";
import styles from "./ResourceLibrary.module.css";

export default function ResourceLibrary({ lang }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const visibleResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesCategory = category === "all" || resource.category === category;

      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{translate(lang, "resourcesLibrary.eyebrow")}</p>

        <h1>{translate(lang, "resourcesLibrary.title")}</h1>

        <p className={styles.intro}>{translate(lang, "resourcesLibrary.description")}</p>

        <p className={styles.sampleNotice}>{translate(lang, "resourcesLibrary.sampleNotice")}</p>

        <div className={styles.filters}>
          <div className={styles.filterField}>
            <label htmlFor="resource-search">
              {translate(lang, "resourcesLibrary.searchLabel")}
            </label>
            <input
              id="resource-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={translate(lang, "resourcesLibrary.searchPlaceholder")}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="resource-category">
              {translate(lang, "resourcesLibrary.categoryLabel")}
            </label>
            <select
              id="resource-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {resourceCategories.map((item) => (
                <option key={item} value={item}>
                  {item === "all"
                    ? translate(lang, "resourcesLibrary.allCategories")
                    : translate(lang, `resourcesLibrary.categories.${item}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visibleResources.length > 0 ? (
          <div className={styles.grid}>
            {visibleResources.map((resource) => (
              <article className={styles.card} key={resource.id}>
                <div className={styles.cardTop}>
                  <span className={styles.fileType}>{resource.type}</span>
                  <span
                    className={resource.access === "paid" ? styles.paidBadge : styles.freeBadge}
                  >
                    {translate(
                      lang,
                      resource.access === "paid"
                        ? "resourcesLibrary.paid"
                        : "resourcesLibrary.free",
                    )}
                  </span>
                </div>

                <h2>{resource.title}</h2>
                <p className={styles.cardDescription}>{resource.description}</p>

                <p className={styles.metadata}>
                  {translate(lang, "resourcesLibrary.fileType")}: {resource.type}
                  <span aria-hidden="true"> · </span>
                  {translate(lang, "resourcesLibrary.fileSize")}: {resource.size}
                </p>

                <Link className={styles.detailsLink} href={`/${lang}/resources/${resource.id}`}>
                  {translate(lang, "resourcesLibrary.viewDetails")}
                  <span aria-hidden="true"> →</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.noResults} role="status">
            {translate(lang, "resourcesLibrary.noResults")}
          </p>
        )}
      </div>
    </section>
  );
}
