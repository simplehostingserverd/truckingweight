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
 *
 * Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
 */

'use client';

import React from 'react';
import { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { initializeLicenseVerification } from '@/utils/license-verification';
import { initializeSecurity } from '@/utils/security';

export function Providers({ children }) {
  useEffect(() => {
    // Initialize security features
    initializeSecurity();

    // Initialize license verification
    initializeLicenseVerification();

    // Add attribution comment to console
    console.log(
      '%c© 2025 Cosmo Exploit Group LLC. All Rights Reserved.\n' +
        'Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer',
      'color: #3b82f6; font-weight: bold; font-size: 12px;'
    );

    // Add warning message
    console.log(
      '%cWARNING: This is a proprietary application.\n' +
        'Unauthorized access, copying, or modification is strictly prohibited.',
      'color: #ef4444; font-weight: bold; font-size: 14px;'
    );
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
