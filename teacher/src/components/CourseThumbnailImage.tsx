import React, { useEffect, useState } from "react";
import { createMaterialApi } from "../../../shared/materials/materialApi";

interface CourseThumbnailImageProps {
  source?: string;
  alt: string;
  className: string;
}

function materialIdFromThumbnail(source?: string) {
  return source?.startsWith("material:") ? source.slice("material:".length) : "";
}

/** Resolves stable Material Service references into a fresh presigned S3 URL. */
export const CourseThumbnailImage: React.FC<CourseThumbnailImageProps> = ({
  source,
  alt,
  className,
}) => {
  const materialId = materialIdFromThumbnail(source);
  const [resolvedSource, setResolvedSource] = useState("");

  useEffect(() => {
    if (!source) {
      setResolvedSource("");
      return;
    }

    if (!materialId) {
      setResolvedSource(source);
      return;
    }

    let active = true;
    setResolvedSource("");
    void createMaterialApi()
      .download(materialId)
      .then((response) => {
        if (active) setResolvedSource(response.downloadUrl || response.url || "");
      })
      .catch(() => {
        if (active) setResolvedSource("");
      });

    return () => {
      active = false;
    };
  }, [materialId, source]);

  if (!resolvedSource) return null;

  return (
    <img
      src={resolvedSource}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
};
