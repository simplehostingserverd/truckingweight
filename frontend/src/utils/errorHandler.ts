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

import { useToastContext } from '@/providers/ToastProvider';
import logger from '@/utils/logger';

// Error types
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTH = "AUTH",
  VALIDATION = "VALIDATION",
  SERVER = "SERVER",
  DATABASE = "DATABASE",
  UNKNOWN = "UNKNOWN"
}

// Error interface
export interface AppError extends Error {
  type?: ErrorType;
  statusCode?: number;
  details?: unknown;
}

// Function to create a typed error
export function createError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  statusCode?: number,
  details?: unknown
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

// Type guard to check if error has name property
function hasName(error: unknown): error is { name: string } {
  return typeof error === 'object' && error !== null && 'name' in error;
}

// Type guard to check if error has message property
function hasMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error;
}

// Type guard to check if error has status properties
function hasStatus(error: unknown): error is { statusCode?: number; status?: number } {
  return typeof error === 'object' && error !== null && ('statusCode' in error || 'status' in error);
}

// Type guard to check if error has details/data properties
function hasDetails(error: unknown): error is { details?: unknown; data?: unknown } {
  return typeof error === 'object' && error !== null && ('details' in error || 'data' in error);
}

// Type guard to check if error has code property
function hasCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: unknown }).code === 'string';
}

// Type guard to check if error has Supabase error properties
function hasSupabaseError(error: unknown): error is { error_description?: string; error?: string; code?: string; status?: number } {
  return typeof error === 'object' && error !== null && ('error_description' in error || 'error' in error);
}

// Function to handle API errors
export function handleApiError(error: unknown): AppError {
  // Network errors
  if (hasName(error) && error.name === 'AbortError') {
    return createError('Request was aborted', ErrorType.NETWORK);
  }

  if (hasName(error) && hasMessage(error) && error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return createError('Network error. Please check your connection.', ErrorType.NETWORK);
  }

  // Handle response errors
  if (hasStatus(error)) {
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
      const message = hasMessage(error) ? error.message : 'Invalid data provided. Please check your input.';
      const details = hasDetails(error) ? (error.details || error.data) : undefined;
      return createError(
        message,
        ErrorType.VALIDATION,
        statusCode,
        details
      );
    }

    // Server errors
    if (statusCode >= 500) {
      return createError('Server error. Please try again later.', ErrorType.SERVER, statusCode);
    }
  }

  // Database errors
  if (hasCode(error) && (error.code.startsWith('PGDB') || (hasMessage(error) && error.message.includes('database')))) {
    const details = hasDetails(error) ? error.details : undefined;
    return createError(
      'Database error. Please try again later.',
      ErrorType.DATABASE,
      500,
      details
    );
  }

  // Supabase errors
  if (hasSupabaseError(error)) {
    const message = error.error_description || (hasMessage(error) ? error.message : 'An error occurred');
    const errorType = error.code === 'PGRST' ? ErrorType.DATABASE : ErrorType.UNKNOWN;
    return createError(
      message,
      errorType,
      error.status || 500,
      error
    );
  }

  // Default unknown error
  const message = hasMessage(error) ? error.message : 'An unexpected error occurred';
  const statusCode = hasStatus(error) ? (error.statusCode || error.status || 500) : 500;
  const details = hasDetails(error) ? (error.details || error.data) : undefined;
  
  return createError(
    message,
    ErrorType.UNKNOWN,
    statusCode,
    details
  );
}

// Hook to use error handling with toast
export function useErrorHandler() {
  const toast = useToastContext();

  const handleError = (error: unknown, context?: string) => {
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
