import React, { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    const renderLabel = () => {
      if (!label) return null;
      if (label.endsWith(' *')) {
        const mainText = label.slice(0, -2);
        return (
          <label className="text-sm font-semibold text-text-secondary mb-1.5 select-none">
            {mainText}{' '}
            <span className="text-destructive font-bold select-none">*</span>
          </label>
        );
      }
      return (
        <label className="text-sm font-semibold text-text-secondary mb-1.5 select-none">
          {label}
        </label>
      );
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        {renderLabel()}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'px-3 py-2 border border-border-default rounded-lg shadow-sm bg-background-surface text-text-primary placeholder:text-text-muted text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive font-medium mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150 block">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
