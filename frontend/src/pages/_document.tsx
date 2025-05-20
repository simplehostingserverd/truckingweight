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

import { Head, Html, Main, NextScript } from 'next/document';

export default function Document(props) {
  return (
    <Html lang="en">
      <Head>
        {/*
          No need for Google Fonts preconnect links since we're using next/font/google
          which automatically self-hosts the fonts and eliminates external requests.
          This helps with performance and reduces memory usage on low-memory devices.
        */}

        {/* Preconnect to Cesium CDN */}
        <link rel="preconnect" href="https://cesium.com" />

        {/*
          We're using next/font/google in layout.tsx which handles:
          - Font optimization and self-hosting
          - Removing external network requests
          - Stability (no layout shift)
          - Local font fallback
          - Reduced memory usage
        */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
