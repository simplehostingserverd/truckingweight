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
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AccordionContext = React.createContext<{
  value: string | string[] | undefined;
  onValueChange: ((value: string) => void) | undefined;
  type: 'single' | 'multiple';
  collapsible: boolean;
}>({
  value: undefined,
  onValueChange: undefined,
  type: 'single',
  collapsible: false,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      type = 'single',
      collapsible = false,
      value,
      defaultValue,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      defaultValue || (type === 'multiple' ? [] : '')
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleValueChange = React.useCallback(
      (itemValue: string) => {
        if (onValueChange) {
          onValueChange(itemValue);
          return;
        }

        if (type === 'single') {
          setInternalValue(internalValue === itemValue && collapsible ? '' : itemValue);
        } else {
          setInternalValue(prev => {
            if (Array.isArray(prev)) {
              return prev.includes(itemValue)
                ? prev.filter(v => v !== itemValue)
                : [...prev, itemValue];
            }
            return [itemValue];
          });
        }
      },
      [collapsible, internalValue, onValueChange, type]
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const contextValue = React.useMemo(
      () => ({
        value: value !== undefined ? value : internalValue,
        onValueChange: handleValueChange,
        type,
        collapsible,
      }),
      [value, internalValue, handleValueChange, type, collapsible]
    );

    return (
      <AccordionContext.Provider value={contextValue}>
        <div ref={ref} className={cn('space-y-1', className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = 'Accordion';

// Create a context for AccordionItem to pass value to its children
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AccordionItemContext = React.createContext<{ value: string } | null>(null);

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const context = React.useContext(AccordionContext);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isExpanded =
      context.type === 'single'
        ? context.value === value
        : Array.isArray(context.value) && context.value.includes(value);

    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div
          ref={ref}
          data-state={isExpanded ? 'open' : 'closed'}
          className={cn('border-b', className)}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const itemContext = React.useContext(AccordionItemContext);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accordionContext = React.useContext(AccordionContext);

    if (!itemContext) {
      throw new Error('AccordionTrigger must be used within an AccordionItem');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isExpanded =
      accordionContext.type === 'single'
        ? accordionContext.value === itemContext.value
        : Array.isArray(accordionContext.value) &&
          accordionContext.value.includes(itemContext.value);

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={isExpanded}
        className={cn(
          'flex w-full items-center justify-between py-4 text-sm font-medium transition-all hover:underline',
          className
        )}
        onClick={() => accordionContext.onValueChange?.(itemContext.value)}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const itemContext = React.useContext(AccordionItemContext);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accordionContext = React.useContext(AccordionContext);

    if (!itemContext) {
      throw new Error('AccordionContent must be used within an AccordionItem');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isExpanded =
      accordionContext.type === 'single'
        ? accordionContext.value === itemContext.value
        : Array.isArray(accordionContext.value) &&
          accordionContext.value.includes(itemContext.value);

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden text-sm transition-all',
          isExpanded ? 'animate-accordion-down' : 'animate-accordion-up',
          className
        )}
        style={{
          height: isExpanded ? 'auto' : '0',
          opacity: isExpanded ? 1 : 0,
        }}
        {...props}
      >
        <div className="pb-4 pt-0">{children}</div>
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';
