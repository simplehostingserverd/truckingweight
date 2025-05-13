'use client';

import { useToastContext } from '@/providers/ToastProvider';
import logger from '@/utils/logger';

// Error types
export enum ErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  SERVER = 'server',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}

// Error interface
export interface AppError extends Error {
  type?: ErrorType;
  statusCode?: number;
  details?: any;
}

// Function to create a typed error
export function createError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  statusCode?: number,
  details?: any
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

// Function to handle API errors
export function handleApiError(error: any): AppError {
  // Network errors
  if (error.name === 'AbortError') {
    return createError('Request was aborted', ErrorType.NETWORK);
  }

  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return createError('Network error. Please check your connection.', ErrorType.NETWORK);
  }

  // Handle response errors
  if (error.statusCode || error.status) {
    const statusCode = error.statusCode || error.status;

    // Auth errors
    if (statusCode === 401) {
      return createError(
        'Authentication required. Please log in again.',
        ErrorType.AUTH,
        statusCode
      );
    }

    if (statusCode === 403) {
      return createError(
        'You do not have permission to perform this action.',
        ErrorType.AUTH,
        statusCode
      );
    }

    // Validation errors
    if (statusCode === 400 || statusCode === 422) {
      return createError(
        error.message || 'Invalid data provided. Please check your input.',
        ErrorType.VALIDATION,
        statusCode,
        error.details || error.data
      );
    }

    // Server errors
    if (statusCode >= 500) {
      return createError('Server error. Please try again later.', ErrorType.SERVER, statusCode);
    }
  }

  // Database errors
  if (error.code && (error.code.startsWith('PGDB') || error.message?.includes('database'))) {
    return createError(
      'Database error. Please try again later.',
      ErrorType.DATABASE,
      500,
      error.details
    );
  }

  // Supabase errors
  if (error.error_description || error.error) {
    return createError(
      error.error_description || error.message || 'An error occurred',
      error.code === 'PGRST' ? ErrorType.DATABASE : ErrorType.UNKNOWN,
      error.status || 500,
      error
    );
  }

  // Default unknown error
  return createError(
    error.message || 'An unexpected error occurred',
    ErrorType.UNKNOWN,
    error.statusCode || error.status || 500,
    error.details || error.data
  );
}

// Hook to use error handling with toast
export function useErrorHandler() {
  const toast = useToastContext();

  const handleError = (error: any, context?: string) => {
    const appError = handleApiError(error);

    // Log the error
    logger.error(appError.message, {
      type: appError.type,
      statusCode: appError.statusCode,
      details: appError.details,
      context,
    });

    // Show toast notification
    toast.error({
      title: getErrorTitle(appError),
      description: appError.message,
    });

    return appError;
  };

  return { handleError };
}

// Helper function to get error title based on type
function getErrorTitle(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Network Error';
    case ErrorType.AUTH:
      return 'Authentication Error';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.SERVER:
      return 'Server Error';
    case ErrorType.DATABASE:
      return 'Database Error';
    default:
      return 'Error';
  }
}
