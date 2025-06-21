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
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to add a hover effect to the card
   */
  hoverable?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card', hoverable && 'transition-shadow hover:shadow-md', className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('card-header', className)} {...props} />;
  }
);
CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return <h3 ref={ref} className={cn('card-title', className)} {...props} />;
  }
);
CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn('card-description', className)} {...props} />;
  }
);
CardDescription.displayName = 'CardDescription';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('card-content', className)} {...props} />;
  }
);
CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('card-footer', className)} {...props} />;
  }
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
