import React, { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  const renderLabel = () => {
    if (!label) return null;
    if (label.endsWith(' *')) {
      const mainText = label.slice(0, -2);
      return (
        <label className="text-sm font-bold text-text-secondary text-slate-800 mb-0.5">
          {mainText} <span className="text-destructive text-red-500 font-extrabold">*</span>
        </label>
      );
    }
    return <label className="text-sm font-bold text-text-secondary text-slate-800 mb-0.5">{label}</label>;
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {renderLabel()}
      <input
        className={twMerge(
          clsx(
            'px-3 py-2 border border-border-default rounded-lg shadow-sm bg-background-surface bg-white text-text-primary text-slate-800 placeholder:text-text-muted text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )
        )}
        {...props}
      />
      {error && <span className="text-xs text-destructive text-red-600 font-medium">{error}</span>}
    </div>
  );
};
