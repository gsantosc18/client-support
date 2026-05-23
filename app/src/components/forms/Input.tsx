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
        <label className="text-sm font-bold text-slate-800 mb-0.5">
          {mainText} <span className="text-red-500 font-extrabold">*</span>
        </label>
      );
    }
    return <label className="text-sm font-bold text-slate-800 mb-0.5">{label}</label>;
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {renderLabel()}
      <input
        className={twMerge(
          clsx(
            'px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-slate-900 placeholder-slate-400',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
