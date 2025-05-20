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
  /** Whether the focus trap is active */
  active?: boolean;
  /** The children to render */
  children: React.ReactNode;
  /** Function to call when the user tries to escape the focus trap */
  onEscape?: () => void;
  /** Whether to auto-focus the first focusable element when the trap becomes active */
  autoFocus?: boolean;
  /** Whether to restore focus to the previously focused element when the trap is deactivated */
  restoreFocus?: boolean;
}

/**
 * FocusTrap component
 * 
 * This component traps focus within its children when active, preventing users
 * from tabbing outside of the contained elements. This is useful for modals,
 * dialogs, and other overlay components.
 */
export function FocusTrap({
  active = true,
  children,
  onEscape,
  autoFocus = true,
  restoreFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element when the trap becomes active
  useEffect(() => {
    if (active && restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }
  }, [active, restoreFocus]);

  // Restore focus when the trap is deactivated
  useEffect(() => {
    if (!active && restoreFocus && previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
    }
  }, [active, restoreFocus]);

  // Auto-focus the first focusable element when the trap becomes active
  useEffect(() => {
    if (active && autoFocus && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [active, autoFocus]);

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

      // Get all focusable elements
      const focusableElements = Array.from(
        containerRef.current!.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If shift+tab on first element, move to last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } 
      // If tab on last element, move to first element
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

  return (
    <div ref={containerRef} style={{ outline: 'none' }}>
      {children}
    </div>
  );
}
