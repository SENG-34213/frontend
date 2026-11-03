"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { translate } from "../lib/translations";
import {
  formatMarketplaceCategory,
  formatMarketplacePrice,
  listPublicMarketplaceProducts,
} from "../lib/marketplaceApi";
import styles from "./ResourceLibrary.module.css";

export default function ResourceLibrary({ lang }) {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    listPublicMarketplaceProducts(controller.signal)
      .then(setResources)
      .catch((error) => {
        if (error.name !== "AbortError") setHasLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const resourceCategories = useMemo(
    () => [...new Set(resources.map((resource) => resource.category).filter(Boolean))].sort(),
    [resources],
  );

  const visibleResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const description = resource.description || resource.shortDescription || "";
      const matchesCategory = category === "all" || resource.category === category;

      const matchesSearch =
        !query ||
        [resource.title, description, resource.subject]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [resources, search, category]);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{translate(lang, "resourcesLibrary.eyebrow")}</p>

        <h1>{translate(lang, "resourcesLibrary.title")}</h1>

        <p className={styles.intro}>{translate(lang, "resourcesLibrary.description")}</p>

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
              <option value="all">{translate(lang, "resourcesLibrary.allCategories")}</option>
              {resourceCategories.map((item) => (
                <option key={item} value={item}>
                  {formatMarketplaceCategory(item)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className={styles.noResults} role="status">
            {translate(lang, "resourcesLibrary.loading")}
          </p>
        ) : hasLoadError ? (
          <div className={styles.noResults} role="alert">
            <p>{translate(lang, "resourcesLibrary.loadError")}</p>
            <button
              className={styles.retryButton}
              type="button"
              onClick={() => {
                setIsLoading(true);
                setHasLoadError(false);
                setReloadKey((key) => key + 1);
              }}
            >
              {translate(lang, "resourcesLibrary.retry")}
            </button>
          </div>
        ) : visibleResources.length > 0 ? (
          <div className={styles.grid}>
            {visibleResources.map((resource) => (
              <article className={styles.card} key={resource.id}>
                <div className={styles.cardTop}>
                  <span className={styles.fileType}>
                    {formatMarketplaceCategory(resource.category)}
                  </span>
                  <span
                    className={resource.free ? styles.freeBadge : styles.paidBadge}
                  >
                    {resource.free
                      ? translate(lang, "resourcesLibrary.free")
                      : formatMarketplacePrice(resource) || translate(lang, "resourcesLibrary.paid")}
                  </span>
                </div>

                <h2>{resource.title}</h2>
                <p className={styles.cardDescription}>
                  {resource.description ||
                    resource.shortDescription ||
                    translate(lang, "resourcesLibrary.noDescription")}
                </p>

                <p className={styles.metadata}>
                  {resource.subject
                    ? `${translate(lang, "resourcesLibrary.subject")}: ${resource.subject}`
                    : formatMarketplaceCategory(resource.category)}
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
