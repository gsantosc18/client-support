import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  required,
  children,
  className,
}) => {
  return (
    <div className={twMerge(clsx('flex flex-col w-full gap-1.5', className))}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-text-secondary select-none"
      >
        {label}{' '}
        {required && (
          <span className="text-destructive font-bold select-none">*</span>
        )}
      </label>
      {children}
      {error && (
        <span className="text-xs text-destructive font-medium mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150 block">
          {error}
        </span>
      )}
    </div>
  );
};
