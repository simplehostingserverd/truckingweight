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

/**
 * Utility functions for formatting values
 */

/**
 * Format a distance in meters to a human-readable string
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const miles = meters / 1609.34;

  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }

  return `${Math.round(miles)} mi`;
}

/**
 * Format a duration in seconds to a human-readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} hr ${minutes} min`;
}

/**
 * Format a weight value to a human-readable string
 * @param weight Weight value (can be number or string)
 * @param unit Unit of measurement (default: 'lbs')
 * @returns Formatted weight string
 */
export function formatWeight(weight: number | string, unit: 'lbs' | 'kg' = 'lbs'): string {
  let numericWeight: number;

  if (typeof weight === 'string') {
    // Remove any non-numeric characters except decimal point
    numericWeight = parseFloat(weight.replace(/[^\d.]/g, ''));
  } else {
    numericWeight = weight;
  }

  if (isNaN(numericWeight)) {
    return '0 ' + unit;
  }

  // Format with commas for thousands
  return numericWeight.toLocaleString() + ' ' + unit;
}

/**
 * Format a date to a human-readable string
 * @param date Date to format
 * @param includeTime Whether to include time
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, includeTime: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format a currency value
 * @param value Value to format
 * @param currency Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format a percentage value
 * @param value Value to format (0-1)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a phone number
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid US phone number
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phone;
}

/**
 * Format a file size
 * @param bytes Size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncate text to a specified length
 * @param text Text to truncate
 * @param length Maximum length
 * @param suffix Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) {
    return text;
  }

  return text.substring(0, length) + suffix;
}

/**
 * Format a number with commas for thousands
 * @param value Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

const formatters = {
  formatDistance,
  formatDuration,
  formatWeight,
  formatDate,
  formatCurrency,
  formatPercentage,
  formatPhoneNumber,
  formatFileSize,
  truncateText,
  formatNumber,
};

export default formatters;
