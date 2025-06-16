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

// Cloudflare Pages Function to verify hCaptcha tokens
export async function onRequestPost(context) {
  try {
    // Get the request body
    const { token } = await context.request.json();

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Captcha token is required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get the hCaptcha secret key from environment variables
    const secret = context.env.HCAPTCHA_SECRET_KEY || '0x0000000000000000000000000000000000000000';

    // Verify the token with hCaptcha's API
    const verificationResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret,
        response: token,
        // If you have a temporary subdomain, you can add it here
        sitekey: context.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
      }),
    });

    const data = await verificationResponse.json();

    // Log verification response for debugging
    console.log('hCaptcha verification response:', data);

    if (!data.success) {
      // If we're using the test keys, always return success
      if (context.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001') {
        console.log('Using test keys, bypassing verification');
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid captcha',
          details: data['error-codes'],
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verification successful
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error verifying captcha:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
