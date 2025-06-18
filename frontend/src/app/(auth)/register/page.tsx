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

import EmailValidationFeedback from '@/components/ui/EmailValidationFeedback';
import { createClient } from '@/utils/supabase/client';
import { validateEmail } from '@/utils/validation/emailValidator';
import React from 'react';
// import HCaptcha from '@hcaptcha/react-hcaptcha'; // TEMPORARILY DISABLED
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scaleWeight, setScaleWeight] = useState(0);
  const [truckPosition, setTruckPosition] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState('');
  const canvasRef = useRef(null);
  // const captchaRef = useRef<HCaptcha>(null); // TEMPORARILY DISABLED
  const router = useRouter();
  const supabase = createClient();

  // Calculate form progress whenever form fields change
  useEffect(() => {
    let progress = 0;
    if (name) progress += 25;
    if (companyName) progress += 25;
    if (email) progress += 25;
    if (password) progress += 25;

    setFormProgress(progress);

    // Update truck position based on form progress
    setTruckPosition(progress / 100);

    // Update scale weight based on form progress
    setScaleWeight(Math.round((progress / 100) * 80000)); // Max weight 80,000 lbs (legal limit)
  }, [name, companyName, email, password]);

  // Draw the truck scale animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scale platform
    ctx.fillStyle = '#374151'; // Gray-700
    ctx.fillRect(50, canvas.height - 100, canvas.width - 100, 20);

    // Draw scale supports
    ctx.fillStyle = '#1F2937'; // Gray-800
    ctx.fillRect(70, canvas.height - 80, 30, 80);
    ctx.fillRect(canvas.width - 150, canvas.height - 80, 30, 80);

    // Draw scale display
    ctx.fillStyle = '#111827'; // Gray-900
    ctx.fillRect(canvas.width - 200, 50, 150, 100);

    // Draw scale display screen
    ctx.fillStyle = '#10B981'; // Emerald-500
    ctx.fillRect(canvas.width - 190, 60, 130, 80);

    // Draw weight text
    ctx.fillStyle = '#F9FAFB'; // Gray-50
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${scaleWeight.toLocaleString()} lbs`, canvas.width - 125, 100);

    // Draw compliance status
    let complianceStatus = 'Empty';
    let statusColor = '#9CA3AF'; // Gray-400

    if (scaleWeight > 0) {
      complianceStatus = 'Compliant';
      statusColor = '#10B981'; // Emerald-500
    }
    if (scaleWeight > 70000) {
      complianceStatus = 'Warning';
      statusColor = '#F59E0B'; // Amber-500
    }
    if (scaleWeight > 80000) {
      complianceStatus = 'Overweight';
      statusColor = '#EF4444'; // Red-500
    }

    ctx.fillStyle = statusColor;
    ctx.font = '16px sans-serif';
    ctx.fillText(complianceStatus, canvas.width - 125, 130);

    // Draw truck
    const truckX = 50 + (canvas.width - 200) * truckPosition;

    // Truck cab
    ctx.fillStyle = '#4F46E5'; // Indigo-600
    ctx.fillRect(truckX, canvas.height - 140, 60, 40);

    // Truck windshield
    ctx.fillStyle = '#C7D2FE'; // Indigo-200
    ctx.fillRect(truckX + 45, canvas.height - 135, 10, 20);

    // Truck trailer
    ctx.fillStyle = '#6366F1'; // Indigo-500
    ctx.fillRect(truckX + 60, canvas.height - 130, 90, 30);

    // Truck wheels
    ctx.fillStyle = '#1F2937'; // Gray-800
    ctx.beginPath();
    ctx.arc(truckX + 20, canvas.height - 100, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(truckX + 40, canvas.height - 100, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(truckX + 80, canvas.height - 100, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(truckX + 100, canvas.height - 100, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(truckX + 120, canvas.height - 100, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw progress bar
    ctx.fillStyle = '#E5E7EB'; // Gray-200
    ctx.fillRect(50, 20, canvas.width - 100, 10);

    ctx.fillStyle = '#4F46E5'; // Indigo-600
    ctx.fillRect(50, 20, (canvas.width - 100) * (formProgress / 100), 10);
  }, [truckPosition, scaleWeight, formProgress]);

  // hCaptcha event handlers
  const onCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setCaptchaError('');
  };

  const onCaptchaError = (err: Error) => {
    console.error('hCaptcha error:', err);
    setCaptchaError('Captcha verification failed. Please try again.');
    setCaptchaToken(null);
  };

  const onCaptchaExpire = () => {
    setCaptchaToken(null);
    setCaptchaError('Captcha expired. Please verify again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate captcha - TEMPORARILY DISABLED
    // if (!captchaToken) {
    //   setError('Please complete the captcha verification');
    //   setIsLoading(false);
    //   return;
    // }

    // Validate email before submission
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid || emailValidation.isDisposable) {
      setError(emailValidation.message);
      setIsLoading(false);
      return;
    }

    // Verify captcha token - TEMPORARILY DISABLED
    /*
    try {
      const captchaResponse = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: captchaToken }),
      });

      const captchaData = await captchaResponse.json();

      if (!captchaData.success) {
        setError('Captcha verification failed. Please try again.');
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
        setIsLoading(false);
        return;
      }
    } catch (captchaErr) {
      console.error('Captcha verification error:', captchaErr);
      setError('Captcha verification failed. Please try again.');
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      setIsLoading(false);
      return;
    }
    */

    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // 2. Create company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: companyName,
            contact_email: email,
          },
        ])
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      // 3. Create user record with company association
      const { error: userError } = await supabase.from('users').insert([
        {
          id: authData.user?.id,
          name,
          email,
          company_id: companyData.id,
          is_admin: true, // First user is admin
        },
      ]);

      if (userError) {
        throw userError;
      }

      // Redirect to login page
      router.push('/login?registered=true');
    } catch (err: unknown) {
      setError(err.message || 'An error occurred during registration');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Left side - Animated Truck Scale */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gray-800 z-0"></div>
        <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full"></canvas>

        {/* Stats overlays similar to the login page */}
        <div className="absolute top-1/4 right-1/4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 z-20 text-white">
          <div className="text-sm text-gray-400">Registration Progress</div>
          <div className="text-2xl font-bold">{formProgress}%</div>
          <div className="flex items-center mt-2">
            <div className="h-1 w-24 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/4 left-1/4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 z-20 text-white">
          <div className="text-sm text-gray-400">Scale Weight</div>
          <div className="text-2xl font-bold">{scaleWeight.toLocaleString()} lbs</div>
          <div className="flex items-center mt-2">
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  scaleWeight > 80000
                    ? 'bg-red-500'
                    : scaleWeight > 70000
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (scaleWeight / 80000) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account 🚚</h1>
            <p className="text-gray-400">
              Register your trucking company and start managing your fleet
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-500/20 border border-red-500/50">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="company-name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Company Name
              </label>
              <input
                id="company-name"
                name="company-name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your company name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <EmailValidationFeedback email={email} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {/* hCaptcha component - TEMPORARILY DISABLED */}
            {/*
            <div className="flex justify-center">
              <HCaptcha
                sitekey={
                  process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ||
                  '10000000-ffff-ffff-ffff-000000000001'
                }
                onVerify={_onCaptchaVerify}
                onError={_onCaptchaError}
                onExpire={_onCaptchaExpire}
                ref={captchaRef}
                theme="dark"
                size="normal"
              />
            </div>

            {captchaError && <div className="text-red-500 text-sm text-center">{captchaError}</div>}
            */}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-white font-medium transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                aria-label="Follow us on Twitter"
                className="flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </button>
              <button
                type="button"
                aria-label="View our GitHub repository"
                className="flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </button>
              <button
                type="button"
                aria-label="Follow us on Facebook"
                className="flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
