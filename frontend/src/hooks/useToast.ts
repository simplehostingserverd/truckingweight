'use client';

import { useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
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

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      type: options.type || 'info',
      duration: options.duration || DEFAULT_TOAST_DURATION,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-dismiss toast after duration
    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);

    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const dismissAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods for different toast types
  const success = (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'success' });
  const error = (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'error' });
  const warning = (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'warning' });
  const info = (options: Omit<ToastOptions, 'type'>) => toast({ ...options, type: 'info' });

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
