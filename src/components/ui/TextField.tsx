"use client";

import { forwardRef, useState } from "react";

interface TextFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  name?: string;
}

const TextField = forwardRef<
  HTMLTextAreaElement | HTMLInputElement,
  TextFieldProps
>(
  (
    {
      value,
      onChange,
      placeholder,
      error,
      helperText,
      disabled,
      multiline = false,
      rows = 3,
      maxLength,
      className,
      onKeyDown,
      name,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [currentValue, setCurrentValue] = useState(value || "");

    const handleChange = (
      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      const newValue = e.target.value;
      setCurrentValue(newValue);
      onChange?.(newValue);
    };

    const baseClasses = `
      w-full px-3 py-3 text-black bg-white border rounded-lg
      transition-all duration-200 resize-none
      placeholder:text-gray-500
      ${
        focused
          ? error
            ? "border-red-500 ring-2 ring-red-200"
            : "border-black ring-2 ring-black/10"
          : error
          ? "border-red-500"
          : "border-gray-300 hover:border-gray-400"
      }
      ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : ""}
      ${className}
    `;

    const Component = multiline ? "textarea" : "input";

    return (
      <div className="w-full">
        <div className="relative">
          <Component
            ref={ref as React.Ref<HTMLTextAreaElement & HTMLInputElement>}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={multiline ? rows : undefined}
            name={name}
            className={baseClasses}
          />

          {/* Character counter for multiline with maxLength */}
          {multiline && maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none">
              {currentValue.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Helper text or error message */}
        {(helperText || (multiline && maxLength)) && (
          <div className="flex justify-between items-center mt-1">
            {helperText && (
              <p
                className={`text-sm ${
                  error ? "text-red-600" : "text-gray-600"
                }`}
              >
                {helperText}
              </p>
            )}
            {multiline && maxLength && !helperText && (
              <span className="text-xs text-gray-500 ml-auto">
                {currentValue.length}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
