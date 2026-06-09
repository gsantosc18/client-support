import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FormContainerProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  errorMessage?: string | null;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  errorMessage,
  className,
  ...props
}) => {
  return (
    <form
      className={twMerge(
        clsx(
          'space-y-6 bg-background-surface p-5 sm:p-8 rounded-xl border border-border-default shadow-sm w-full',
          className
        )
      )}
      {...props}
    >
      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-red-600 text-sm font-medium border border-destructive/20 animate-in fade-in duration-150">
          {errorMessage}
        </div>
      )}
      {children}
    </form>
  );
};
