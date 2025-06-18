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

import React from 'react';

interface ThermometerIconProps {
  className?: string;
  'aria-hidden'?: boolean;
}

/**
 * Custom Thermometer Icon component that matches Heroicons style
 * Created to replace the non-existent ThermometerIcon from Heroicons
 */
export default function ThermometerIcon({ className = 'h-6 w-6', ...props }: ThermometerIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v6.75m0 0a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5ZM12 9.75V21m-3.75-9.75h7.5M8.25 15h7.5M8.25 18h7.5"
      />
    </svg>
  );
}
