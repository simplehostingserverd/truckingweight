'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';

  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Optional icon to display before the button text
   */
  icon?: React.ReactNode;

  /**
   * Optional icon to display after the button text
   */
  trailingIcon?: React.ReactNode;

  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;

  /**
   * Text to display when loading
   */
  loadingText?: string;
}

/**
 * Primary UI component for user interaction
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      trailingIcon,
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine the CSS classes based on the variant and size
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      link: 'btn-link',
    };

    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    };

    // Combine all classes
    const buttonClasses = cn(
      'btn',
      variantClasses[variant],
      sizeClasses[size],
      isLoading && 'opacity-70 pointer-events-none',
      className
    );

    // Loading spinner SVG
    const LoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );

    return (
      <button ref={ref} className={buttonClasses} disabled={disabled || isLoading} {...props}>
        {isLoading ? (
          <>
            <LoadingSpinner />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
            {trailingIcon && <span className="ml-2">{trailingIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
