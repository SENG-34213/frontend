import type { Material } from "../../../shared/materials/materialTypes";
import type { CourseModule } from "../lib/teacherApi";
import { TeacherNavIcon } from "./TeacherNavIcon";

export const fileCategory = (m: Material) => {
  const value = `${m.fileName || ""} ${m.type || ""} ${m.contentType || ""}`.toLowerCase();
  if (/ppt|keynote|presentation/.test(value)) return "slides";
  if (/video|audio|mp4|webm|mp3/.test(value)) return "recordings";
  if (/ggb|ipynb|html|geogebra/.test(value)) return "interactive";
  return "documents";
};
export const librarySize = (bytes: number) => bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
export function MaterialLibrarySummary({ materials, modules, category, folder, onCategory, onFolder }: { materials: Material[]; modules: CourseModule[]; category: string; folder: string; onCategory: (s: string) => void; onFolder: (s: string) => void }) {
  return <div className="ml-summary"><div className="ml-categories">{[["slides", "Lecture Slides & Decks", "Presentations and teaching slides", "courses"], ["documents", "Documents & Handouts", "Worksheets, notes and images", "materials"], ["interactive", "Interactive Models & Code", "Simulations and notebooks", "quizzes"], ["recordings", "Recordings & Audio", "Lesson videos and recordings", "calendar"]].map(([key, title, subtitle, icon]) => { const files = materials.filter(m => fileCategory(m) === key); return <button type="button" key={key} className={category === key ? "selected" : ""} aria-pressed={category === key} onClick={() => onCategory(category === key ? "ALL" : key)}><div><i><TeacherNavIcon name={icon}/></i><span>{librarySize(files.reduce((n, m) => n + (m.fileSize || 0), 0))}</span></div><h2>{title}</h2><p>{files.length} files · {subtitle}</p><progress aria-label={`${title} share of loaded materials`} value={files.length} max={materials.length || 1}/></button>; })}</div><header><h2>♧ Curricular Units &amp; Folders <small>{modules.length} Units</small></h2><button type="button" onClick={() => onFolder("")}>View all materials →</button></header><div className="ml-folders">{modules.map(m => <button key={m.id} type="button" aria-pressed={folder === m.id} className={folder === m.id ? "selected" : ""} onClick={() => onFolder(folder === m.id ? "" : m.id)}><i><TeacherNavIcon name="materials"/></i><strong>{m.title}</strong><span>{materials.filter(f => f.moduleId === m.id).length} files <small>Course module</small></span></button>)}{!modules.length && <p className="ml-no-folders">No module folders yet. Create course modules in My Courses to organize your resources.</p>}</div></div>;
}
