import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import localFont from 'next/font/local';
import FontLoader from '@/components/FontLoader';

// Load Inter font from Google Fonts with fallback options
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: true, // Automatically adjust the font fallback
});

// Load local fallback font
const interLocalFallback = localFont({
  src: [
    {
      path: '../../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter-local',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TruckingWeight - Precision Weighing for Modern Trucking',
  description:
    'An advanced trucking weight management system with real-time weight capture, AI analytics, and compliance features',
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
    title: 'TruckingWeight',
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
        <meta name="application-name" content="TruckingWeight" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TruckingWeight" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0D2B4B" />
      </head>
      <body className={`${inter.variable} ${interLocalFallback.variable} font-sans`}>
        <FontLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
