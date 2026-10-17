"use client";

import { useMemo, useState } from "react";
import type { TeacherCourse } from "../lib/teacherApi";

type Material = {
  id: string;
  title: string;
  type: string;
  course: string;
  size: string;
  updated: string;
  visibility: "Shared" | "Live Applet" | "Teacher Draft";
  tone: "paper" | "blue" | "warm" | "code" | "grid" | "diagram";
};

const materials: Material[] = [
  {
    id: "lecture-notes",
    title: "Lecture_Notes_v4.4_Related_Rates.pdf",
    type: "PDF",
    course: "AP Calculus BC",
    size: "1.8 MB",
    updated: "Updated 45m ago",
    visibility: "Shared",
    tone: "paper",
  },
  {
    id: "conical-tank",
    title: "3D_Conical_Tank_Simulation.ggb",
    type: "GeoGebra",
    course: "AP Calculus BC",
    size: "4.1 MB",
    updated: "Launched in class",
    visibility: "Live Applet",
    tone: "blue",
  },
  {
    id: "newton-lab",
    title: "Newton_Second_Law_Lab_Manual.pdf",
    type: "PDF",
    course: "Physics Honors",
    size: "3.2 MB",
    updated: "Updated yesterday",
    visibility: "Teacher Draft",
    tone: "warm",
  },
  {
    id: "pandas",
    title: "Pandas_Exploratory_Data_Analysis.ipynb",
    type: "Jupyter",
    course: "Intro to Python",
    size: "850 KB",
    updated: "Updated 3d ago",
    visibility: "Shared",
    tone: "code",
  },
  {
    id: "formula-sheet",
    title: "Formula_Quick_Reference_AP_Exams.pdf",
    type: "PDF",
    course: "AP Calculus BC",
    size: "1.1 MB",
    updated: "Updated Oct 18",
    visibility: "Shared",
    tone: "paper",
  },
  {
    id: "transformations",
    title: "Linear_Transformations_Visual_Cheat_Sheet.png",
    type: "PNG Image",
    course: "Linear Algebra",
    size: "2.4 MB",
    updated: "Updated Oct 14",
    visibility: "Shared",
    tone: "diagram",
  },
];

const categories = [
  ["Lecture Slides & Decks", "142 presentations · Keynote & PDF", "1.8 GB", "25%"],
  ["PDF Problem Sets & Handouts", "88 files · Annotated worksheets", "620 MB", "24%"],
  ["Interactive GeoGebra & Models", "34 models · Simulation environments", "1.2 GB", "35%"],
  ["Recordings & Transcripts", "19 lessons · Synchronized transcripts", "580 MB", "14%"],
];

const folders = [
  ["AP Calculus BC - Unit 4", "24 files", "Updated 2h ago", "folder"],
  ["Physics Honors - Mechanics", "18 files", "Updated yesterday", "folder"],
  ["Linear Algebra - Matrix Transformations", "12 files", "Updated Oct 20", "folder"],
  ["Mentify AI Scaffold Sheets", "31 files", "Updated today", "ai"],
];

export default function TeacherLearningMaterialsLibrary({ courses }: { courses: TeacherCourse[] }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("All Courses");
  const [type, setType] = useState("All File Types");
  const [visibility, setVisibility] = useState("All Visibility");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [notice, setNotice] = useState("");
  const courseOptions = [
    "All Courses",
    ...new Set([
      ...courses.map((item) => item.courseName),
      ...materials.map((item) => item.course),
    ]),
  ];
  const typeOptions = ["All File Types", ...new Set(materials.map((item) => item.type))];
  const filtered = useMemo(
    () =>
      materials.filter((item) => {
        const search = query.trim().toLowerCase();
        return (
          (!search || `${item.title} ${item.course} ${item.type}`.toLowerCase().includes(search)) &&
          (course === "All Courses" || item.course === course) &&
          (type === "All File Types" || item.type === type) &&
          (visibility === "All Visibility" || item.visibility === visibility)
        );
      }),
    [course, query, type, visibility],
  );

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <section
      className={`teacher-materials-library ${view}`}
      aria-labelledby="materials-library-title"
    >
      {notice && (
        <div className="teacher-materials-notice" role="status">
          {notice}
        </div>
      )}
      <div className="teacher-materials-heading">
        <div>
          <div className="teacher-materials-eyebrow">
            <span>Repository</span>
            <b /> S3 Cloud Sync Active · Region us-east-1
          </div>
          <h2 id="materials-library-title">
            Learning Materials &amp; Media
            <br />
            Library
          </h2>
          <p>
            Centralized pedagogical asset repository: lecture notes, interactive GeoGebra models,
            formula sheets, lab datasets, and slide decks.
          </p>
        </div>
        <div className="teacher-materials-heading-actions">
          <div>
            <small>Cloud storage</small>
            <strong>
              4.2 GB <i>/ 50 GB</i>
            </strong>
          </div>
          <button type="button" onClick={() => notify("New folder form opened.")}>
            + New Folder
          </button>
          <button type="button" className="primary" onClick={() => notify("Upload dialog opened.")}>
            + Upload Material
          </button>
        </div>
      </div>
      <div className="teacher-materials-categories">
        {categories.map(([title, detail, size, width]) => (
          <article key={title}>
            <span className="teacher-materials-category-icon">
              {title.startsWith("Interactive")
                ? "3D"
                : title.startsWith("Recordings")
                  ? "REC"
                  : "PDF"}
            </span>
            <b>{size}</b>
            <h3>{title}</h3>
            <p>{detail}</p>
            <div>
              <span style={{ width }} />
            </div>
          </article>
        ))}
      </div>
      <div className="teacher-materials-section-heading">
        <div>
          <h3>Curricular Units &amp; Folders</h3>
          <span>4 Active</span>
        </div>
        <button type="button" onClick={() => notify("Folder browser opened.")}>
          View all folders →
        </button>
      </div>
      <div className="teacher-materials-folders">
        {folders.map(([title, count, updated, icon]) => (
          <button type="button" key={title} onClick={() => notify(`${title} opened.`)}>
            <span className={icon === "ai" ? "ai" : ""}>{icon === "ai" ? "AI" : "Folder"}</span>
            <strong>{title}</strong>
            <small>{count}</small>
            <em>{updated}</em>
            {icon === "ai" && <b>AI Synced</b>}
          </button>
        ))}
      </div>
      <div className="teacher-materials-toolbar">
        <label>
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, tags, or extension..."
            aria-label="Search materials"
          />
        </label>
        <select
          value={course}
          onChange={(event) => setCourse(event.target.value)}
          aria-label="Filter by course"
        >
          {courseOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          aria-label="Filter by file type"
        >
          {typeOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value)}
          aria-label="Filter by visibility"
        >
          <option>All Visibility</option>
          <option>Shared</option>
          <option>Live Applet</option>
          <option>Teacher Draft</option>
        </select>
        <div className="teacher-materials-view-switch">
          <button
            type="button"
            className={view === "grid" ? "active" : ""}
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            Grid
          </button>
          <button
            type="button"
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            List
          </button>
        </div>
      </div>
      <div className="teacher-materials-results">
        {filtered.map((material) => (
          <article className="teacher-material-card" key={material.id}>
            <button
              type="button"
              className={`teacher-material-preview ${material.tone}`}
              onClick={() => notify(`${material.title} preview opened.`)}
            >
              <span>{material.type}</span>
              <strong>
                {material.tone === "code"
                  ? "import pandas as pd\n# Mentify Autograded Lab Sandbox"
                  : material.tone === "blue"
                    ? "GeoGebra\nConical Tank Simulation"
                    : material.tone === "diagram"
                      ? "Linear Transformations\nVisual Cheat Sheet"
                      : "AP CALCULUS: RELATED RATES\nDifferential Formulas & Examples"}
              </strong>
              <b>{material.visibility}</b>
            </button>
            <div className="teacher-material-card-body">
              <h3 title={material.title}>{material.title}</h3>
              <div>
                <span>{material.course}</span>
                <small>{material.size}</small>
              </div>
              <footer>
                <small>{material.updated}</small>
                <div>
                  <button type="button" onClick={() => notify(`${material.title} preview opened.`)}>
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => notify(`${material.title} share link copied.`)}
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => notify(`${material.title} download started.`)}
                  >
                    Download
                  </button>
                </div>
              </footer>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="teacher-materials-empty">No materials match your current filters.</div>
      )}
      <div className="teacher-materials-upload">
        <span>Upload</span>
        <div>
          <strong>Drag &amp; drop files here to upload instantly</strong>
          <small>
            Supports PDF, GeoGebra (.ggb), Keynote, Jupyter (.ipynb), PNG/SVG up to 250 MB per file
          </small>
        </div>
        <b>Browse Files</b>
        <input
          type="file"
          onChange={(event) =>
            event.target.files?.[0] && notify(`${event.target.files[0].name} ready to upload.`)
          }
        />
      </div>
    </section>
  );
}
