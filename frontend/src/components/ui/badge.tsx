'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'alert';
}

/**
 * Badge component for displaying status or labels
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    // Determine the CSS classes based on the variant
    const variantClasses = {
      primary: 'badge-primary',
      secondary: 'badge-secondary',
      outline: 'badge-outline',
      success: 'badge-success',
      warning: 'badge-warning',
      alert: 'badge-alert',
    };

    return (
      <span ref={ref} className={cn('badge', variantClasses[variant], className)} {...props} />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
