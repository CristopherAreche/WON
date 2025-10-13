'use client';

import { forwardRef, useState } from 'react';
import { theme } from '@/lib/theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, placeholder, error, disabled, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const selectedOption = options.find(option => option.value === selectedValue);

    return (
      <div className={`relative ${className}`}>
        <div
          className={`
            relative w-full px-3 py-3 text-left bg-white border rounded-lg cursor-pointer
            transition-colors duration-200 min-h-[48px] flex items-center
            ${error 
              ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' 
              : 'border-gray-300 hover:border-gray-400 focus-within:border-black focus-within:ring-2 focus-within:ring-black/10'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:bg-gray-50'}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`block truncate ${selectedOption ? 'text-black' : 'text-gray-500'}`}>
            {selectedOption?.label || placeholder || 'Select an option'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`
                    px-3 py-3 cursor-pointer transition-colors duration-150
                    ${selectedValue === option.value 
                      ? 'bg-black text-white' 
                      : 'text-gray-900 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </>
        )}

        <select
          ref={ref}
          value={selectedValue}
          onChange={(e) => handleSelect(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;