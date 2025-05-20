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

import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  /** The content to trap focus within */
  children: React.ReactNode;
  /** Whether the focus trap is active */
  active?: boolean;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Whether to auto-focus the first focusable element when activated */
  autoFocus?: boolean;
  /** Whether to restore focus to the previously focused element when deactivated */
  restoreFocus?: boolean;
  /** Whether to include the initial tab stop */
  includeInitialTabStop?: boolean;
}

/**
 * FocusTrap component
 *
 * This component traps focus within its children when active, preventing users
 * from tabbing outside of the contained elements. This is useful for modals,
 * dialogs, and other overlay components.
 */
export function FocusTrap({
  children,
  active = true,
  onEscape,
  autoFocus = true,
  restoreFocus = true,
  includeInitialTabStop = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Save the currently focused element when the trap becomes active
  useEffect(() => {
    if (active && restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }
  }, [active, restoreFocus]);

  // Auto-focus the first focusable element when activated
  useEffect(() => {
    if (!active || !autoFocus || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, focus the container itself
      containerRef.current.focus();
    }
  }, [active, autoFocus]);

  // Restore focus when deactivated
  useEffect(() => {
    if (!active && restoreFocus && previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
    }
  }, [active, restoreFocus]);

  // Handle tab key to trap focus
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Only handle tab key
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current!);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element should wrap to last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element should wrap to first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onEscape]);

  // Prevent clicks outside from moving focus outside
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        event.preventDefault();
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [active]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      style={{ outline: 'none' }}
      data-focus-trap={active ? 'active' : 'inactive'}
    >
      {includeInitialTabStop && (
        <div tabIndex={0} aria-hidden="true" style={{ position: 'fixed', opacity: 0 }} />
      )}
      {children}
      {includeInitialTabStop && (
        <div tabIndex={0} aria-hidden="true" style={{ position: 'fixed', opacity: 0 }} />
      )}
    </div>
  );
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'area[href]',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
  ].join(',');

  return Array.from(container.querySelectorAll(selector)).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.offsetParent !== null
  );
}
