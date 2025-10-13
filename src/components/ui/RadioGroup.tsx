'use client';

import { forwardRef } from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ options, value, onChange, name, error, disabled, className }, ref) => {
    return (
      <div className={`flex gap-4 ${className}`}>
        {options.map((option, index) => (
          <label
            key={option.value}
            className={`
              flex items-center gap-3 p-3 border rounded-lg cursor-pointer
              transition-all duration-200 group flex-1
              ${value === option.value 
                ? 'border-black bg-black/5' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <div className="relative">
              <input
                ref={index === 0 ? ref : undefined}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                transition-all duration-200
                ${value === option.value 
                  ? 'bg-black border-black' 
                  : 'bg-white border-gray-300 group-hover:border-gray-400'
                }
                ${error ? 'border-red-500' : ''}
              `}>
                {value === option.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
            <span className={`
              text-sm font-medium select-none
              ${value === option.value ? 'text-black' : 'text-gray-700'}
              ${disabled ? 'text-gray-400' : ''}
            `}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;