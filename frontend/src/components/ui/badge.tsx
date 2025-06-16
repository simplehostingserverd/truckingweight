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

import { cn } from '@/lib/utils';
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'alert' | 'destructive';
}

/**
 * Badge component for displaying status or labels
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    // Determine the CSS classes based on the variant
    const variantClasses = {
      primary: 'badge-primary',
      secondary: 'badge-secondary',
      outline: 'badge-outline',
      success: 'badge-success',
      warning: 'badge-warning',
      alert: 'badge-alert',
      destructive: 'badge-alert', // Use alert styling for destructive
    };

    return (
      <span ref={ref} className={cn('badge', variantClasses[variant], className)} {...props} />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export default Badge;
