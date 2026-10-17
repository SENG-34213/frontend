/*
 * Sample resource catalogue.
 *
 * Replace these examples with the institute's real resources later.
 * File paths are placeholders: no downloads are enabled yet.
 *
 * access:
 *   "free" - intended to be freely downloadable
 *   "paid" - visible in the catalogue, but not downloadable yet
 */

export const resources = [
  {
    id: "sample-study-guide",
    title: "Sample Study Guide",
    description:
      "A sample guide to help learners organise their studies and build effective learning habits.",
    category: "study-skills",
    type: "PDF",
    size: "2.4 MB",
    access: "free",
    language: "en",
    filePath: null,
  },
  {
    id: "sample-learning-handbook",
    title: "Sample Learning Handbook",
    description:
      "An example handbook covering learning strategies, planning, and personal development.",
    category: "learning",
    type: "PDF",
    size: "5.1 MB",
    access: "paid",
    language: "en",
    filePath: null,
  },
  {
    id: "sample-reference-notes",
    title: "Sample Reference Notes",
    description: "Example reference notes for learners who want to review key concepts.",
    category: "reference",
    type: "PDF",
    size: "1.8 MB",
    access: "free",
    language: "en",
    filePath: null,
  },
];

export const resourceCategories = ["all", "study-skills", "learning", "reference"];
