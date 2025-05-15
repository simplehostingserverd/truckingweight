import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(props) {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to Google Fonts with DNS prefetch for faster resolution */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preconnect to Cesium CDN */}
        <link rel="preconnect" href="https://cesium.com" />

        {/*
          We're not loading the font directly here anymore.
          Instead, we're using next/font/google in layout.tsx which handles:
          - Font optimization
          - Removing external network requests
          - Stability (no layout shift)
          - Local font fallback
        */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
