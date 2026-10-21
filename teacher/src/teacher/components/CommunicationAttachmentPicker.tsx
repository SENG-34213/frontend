import React, { useId, useRef, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";

export const MAX_COMMUNICATION_FILE_SIZE = 25 * 1024 * 1024;
export const MAX_COMMUNICATION_ATTACHMENTS = 10;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "video/mp4",
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/ogg",
  "audio/mpeg",
  "audio/wav",
]);

export function validateCommunicationFile(file: File) {
  if (file.size === 0) return "The file is empty.";
  if (file.size > MAX_COMMUNICATION_FILE_SIZE) return "Each file must not exceed 25 MB.";
  if (!ALLOWED_TYPES.has(file.type.toLowerCase())) return "This file type is not supported.";
  return null;
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const CommunicationAttachmentPicker: React.FC<{
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}> = ({ files, onChange, disabled = false }) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (incoming: File[]) => {
    const next = [...files];
    for (const file of incoming) {
      if (next.length >= MAX_COMMUNICATION_ATTACHMENTS) {
        setError("A message may contain at most 10 attachments.");
        break;
      }
      const validationError = validateCommunicationFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        continue;
      }
      if (next.some((current) => current.name === file.name && current.size === file.size))
        continue;
      next.push(file);
      setError(null);
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <label
        htmlFor={inputId}
        title="Attach files"
        className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
      >
        <Paperclip className="h-4 w-4" />
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        disabled={disabled}
        className="sr-only"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip,video/mp4,audio/webm,audio/ogg,audio/mpeg,audio/wav"
        onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
      />
      {files.length > 0 && (
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="flex max-w-48 shrink-0 items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[10px] text-indigo-800"
            >
              <FileText className="h-3 w-3 shrink-0" />
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-indigo-500">{formatSize(file.size)}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
                aria-label={`Remove ${file.name}`}
                className="rounded text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <span className="text-[10px] text-rose-600">{error}</span>}
    </div>
  );
};
