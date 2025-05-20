/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display */
  error?: string;
  /** Whether the input is in a loading state */
  isLoading?: boolean;
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, isLoading, startIcon, endIcon, disabled, id, ...props }, ref) => {
    // Generate a unique ID for the input if not provided
    const inputId = id || React.useId();

    // Generate an ID for the error message if there is an error
    const errorId = error ? `${inputId}-error` : undefined;

    // Determine if input is disabled (either explicitly or due to loading)
    const isDisabled = disabled || isLoading;

    return (
      <div className="relative">
        {startIcon && (
          <div
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            aria-hidden="true"
          >
            {startIcon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            error && 'border-destructive focus-visible:ring-destructive',
            startIcon && 'pl-10',
            endIcon && 'pr-10',
            className
          )}
          ref={ref}
          disabled={isDisabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          {...props}
        />

        {endIcon && (
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            aria-hidden="true"
          >
            {endIcon}
          </div>
        )}

        {error && (
          <div id={errorId} className="mt-1 text-sm text-destructive" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
