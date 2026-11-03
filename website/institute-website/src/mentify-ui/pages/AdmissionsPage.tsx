import React from "react";
import { Language } from "../types";
import { AcademicPlacementSection } from "../components/home/AcademicPlacementSection";

export interface AdmissionsPageProps {
  currentLang: Language;
  onNavigate: (path: string) => void;
}

/**
 * Admissions intentionally uses the same pre-registration experience as the
 * homepage so the fields, validation, API submission, and confirmation state
 * stay consistent everywhere.
 */
export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ onNavigate }) => (
  <div className="pt-10 sm:pt-14">
    <AcademicPlacementSection onNavigate={onNavigate} />
  </div>
);
