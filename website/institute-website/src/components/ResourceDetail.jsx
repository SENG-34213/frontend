"use client";

import { useEffect, useState } from "react";
import { translate } from "../lib/translations";
import {
  formatMarketplaceCategory,
  formatMarketplacePrice,
  getPublicMarketplaceProduct,
} from "../lib/marketplaceApi";
import styles from "../app/[lang]/resources/ResourceDetail.module.css";

export default function ResourceDetail({ lang, productId }) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getPublicMarketplaceProduct(productId, controller.signal)
      .then(setProduct)
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (error.status === 404) setIsNotFound(true);
        else setHasLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [productId, reloadKey]);

  if (isLoading) {
    return (
      <div className={styles.detailCard} role="status">
        {translate(lang, "resourcesLibrary.loading")}
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className={styles.detailCard} role="status">
        <p className={styles.notice}>{translate(lang, "resourcesLibrary.notFound")}</p>
      </div>
    );
  }

  if (hasLoadError || !product) {
    return (
      <div className={styles.detailCard} role="alert">
        <p className={styles.notice}>{translate(lang, "resourcesLibrary.loadError")}</p>
        <button
          className={styles.retryButton}
          type="button"
          onClick={() => {
            setIsLoading(true);
            setHasLoadError(false);
            setIsNotFound(false);
            setReloadKey((key) => key + 1);
          }}
        >
          {translate(lang, "resourcesLibrary.retry")}
        </button>
      </div>
    );
  }

  const description =
    product.description ||
    product.shortDescription ||
    translate(lang, "resourcesLibrary.noDescription");

  return (
    <div className={styles.detailCard}>
      <div className={styles.badges}>
        <span className={styles.fileType}>{formatMarketplaceCategory(product.category)}</span>
        <span className={product.free ? styles.freeBadge : styles.paidBadge}>
          {product.free
            ? translate(lang, "resourcesLibrary.free")
            : formatMarketplacePrice(product) || translate(lang, "resourcesLibrary.paid")}
        </span>
      </div>

      <h1>{product.title}</h1>
      <p className={styles.description}>{description}</p>

      <dl className={styles.metadata}>
        <div>
          <dt>{translate(lang, "resourcesLibrary.category")}</dt>
          <dd>{formatMarketplaceCategory(product.category)}</dd>
        </div>
        {product.subject && (
          <div>
            <dt>{translate(lang, "resourcesLibrary.subject")}</dt>
            <dd>{product.subject}</dd>
          </div>
        )}
        {!product.free && formatMarketplacePrice(product) && (
          <div>
            <dt>{translate(lang, "resourcesLibrary.price")}</dt>
            <dd>{formatMarketplacePrice(product)}</dd>
          </div>
        )}
      </dl>

      <p className={styles.notice} role="status">
        {product.free
          ? translate(lang, "resourcesLibrary.downloadUnavailable")
          : translate(lang, "resourcesLibrary.paidNotice")}
      </p>
    </div>
  );
}
