import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-2xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl border text-sm transition-all duration-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950'
            } disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border text-sm transition-all duration-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
            error
              ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950'
          } disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="dark:bg-slate-900 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={areaId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          className={`w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl border text-sm transition-all duration-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-offset-1 resize-y ${
            error
              ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950'
          } disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const checkId = id || `chk-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <div className="flex items-start gap-3">
        <input
          id={checkId}
          ref={ref}
          type="checkbox"
          className={`mt-1 h-4 w-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer ${className}`}
          {...props}
        />
        <label htmlFor={checkId} className="text-sm cursor-pointer select-none">
          <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </label>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
