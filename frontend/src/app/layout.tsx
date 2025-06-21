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
import FontLoader from '@/components/FontLoader';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Load Inter font from Google Fonts with optimizations for low-memory devices
// This uses next/font to:
// 1. Automatically self-host the font files (no external requests)
// 2. Optimize font loading and prevent layout shifts
// 3. Provide system font fallbacks for low-memory devices
// 4. Reduce memory usage by loading only what's needed
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: true,
});

export const metadata: Metadata = {
  title: 'CargoScalePro - Professional Truck Weight Management System',
  description:
    'CargoScalePro: Advanced weight management and compliance system for trucking companies. Manage scales, loads, drivers, and ensure DOT compliance with real-time monitoring.',
  manifest: '/manifest.json',
  icons: {
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CargoScalePro',
  },
  authors: [{ name: 'Michael Anthony Trevino Jr.', url: 'https://cargoscalepro.com' }],
  creator: 'Michael Anthony Trevino Jr.',
  publisher: 'Cosmo Exploit Group LLC',
  keywords: [
    'trucking',
    'weight management',
    'logistics',
    'compliance',
    'fleet management',
    'DOT',
    'cargo scale',
    'truck weighing',
  ],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'CargoScalePro - Professional Truck Weight Management',
    description: 'Advanced weight management and compliance system for trucking companies',
    siteName: 'CargoScalePro',
    url: 'https://cargoscalepro.com',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#0D2B4B', // Deep Blue from our design system
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="CargoScalePro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CargoScalePro" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0D2B4B" />
        <meta name="copyright" content="© 2025 Cosmo Exploit Group LLC. All Rights Reserved." />
        <meta name="author" content="Michael Anthony Trevino Jr." />

        {/* Preconnect to Cesium CDN for performance */}
        <link rel="preconnect" href="https://cesium.com" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <FontLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
