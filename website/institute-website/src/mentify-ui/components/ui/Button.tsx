import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 gap-2 h-10',
    lg: 'text-base px-6 py-3.5 gap-2.5 h-12 shadow-sm',
  };

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/20 focus:ring-indigo-500 border border-transparent',
    secondary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-blue-500/20 focus:ring-blue-500 border border-transparent',
    outline:
      'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 focus:ring-indigo-500 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400 border border-transparent',
    destructive:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-rose-500/20 focus:ring-rose-500 border border-transparent',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
