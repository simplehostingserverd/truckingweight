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

import { NextRequest, NextResponse } from 'next/server';

// hCaptcha verification endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    // Verify the token with hCaptcha's API
    try {
      const verificationResponse = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: process.env.HCAPTCHA_SECRET_KEY || '0x0000000000000000000000000000000000000000',
          response: token,
          // If you have a temporary subdomain, you can add it here
          // sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY
        }),
      });

      const data = await verificationResponse.json();

      // Log verification response for debugging
      console.log('hCaptcha verification response:', data);

      if (!data.success) {
        // If we're using the test keys, always return success
        if (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001') {
          console.log('Using test keys, bypassing verification');
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({
          success: false,
          error: 'Invalid captcha',
          details: data['error-codes']
        }, { status: 400 });
      }

      // Verification successful
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify captcha' },
      { status: 500 }
    );
  }
}
