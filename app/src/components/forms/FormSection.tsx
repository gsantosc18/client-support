import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  columns = 1,
  className,
}) => {
  return (
    <fieldset className={twMerge(clsx('border-none p-0 m-0', className))}>
      <div className="border-b border-border-default pb-2 mb-6">
        <legend className="text-sm font-bold text-text-secondary select-none">
          {title}
        </legend>
        {description && (
          <p className="text-xs text-text-muted mt-1 select-none">
            {description}
          </p>
        )}
      </div>
      <div
        className={clsx('grid gap-6', {
          'grid-cols-1': columns === 1,
          'grid-cols-1 md:grid-cols-2': columns === 2,
          'grid-cols-1 md:grid-cols-3': columns === 3,
        })}
      >
        {children}
      </div>
    </fieldset>
  );
};
