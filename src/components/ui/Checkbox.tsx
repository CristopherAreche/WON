'use client';

import { forwardRef } from 'react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string;
  name?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onChange, label, error, disabled, className, value, name }, ref) => {
    return (
      <label className={`
        flex items-center gap-3 p-3 border rounded-lg cursor-pointer
        transition-all duration-200 group
        ${checked 
          ? 'border-black bg-black/5' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
        ${error ? 'border-red-500' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            value={value}
            name={name}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center
            transition-all duration-200
            ${checked 
              ? 'bg-black border-black' 
              : 'bg-white border-gray-300 group-hover:border-gray-400'
            }
            ${error ? 'border-red-500' : ''}
          `}>
            {checked && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <span className={`
            text-sm font-medium select-none
            ${checked ? 'text-black' : 'text-gray-700'}
            ${disabled ? 'text-gray-400' : ''}
          `}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;