import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

interface ModalShellProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const ModalShell: React.FC<ModalShellProps> = ({ title, children, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
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
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Delete",
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="mt-4 flex gap-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-800">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <p>{description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void onConfirm()}
          className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
        >
          {confirmText}
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
          if (trimmed) void onSave(trimmed);
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
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Save changes
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
