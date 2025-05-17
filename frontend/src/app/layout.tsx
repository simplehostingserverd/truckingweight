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

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import FontLoader from '@/components/FontLoader';

// Load Inter font from Google Fonts with fallback options
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: true,
});

export const metadata: Metadata = {
  title: 'Cosmo Exploit Group LLC - Weight Management System',
  description:
    'A proprietary weight management system by Cosmo Exploit Group LLC for trucking companies to manage weight checking and load management',
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
    title: 'Cosmo Weight Management',
  },
  authors: [{ name: 'Michael Anthony Trevino Jr.', url: 'https://cosmoexploitgroup.com' }],
  creator: 'Michael Anthony Trevino Jr.',
  publisher: 'Cosmo Exploit Group LLC',
  keywords: ['trucking', 'weight management', 'logistics', 'compliance', 'fleet management'],
  robots: 'noindex, nofollow',
  openGraph: {
    type: 'website',
    title: 'Cosmo Exploit Group LLC - Weight Management System',
    description: 'A proprietary weight management system for trucking companies',
    siteName: 'Cosmo Exploit Group LLC',
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
        <meta name="application-name" content="Cosmo Weight Management" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cosmo Weight Management" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0D2B4B" />
        <meta name="copyright" content="© 2025 Cosmo Exploit Group LLC. All Rights Reserved." />
        <meta name="author" content="Michael Anthony Trevino Jr." />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <FontLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
