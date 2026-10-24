import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

interface ModalShellProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
<<<<<<< Updated upstream
}

const ModalShell: React.FC<ModalShellProps> = ({ title, children, onClose }) => {
=======
  className?: string;
  isCloseDisabled?: boolean;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  children,
  onClose,
  className = "",
  isCloseDisabled = false,
}) => {
>>>>>>> Stashed changes
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCloseDisabled) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isCloseDisabled, onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !isCloseDisabled) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="action-modal-title" className="text-base font-bold text-slate-900">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isCloseDisabled}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  pendingText?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  intent?: "danger" | "warning";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Delete",
  pendingText = "Processing...",
  isSubmitting = false,
  errorMessage,
  intent = "danger",
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;
  const danger = intent === "danger";
  return (
    <ModalShell title={title} onClose={onClose} isCloseDisabled={isSubmitting}>
      <div className={`mt-4 flex gap-3 rounded-xl border p-3 text-sm ${
        danger
          ? "border-rose-100 bg-rose-50 text-rose-800"
          : "border-amber-100 bg-amber-50 text-amber-800"
      }`}>
        <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${
          danger ? "text-rose-600" : "text-amber-600"
        }`} />
        <p>{description}</p>
      </div>
      {errorMessage && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {errorMessage}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void onConfirm()}
          disabled={isSubmitting}
          className={`rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
            danger ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          {isSubmitting ? pendingText : confirmText}
        </button>
      </div>
    </ModalShell>
  );
};

interface TextInputModalProps {
  isOpen: boolean;
  title: string;
  label: string;
  initialValue: string;
  placeholder?: string;
  multiline?: boolean;
  extraContent?: React.ReactNode;
  isSubmitting?: boolean;
  onSave: (value: string) => void | Promise<void>;
  onClose: () => void;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  isOpen,
  title,
  label,
  initialValue,
  placeholder,
  multiline = false,
  extraContent,
  isSubmitting = false,
  onSave,
  onClose,
}) => {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [initialValue, isOpen]);
  if (!isOpen) return null;

  return (
    <ModalShell title={title} onClose={onClose}>
      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = value.trim();
          if (trimmed && !isSubmitting) void onSave(trimmed);
        }}
      >
        <label className="block text-xs font-semibold text-slate-700">
          {label}
          {multiline ? (
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={placeholder}
              rows={4}
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          ) : (
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={placeholder}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          )}
        </label>
        {extraContent}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const NoticeModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}> = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="mt-4 flex gap-3 text-sm text-slate-600">
        <Info className="h-5 w-5 shrink-0 text-indigo-600" />
        <p>{message}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
};
