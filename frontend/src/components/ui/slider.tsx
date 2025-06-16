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

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * The value of the slider as an array of numbers
   */
  value?: number[];

  /**
   * The default value of the slider
   */
  defaultValue?: number[];

  /**
   * Callback when the value changes
   */
  onValueChange?: (value: number[]) => void;

  /**
   * The minimum value
   */
  min?: number;

  /**
   * The maximum value
   */
  max?: number;

  /**
   * The step increment
   */
  step?: number;

  /**
   * Whether the slider is disabled
   */
  disabled?: boolean;

  /**
   * The orientation of the slider
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Slider component for selecting a value within a range
 */
const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue = [0],
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      orientation = 'horizontal',
      id,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = React.useCallback(
      (newValue: number[]) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      
      const newValue = Number(event.target.value);
      handleValueChange([newValue]);
    };

    const percentage = ((currentValue[0] - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          orientation === 'vertical' && 'h-full w-4 flex-col',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'relative w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
            orientation === 'horizontal' ? 'h-2' : 'w-2 h-full'
          )}
        >
          <div
            className={cn(
              'absolute bg-primary transition-all',
              orientation === 'horizontal'
                ? 'h-full left-0 top-0'
                : 'w-full bottom-0 left-0'
            )}
            style={{
              [orientation === 'horizontal' ? 'width' : 'height']: `${percentage}%`,
            }}
          />
        </div>
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          onChange={handleInputChange}
          disabled={disabled}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed',
            orientation === 'vertical' && 'writing-mode-vertical-lr'
          )}
          aria-label={props['aria-label']}
        />
        <div
          className={cn(
            'absolute block h-5 w-5 rounded-full border-2 border-primary bg-white shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            orientation === 'horizontal' ? 'top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'
          )}
          style={{
            [orientation === 'horizontal' ? 'left' : 'bottom']: `calc(${percentage}% - 10px)`,
          }}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
