import React from "react";
import { AlertTriangle } from "lucide-react";
import { NavigationTab } from "../types";

interface GradebookViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({ onNavigate }) => (
  <div className="mx-auto flex min-h-[420px] max-w-3xl items-center justify-center px-4 py-12">
    <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-600" />
      <h1 className="text-xl font-bold text-slate-900">Gradebook is not available yet</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
        The backend does not currently expose a teacher-authorized gradebook aggregation contract.
        Gradebook data is intentionally hidden until those permissions and APIs are available.
      </p>
      <button
        type="button"
        onClick={() => onNavigate("exams")}
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
      >
        Return to examinations
      </button>
    </div>
  </div>
);
