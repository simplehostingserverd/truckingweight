'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /**
   * Label for the select
   */
  label?: string;

  /**
   * Helper text to display below the select
   */
  helperText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Options for the select
   */
  options: SelectOption[];

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Callback when the value changes
   */
  onChange?: (value: string) => void;
}

/**
 * Select component for forms
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, helperText, error, options, placeholder, onChange, id, disabled, ...props },
    ref
  ) => {
    // Generate a unique ID if one is not provided
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

    // Handle change event
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          className={cn(
            'form-select',
            error && 'border-alert-DEFAULT focus-visible:ring-alert-DEFAULT',
            className
          )}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map(option => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {(helperText || error) && (
          <p className={cn('text-xs', error ? 'text-alert-DEFAULT' : 'text-muted-foreground')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
