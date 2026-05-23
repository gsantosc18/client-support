import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className, 
  disabled, 
  ...props 
}) => {
  const baseStyles = 'inline-flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'border-transparent text-text-primary bg-action-primary hover:bg-action-hover focus-visible:ring-focus-ring',
    secondary: 'border-transparent text-text-primary bg-background-muted hover:bg-border-default focus-visible:ring-focus-ring',
    outline: 'border-border-default text-text-secondary bg-background-surface hover:bg-background-muted focus-visible:ring-focus-ring',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};
