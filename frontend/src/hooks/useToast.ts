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

import React from 'react';
import { ToastType } from '@/components/ui/toast';
import { useCallback, useState } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
  onDismiss: (id: string) => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      type: options.type || 'info',
      duration: options.duration || DEFAULT_TOAST_DURATION,
    };

    setToasts(prevToasts => [...prevToasts, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback(
    (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'success' }),
    [toast]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const error = useCallback(
    (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'error' }),
    [toast]
  );

  const warning = useCallback(
    (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'warning' }),
    [toast]
  );

  const info = useCallback(
    (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'info' }),
    [toast]
  );

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
  };
}

export default useToast;
