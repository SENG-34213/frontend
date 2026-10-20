import React, { useId, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

export const MAX_EXAM_INSTRUCTION_SIZE = 25 * 1024 * 1024;

export function validateInstructionFile(file: File) {
  if (file.size === 0) return "The PDF file is empty.";
  if (file.size > MAX_EXAM_INSTRUCTION_SIZE) return "The PDF must not exceed 25 MB.";
  if (file.type && file.type.toLowerCase() !== "application/pdf") {
    return "Only PDF files are supported.";
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) return "Only PDF files are supported.";
  return null;
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const ExamInstructionUpload: React.FC<{
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const selectFile = (file?: File) => {
    if (!file) return;
    const validationError = validateInstructionFile(file);
    setError(validationError);
    onChange(validationError ? null : file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
        Instruction PDF <span className="font-normal text-slate-400">(optional, max 25 MB)</span>
      </label>
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 text-xs text-indigo-900">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{value.name}</span>
            <span className="shrink-0 text-indigo-600">{formatSize(value.size)}</span>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            aria-label="Remove instruction PDF"
            className="rounded p-1 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
        >
          <Upload className="h-4 w-4" /> Select a PDF instruction file
        </label>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".pdf,application/pdf"
        disabled={disabled}
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      {error && (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
