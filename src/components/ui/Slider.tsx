'use client';

import { forwardRef, useState, useEffect } from 'react';

interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  formatValue?: (value: number) => string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    value = 0, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1,
    label,
    disabled, 
    className,
    name,
    formatValue
  }, ref) => {
    const [currentValue, setCurrentValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
      setCurrentValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value);
      setCurrentValue(newValue);
      onChange?.(newValue);
    };

    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}: <span className="font-bold text-black">
              {formatValue ? formatValue(currentValue) : currentValue}
            </span>
          </label>
        )}
        
        <div className="relative">
          {/* Track */}
          <div className="relative w-full h-3 bg-gray-200 rounded-full">
            {/* Progress */}
            <div 
              className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
            
            {/* Thumb */}
            <div
              className={`
                absolute top-1/2 w-5 h-5 bg-black rounded-full shadow-md
                transform -translate-y-1/2 -translate-x-1/2 cursor-pointer
                transition-all duration-150
                ${isDragging ? 'scale-110 shadow-lg' : 'hover:scale-105'}
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              style={{ left: `${percentage}%` }}
            />
          </div>
          
          {/* Hidden input */}
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            disabled={disabled}
            name={name}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        
        {/* Min/Max labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;